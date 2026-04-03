const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const getAllUsers = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) throw new ApiError('User not found.', 404);
  return user;
};

const updateUser = async (id, updateData) => {
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) throw new ApiError('User not found.', 404);
  return user;
};

const deleteUser = async (id, requestingUserId) => {
  if (id === requestingUserId.toString()) {
    throw new ApiError('You cannot delete your own account.', 400);
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError('User not found.', 404);
  return { message: 'User deleted successfully.' };
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
