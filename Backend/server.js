const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');
const Booking = require('./models/Booking');
const TourRequest = require('./models/TourRequest');
const Message = require('./models/Message');
const { setIo } = require('./socket');
const { createNotification } = require('./utils/notificationService');
const { canChatOnBooking, canChatOnRequest, getConversationId, getRequestConversationId, isBookingParticipant, getChatRecipientId, getRequestChatRecipientId } = require('./utils/chat');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded files when Cloudinary isn't configured
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tours', require('./routes/tourRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/sos', require('./routes/sosRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TourMate API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 TourMate API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});

// Socket.IO for real-time features
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

setIo(io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || (socket.handshake.headers.authorization?.startsWith('Bearer ') ? socket.handshake.headers.authorization.split(' ')[1] : null);

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return next(new Error('Authentication required'));
    }

    socket.user = user;
    socket.join(String(user._id));
    next();
  } catch (error) {
    next(new Error('Authentication required'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-booking-room', async ({ bookingId }) => {
    try {
      const booking = await Booking.findById(bookingId);

      if (!booking || !isBookingParticipant(booking, socket.user) || !canChatOnBooking(booking)) {
        return socket.emit('booking-error', { message: 'Not authorized to join this conversation' });
      }

      const roomId = getConversationId(booking._id);
      socket.join(roomId);
      socket.emit('booking-room-joined', { bookingId: booking._id, roomId, recipientId: getChatRecipientId(booking, socket.user) });
    } catch (error) {
      socket.emit('booking-error', { message: 'Failed to join conversation' });
    }
  });

  socket.on('join-request-room', async ({ requestId, providerId }) => {
    try {
      const tourRequest = await TourRequest.findById(requestId);

      if (!tourRequest || !canChatOnRequest(tourRequest, socket.user, providerId)) {
        return socket.emit('booking-error', { message: 'Not authorized to join this conversation' });
      }

      const roomId = getRequestConversationId(tourRequest._id, providerId);
      socket.join(roomId);
      socket.emit('request-room-joined', { requestId: tourRequest._id, providerId, roomId, recipientId: getRequestChatRecipientId(tourRequest, socket.user, providerId) });
    } catch (error) {
      socket.emit('booking-error', { message: 'Failed to join conversation' });
    }
  });

  socket.on('send-booking-message', async ({ bookingId, message }) => {
    try {
      const booking = await Booking.findById(bookingId)
        .populate('tourist', 'name email avatar role')
        .populate('provider', 'name email avatar role');

      if (!booking || !isBookingParticipant(booking, socket.user) || !canChatOnBooking(booking)) {
        return socket.emit('booking-error', { message: 'Not authorized to send this message' });
      }

      const receiver = getChatRecipientId(booking, socket.user);
      if (!receiver) {
        return socket.emit('booking-error', { message: 'No chat recipient found' });
      }

      const conversationId = getConversationId(booking._id);
      const createdMessage = await Message.create({
        booking: booking._id,
        conversationId,
        sender: socket.user._id,
        receiver,
        message: String(message || '').trim(),
        messageType: 'text'
      });

      await createdMessage.populate('sender', 'name email avatar role');
      await createdMessage.populate('receiver', 'name email avatar role');

      io.to(conversationId).emit('booking-message:new', {
        conversationId,
        bookingId: booking._id,
        message: createdMessage
      });

      if (receiver && receiver.toString() !== socket.user._id.toString()) {
        await createNotification({
          recipient: receiver,
          sender: socket.user._id,
          type: 'system',
          title: 'New message received',
          message: `You received a new message regarding booking ${booking._id}.`,
          actionUrl: '/messages',
          metadata: { bookingId: booking._id, conversationId }
        });
      }
    } catch (error) {
      socket.emit('booking-error', { message: 'Failed to send message' });
    }
  });

  socket.on('send-request-message', async ({ requestId, providerId, message }) => {
    try {
      const tourRequest = await TourRequest.findById(requestId)
        .populate('tourist', 'name email avatar role')
        .populate('bids.provider', 'name email avatar role businessInfo');

      if (!tourRequest || !canChatOnRequest(tourRequest, socket.user, providerId)) {
        return socket.emit('booking-error', { message: 'Not authorized to send this message' });
      }

      const receiver = getRequestChatRecipientId(tourRequest, socket.user, providerId);
      if (!receiver) {
        return socket.emit('booking-error', { message: 'No chat recipient found' });
      }

      const conversationId = getRequestConversationId(tourRequest._id, providerId);
      const createdMessage = await Message.create({
        tourRequest: tourRequest._id,
        conversationId,
        chatType: 'request',
        sender: socket.user._id,
        receiver,
        message: String(message || '').trim(),
        messageType: 'text'
      });

      await createdMessage.populate('sender', 'name email avatar role');
      await createdMessage.populate('receiver', 'name email avatar role');

      io.to(conversationId).emit('request-message:new', {
        conversationId,
        requestId: tourRequest._id,
        providerId,
        message: createdMessage
      });

      if (receiver && receiver.toString() !== socket.user._id.toString()) {
        await createNotification({
          recipient: receiver,
          sender: socket.user._id,
          type: 'system',
          title: 'New message received',
          message: `You received a new message regarding tour request "${tourRequest.title}".`,
          actionUrl: '/messages',
          metadata: { requestId: tourRequest._id, providerId, conversationId }
        });
      }
    } catch (error) {
      socket.emit('booking-error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

module.exports = { app, io };
