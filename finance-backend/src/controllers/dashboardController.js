const dashboardService = require('../services/dashboardService');

const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary();
    res.status(200).json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};

const getCategorySummary = async (req, res, next) => {
  try {
    const categories = await dashboardService.getCategorySummary();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const period = req.query.period === 'weekly' ? 'weekly' : 'monthly';

    const trends =
      period === 'weekly'
        ? await dashboardService.getWeeklyTrends()
        : await dashboardService.getMonthlyTrends();

    res.status(200).json({ success: true, period, trends });
  } catch (error) {
    next(error);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const records = await dashboardService.getRecentActivity(limit);
    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getCategorySummary, getTrends, getRecentActivity };
