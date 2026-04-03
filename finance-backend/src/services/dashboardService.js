const FinancialRecord = require('../models/FinancialRecord');

const activeFilter = { $match: { isDeleted: false } };

const getSummary = async () => {
  const result = await FinancialRecord.aggregate([
    activeFilter,
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  result.forEach((item) => {
    if (item._id === 'income') {
      totalIncome = item.total;
      incomeCount = item.count;
    } else if (item._id === 'expense') {
      totalExpenses = item.total;
      expenseCount = item.count;
    }
  });

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    incomeCount,
    expenseCount,
    totalRecords: incomeCount + expenseCount,
  };
};

const getCategorySummary = async () => {
  const result = await FinancialRecord.aggregate([
    activeFilter,
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { total: -1 },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
  ]);

  return result;
};

const getMonthlyTrends = async () => {
  const result = await FinancialRecord.aggregate([
    {
      $match: { isDeleted: false },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
  ]);

  return result;
};

const getWeeklyTrends = async () => {
  const result = await FinancialRecord.aggregate([
    {
      $match: { isDeleted: false },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          week: { $isoWeek: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.week': 1 },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        week: '$_id.week',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
  ]);

  return result;
};

const getRecentActivity = async (limit = 10) => {
  const records = await FinancialRecord.find({ isDeleted: false })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  return records;
};

module.exports = { getSummary, getCategorySummary, getMonthlyTrends, getWeeklyTrends, getRecentActivity };
