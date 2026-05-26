const Notification = require('../models/Notification')

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatar role')
      .sort('-createdAt')
      .lean()

    const unreadCount = notifications.filter((notification) => !notification.read).length

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message })
  }
}

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    ).populate('sender', 'name avatar role')

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }

    res.json({ success: true, message: 'Notification marked as read', data: { notification } })
  } catch (error) {
    console.error('Mark notification read error:', error)
    res.status(500).json({ success: false, message: 'Failed to update notification', error: error.message })
  }
}

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true })
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Mark all notifications read error:', error)
    res.status(500).json({ success: false, message: 'Failed to update notifications', error: error.message })
  }
}

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id })

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }

    res.json({ success: true, message: 'Notification deleted successfully' })
  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({ success: false, message: 'Failed to delete notification', error: error.message })
  }
}