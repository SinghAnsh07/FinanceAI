const express = require('express');
const router = express.Router();

const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { updateUserSchema } = require('../validators/userValidator');

router.use(authenticate, roleGuard('Admin'));

router.get('/', getAllUsers);

router.get('/:id', getUserById);

router.put('/:id', validate(updateUserSchema), updateUser);

router.delete('/:id', deleteUser);

module.exports = router;
