const Joi = require('joi');

const createRecordSchema = Joi.object({
  title:  Joi.string().max(100).required(),
  amount: Joi.number().positive().required(),
  type:   Joi.string().valid('income', 'expense').required(),
  category: Joi.string().max(50).required(),
  date:   Joi.date().iso().optional(),
  notes:  Joi.string().max(500).allow('').optional(),
});

const updateRecordSchema = Joi.object({
  title:  Joi.string().max(100).optional(),
  amount: Joi.number().positive().optional(),
  type:   Joi.string().valid('income', 'expense').optional(),
  category: Joi.string().max(50).optional(),
  date:   Joi.date().iso().optional(),
  notes:  Joi.string().max(500).allow('').optional(),
});

module.exports = { createRecordSchema, updateRecordSchema };
