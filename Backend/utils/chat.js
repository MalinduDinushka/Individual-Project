const allowedChatStatuses = ['confirmed', 'in-progress', 'completed'];

const getConversationId = (bookingId) => `booking:${bookingId}`;
const getRequestConversationId = (requestId, providerId) => `request:${requestId}:${providerId}`;

const canChatOnBooking = (booking) => booking && allowedChatStatuses.includes(booking.status);

const getBookingQueryForUser = (user) => {
  if (user.role === 'tourist') {
    return { tourist: user._id, status: { $in: allowedChatStatuses } };
  }

  if (user.role === 'provider') {
    return { provider: user._id, status: { $in: allowedChatStatuses } };
  }

  return { status: { $in: allowedChatStatuses } };
};

const isBookingParticipant = (booking, user) => {
  if (!booking || !user) return false;

  if (user.role === 'tourist') {
    return booking.tourist?.toString() === user._id.toString();
  }

  if (user.role === 'provider') {
    return booking.provider?.toString() === user._id.toString();
  }

  return user.role === 'admin';
};

const getChatRecipientId = (booking, user) => {
  if (!booking || !user) return null;

  if (user.role === 'tourist') {
    return booking.provider || null;
  }

  if (user.role === 'provider') {
    return booking.tourist || null;
  }

  return null;
};

const getRequestChatRecipientId = (tourRequest, user, providerId) => {
  if (!tourRequest || !user) return null;

  if (user.role === 'tourist') {
    return providerId || null;
  }

  if (user.role === 'provider') {
    return tourRequest.tourist?._id || tourRequest.tourist || null;
  }

  return null;
};

const canChatOnRequest = (tourRequest, user, providerId) => {
  if (!tourRequest || !user || !providerId) return false;

  const touristId = tourRequest.tourist?._id || tourRequest.tourist;
  const providerIdString = providerId.toString();
  const hasBid = (tourRequest.bids || []).some((bid) => {
    const bidProviderId = bid.provider?._id || bid.provider;
    return bidProviderId && bidProviderId.toString() === providerIdString;
  });

  if (user.role === 'tourist') {
    return touristId?.toString() === user._id.toString() && hasBid;
  }

  if (user.role === 'provider') {
    return user._id.toString() === providerIdString && hasBid;
  }

  return false;
};

const normalizeBookingSnapshot = (booking) => ({
  id: booking._id,
  serviceName: booking.serviceSnapshot?.name || booking.service?.name || 'Service',
  serviceType: booking.serviceSnapshot?.type || booking.service?.type || '',
  bookingDate: booking.bookingDate,
  status: booking.status,
  paymentStatus: booking.paymentStatus,
  tourist: booking.tourist,
  provider: booking.provider,
  pricing: booking.pricing
});

module.exports = {
  allowedChatStatuses,
  getConversationId,
  getRequestConversationId,
  canChatOnBooking,
  canChatOnRequest,
  getBookingQueryForUser,
  isBookingParticipant,
  getChatRecipientId,
  getRequestChatRecipientId,
  normalizeBookingSnapshot
};
