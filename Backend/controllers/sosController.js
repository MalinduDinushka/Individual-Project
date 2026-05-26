const { validationResult } = require('express-validator')
const SOSAlert = require('../models/SOSAlert')
const User = require('../models/User')
const { getIo } = require('../socket')
const { createNotifications } = require('../utils/notificationService')

// Create SOS alert (tourist)
exports.createSOSAlert = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { location, emergencyType, description, contactNumber } = req.body

    if (!emergencyType || !description || !contactNumber) {
      return res.status(400).json({ success: false, message: 'emergencyType, description and contactNumber are required' })
    }

    const sos = await SOSAlert.create({
      tourist: req.user._id,
      location: location || {},
      emergencyType,
      description,
      contactNumber,
      status: 'active',
      priority: 'high'
    })

    const admins = await User.find({ role: 'admin', isActive: true }).select('_id')
    if (admins.length > 0) {
      await createNotifications(admins.map((admin) => admin._id), {
        sender: req.user._id,
        type: 'sos-created',
        title: 'New SOS alert',
        message: `${req.user.name || 'A traveler'} raised an SOS alert (${emergencyType}).`,
        actionUrl: '/admin/sos',
        metadata: { sosId: sos._id, emergencyType }
      })
    }

    // Emit to connected clients (admins/providers) that an SOS was created
    try {
      const io = getIo()
      if (io) {
        io.emit('sos:new', { sos })
      }
    } catch (emitErr) {
      console.warn('Failed to emit SOS socket event', emitErr.message)
    }

    res.status(201).json({ success: true, message: 'SOS alert created', data: { sos } })
  } catch (error) {
    console.error('Create SOS error:', error)
    res.status(500).json({ success: false, message: 'Failed to create SOS alert', error: error.message })
  }
}

// Get SOS alerts (admin)
exports.getSOSAlerts = async (req, res) => {
  try {
    const alerts = await SOSAlert.find().populate('tourist', 'name phone email avatar').sort('-createdAt')
    res.json({ success: true, data: { alerts, count: alerts.length } })
  } catch (error) {
    console.error('Get SOS alerts error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch SOS alerts', error: error.message })
  }
}
