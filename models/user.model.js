const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		unique: true,
		required: true,
		validate: [validator.isEmail, 'filed must be valid email'],
	},
	password: {
		type: String,
		required: true,
	},
	token: {
		type: String,
	},
	role: {
		type: String,
		enum: ['user', 'admin', 'manger'],
		default: 'user',
	},
	avatar: {
		type: String,
		default: 'uploads/profile.jpg',
	},
});

module.exports = mongoose.model('User', userSchema);
