const FinancialRecord = require('../models/FinancialRecord');
const ApiError = require('../utils/ApiError');

const createRecord = async (data, userId) => {
  const record = await FinancialRecord.create({ ...data, userId });
  return record;
};

const getAllRecords = async (query) => {
  const { type, category, startDate, endDate, page = 1, limit = 10 } = query;

  const filter = { isDeleted: false };

  if (type) filter.type = type;
  if (category) filter.category = new RegExp(category, 'i');
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .populate('userId', 'name email role')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit)),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    records,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getRecordById = async (id) => {
  const record = await FinancialRecord.findOne({ _id: id, isDeleted: false }).populate(
    'userId',
    'name email'
  );
  if (!record) throw new ApiError('Financial record not found.', 404);
  return record;
};

const updateRecord = async (id, updateData) => {
  const record = await FinancialRecord.findOneAndUpdate(
    { _id: id, isDeleted: false },
    updateData,
    { new: true, runValidators: true }
  );
  if (!record) throw new ApiError('Financial record not found.', 404);
  return record;
};

const deleteRecord = async (id) => {
  const record = await FinancialRecord.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!record) throw new ApiError('Financial record not found.', 404);
  return { message: 'Record deleted successfully.' };
};

module.exports = { createRecord, getAllRecords, getRecordById, updateRecord, deleteRecord };
