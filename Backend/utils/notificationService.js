const Notification = require('../models/Notification')
const { getIo } = require('../socket')

const createNotification = async ({ recipient, sender, type = 'system', title, message, actionUrl, metadata = {} }) => {
  if (!recipient || !title || !message) {
    throw new Error('recipient, title, and message are required to create a notification')
  }

  const notification = await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    actionUrl,
    metadata
  })

  const io = getIo()
  if (io) {
    io.to(String(recipient)).emit('notification:new', { notification })
  }

  return notification
}

const createNotifications = async (recipients = [], payload) => {
  const created = []

  for (const recipient of recipients) {
    created.push(await createNotification({ recipient, ...payload }))
  }

  return created
}

module.exports = {
  createNotification,
  createNotifications
}