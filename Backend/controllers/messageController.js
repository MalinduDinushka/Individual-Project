const { validationResult } = require('express-validator');
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const TourRequest = require('../models/TourRequest');
const { getIo } = require('../socket');
const { createNotification } = require('../utils/notificationService');
const {
  canChatOnBooking,
  canChatOnRequest,
  getBookingQueryForUser,
  getConversationId,
  getRequestConversationId,
  isBookingParticipant,
  getChatRecipientId,
  getRequestChatRecipientId,
  normalizeBookingSnapshot
} = require('../utils/chat');

const populateMessage = async (message) => {
  await message.populate('sender', 'name email avatar role');
  await message.populate('receiver', 'name email avatar role');
  return message;
};

const dedupeConversations = (items) => {
  const byConversationId = new Map();

  for (const item of items) {
    if (!item?.conversationId) continue;

    const existing = byConversationId.get(item.conversationId);
    if (!existing) {
      byConversationId.set(item.conversationId, item);
      continue;
    }

    const existingTime = existing.latestMessage?.createdAt ? new Date(existing.latestMessage.createdAt).getTime() : 0;
    const nextTime = item.latestMessage?.createdAt ? new Date(item.latestMessage.createdAt).getTime() : 0;

    if (nextTime >= existingTime) {
      byConversationId.set(item.conversationId, item);
    }
  }

  return Array.from(byConversationId.values());
};

