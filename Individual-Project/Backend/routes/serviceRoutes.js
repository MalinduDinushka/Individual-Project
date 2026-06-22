const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const { getAllServices, getServiceById, createService } = require('../controllers/serviceController');

router.get('/', getAllServices);
router.get('/:id', getServiceById);

router.post(
  '/',
  protect,
  authorize('provider'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('pricing.amount').isNumeric().withMessage('Price is required')
  ],
  createService
);

module.exports = router;
