const express = require('express');
const router = express.Router();

const {
  getSummary,
  getCategorySummary,
  getTrends,
  getRecentActivity,
} = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.get('/summary', authenticate, getSummary);

router.get('/recent', authenticate, getRecentActivity);

router.get('/category-summary', authenticate, roleGuard('Analyst', 'Admin'), getCategorySummary);

router.get('/trends', authenticate, roleGuard('Analyst', 'Admin'), getTrends);

module.exports = router;