exports.getConversations = async (req, res) => {
  try {
    const bookings = await Booking.find(getBookingQueryForUser(req.user))
      .populate('tourist', 'name email avatar role')
      .populate('provider', 'name email avatar role')
      .sort('-updatedAt');

    const requestFilter = req.user.role === 'tourist'
      ? { tourist: req.user._id }
      : { 'bids.provider': req.user._id };

    const tourRequests = await TourRequest.find(requestFilter)
      .populate('tourist', 'name email avatar role')
      .populate('bids.provider', 'name email avatar role businessInfo')
      .sort('-updatedAt');

    const bookingConversations = await Promise.all(
      bookings.map(async (booking) => {
        const conversationId = getConversationId(booking._id);
        const latestMessage = await Message.findOne({ conversationId }).sort('-createdAt').populate('sender', 'name email avatar role').lean();
        const unreadCount = await Message.countDocuments({ conversationId, receiver: req.user._id, isRead: false });
        const otherUser = req.user.role === 'tourist' ? booking.provider : booking.tourist;

        return {
          booking: normalizeBookingSnapshot(booking),
          conversationId,
          otherUser,
          latestMessage,
          unreadCount,
          canChat: canChatOnBooking(booking)
        };
      })
    );

    const requestConversationsNested = await Promise.all(
      tourRequests.map(async (tourRequest) => {
        const bidProviders = req.user.role === 'tourist'
          ? (tourRequest.bids || []).filter((bid) => bid.provider)
          : (tourRequest.bids || []).filter((bid) => {
              const providerId = bid.provider?._id || bid.provider;
              return providerId && providerId.toString() === req.user._id.toString();
            });

        const conversations = await Promise.all(
          bidProviders.map(async (bid) => {
            const provider = bid.provider;
            const providerId = provider?._id || provider;
            const conversationId = getRequestConversationId(tourRequest._id, providerId);
            const latestMessage = await Message.findOne({ conversationId }).sort('-createdAt').populate('sender', 'name email avatar role').lean();
            const unreadCount = await Message.countDocuments({ conversationId, receiver: req.user._id, isRead: false });

            return {
              conversationKind: 'request',
              conversationId,
              request: {
                id: tourRequest._id,
                title: tourRequest.title,
                destinations: tourRequest.destinations,
                status: tourRequest.status,
                budget: tourRequest.budget,
                startDate: tourRequest.startDate,
                endDate: tourRequest.endDate
              },
              provider: provider ? {
                _id: providerId,
                name: provider.name,
                email: provider.email,
                avatar: provider.avatar,
                businessInfo: provider.businessInfo
              } : null,
              tourist: tourRequest.tourist,
              otherUser: req.user.role === 'tourist' ? provider : tourRequest.tourist,
              latestMessage,
              unreadCount,
              canChat: canChatOnRequest(tourRequest, req.user, providerId)
            };
          })
        );

        return conversations;
      })
    );

    const conversations = dedupeConversations([...bookingConversations, ...requestConversationsNested.flat()]);

    conversations.sort((a, b) => {
      const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
      const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    res.json({ success: true, data: { conversations } });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations', error: error.message });
  }
};

exports.getBookingMessages = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('tourist', 'name email avatar role')
      .populate('provider', 'name email avatar role');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!isBookingParticipant(booking, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this conversation' });
    }

    if (!canChatOnBooking(booking)) {
      return res.status(403).json({ success: false, message: 'Chat is available after the booking is confirmed' });
    }

    const conversationId = getConversationId(booking._id);

    await Message.updateMany(
      { conversationId, receiver: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email avatar role')
      .populate('receiver', 'name email avatar role')
      .sort('createdAt');

    res.json({
      success: true,
      data: {
        booking: normalizeBookingSnapshot(booking),
        conversationId,
        otherUser: getChatRecipientId(booking, req.user),
        messages
      }
    });
  } catch (error) {
    console.error('Get booking messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chat messages', error: error.message });
  }
};

exports.getRequestMessages = async (req, res) => {
  try {
    const { requestId, providerId } = req.params;
    const tourRequest = await TourRequest.findById(requestId)
      .populate('tourist', 'name email avatar role')
      .populate('bids.provider', 'name email avatar role businessInfo');

    if (!tourRequest) {
      return res.status(404).json({ success: false, message: 'Tour request not found' });
    }

    const provider = (tourRequest.bids || []).find((bid) => bid.provider && bid.provider.toString() === providerId)?.provider || providerId;

    if (!canChatOnRequest(tourRequest, req.user, providerId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this conversation' });
    }

    const conversationId = getRequestConversationId(tourRequest._id, providerId);

    await Message.updateMany(
      { conversationId, receiver: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email avatar role')
      .populate('receiver', 'name email avatar role')
      .sort('createdAt');

    res.json({
      success: true,
      data: {
        request: {
          id: tourRequest._id,
          title: tourRequest.title,
          destinations: tourRequest.destinations,
          status: tourRequest.status,
          budget: tourRequest.budget,
          startDate: tourRequest.startDate,
          endDate: tourRequest.endDate
        },
        provider,
        conversationId,
        otherUser: getRequestChatRecipientId(tourRequest, req.user, providerId),
        messages
      }
    });
  } catch (error) {
    console.error('Get request messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch request messages', error: error.message });
  }
};

exports.sendBookingMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.bookingId)
      .populate('tourist', 'name email avatar role')
      .populate('provider', 'name email avatar role');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!isBookingParticipant(booking, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages in this conversation' });
    }

    if (!canChatOnBooking(booking)) {
      return res.status(403).json({ success: false, message: 'Chat is available after the booking is confirmed' });
    }

    const receiver = getChatRecipientId(booking, req.user);
    if (!receiver) {
      return res.status(400).json({ success: false, message: 'No chat recipient found for this booking' });
    }

    const conversationId = getConversationId(booking._id);
    const messageText = req.body.message.trim();

    const message = await Message.create({
      booking: booking._id,
      conversationId,
      sender: req.user._id,
      receiver,
      message: messageText,
      messageType: 'text'
    });

    await populateMessage(message);

    const io = getIo();
    if (io) {
      io.to(conversationId).emit('booking-message:new', {
        conversationId,
        bookingId: booking._id,
        message
      });
    }

    if (receiver && receiver.toString() !== req.user._id.toString()) {
      try {
        await createNotification({
          recipient: receiver,
          sender: req.user._id,
          type: 'system',
          title: 'New message received',
          message: `You received a new message regarding booking ${booking._id}.`,
          actionUrl: '/messages',
          metadata: { bookingId: booking._id, conversationId }
        });
      } catch (notificationError) {
        console.error('Create booking message notification error:', notificationError);
      }
    }

    res.status(201).json({ success: true, message: 'Message sent', data: { message } });
  } catch (error) {
    console.error('Send booking message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

exports.sendRequestMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { requestId, providerId } = req.params;
    const tourRequest = await TourRequest.findById(requestId)
      .populate('tourist', 'name email avatar role')
      .populate('bids.provider', 'name email avatar role businessInfo');

    if (!tourRequest) {
      return res.status(404).json({ success: false, message: 'Tour request not found' });
    }

    if (!canChatOnRequest(tourRequest, req.user, providerId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages in this conversation' });
    }

    const receiver = getRequestChatRecipientId(tourRequest, req.user, providerId);
    if (!receiver) {
      return res.status(400).json({ success: false, message: 'No chat recipient found for this request' });
    }

    const conversationId = getRequestConversationId(tourRequest._id, providerId);
    const messageText = req.body.message.trim();

    const message = await Message.create({
      tourRequest: tourRequest._id,
      conversationId,
      chatType: 'request',
      sender: req.user._id,
      receiver,
      message: messageText,
      messageType: 'text'
    });

    await populateMessage(message);

    const io = getIo();
    if (io) {
      io.to(conversationId).emit('request-message:new', {
        conversationId,
        requestId: tourRequest._id,
        providerId,
        message
      });
    }

    if (receiver && receiver.toString() !== req.user._id.toString()) {
      try {
        await createNotification({
          recipient: receiver,
          sender: req.user._id,
          type: 'system',
          title: 'New message received',
          message: `You received a new message regarding tour request "${tourRequest.title}".`,
          actionUrl: '/messages',
          metadata: { requestId: tourRequest._id, providerId, conversationId }
        });
      } catch (notificationError) {
        console.error('Create request message notification error:', notificationError);
      }
    }

    res.status(201).json({ success: true, message: 'Message sent', data: { message } });
  } catch (error) {
    console.error('Send request message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};
