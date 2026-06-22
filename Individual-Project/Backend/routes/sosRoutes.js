const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const { body } = require('express-validator')
const sosController = require('../controllers/sosController')

router.post(
  '/',
  protect,
  authorize('tourist'),
  [
    body('emergencyType').isIn(['medical', 'accident', 'theft', 'lost', 'harassment', 'natural-disaster', 'fire', 'other']),
    body('description').isString().notEmpty(),
    body('contactNumber').isString().notEmpty()
  ],
  sosController.createSOSAlert
)

router.get('/', protect, authorize('admin'), sosController.getSOSAlerts)

module.exports = router;
