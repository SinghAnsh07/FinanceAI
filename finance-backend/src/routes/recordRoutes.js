const express = require('express');
const router = express.Router();

const {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require('../controllers/recordController');
const authenticate = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { createRecordSchema, updateRecordSchema } = require('../validators/recordValidator');

router.get('/', authenticate, getAllRecords);

router.get('/:id', authenticate, getRecordById);

router.post('/', authenticate, roleGuard('Admin'), validate(createRecordSchema), createRecord);

router.put('/:id', authenticate, roleGuard('Admin'), validate(updateRecordSchema), updateRecord);

router.delete('/:id', authenticate, roleGuard('Admin'), deleteRecord);

module.exports = router;
