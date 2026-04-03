const Joi = require('joi');

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  role: Joi.string().valid('Viewer', 'Analyst', 'Admin').optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = { updateUserSchema };
