const express = require('express');

const router = express.Router();

const usersController = require('../controllers/users.controller');
const verifyToken = require('../middlewares/verifyToken');

router.route('/').get(verifyToken, usersController.getAllUsers);
router.route('/register').post(usersController.uploadAvatar, usersController.register);
router.route('/login').post(usersController.login);

module.exports = router;
