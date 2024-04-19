const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/user.model');
const appError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');
const bcrypt = require('bcryptjs');
const generateJWT = require('../utils/generateJWT');

const multer = require('multer');

const diskStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		// console.log('File', file);
		cb(null, 'uploads');
	},
	filename: function (req, file, cb) {
		console.log();
		const ext = file.mimetype.split('/')[1];
		cb(null, `user-${Date.now()}.${ext}`);
	},
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(appError.create('Not an image, Please upload only images.', 400), false);
	}
};

const upload = multer({
	storage: diskStorage,
	fileFilter: fileFilter,
});

const uploadAvatar = upload.single('avatar');

const getAllUsers = catchAsyncError(async (req, res, next) => {
	// console.log(req.headers);

	const users = await User.find({}, { __v: 0, password: 0 });

	res.status(200).json({
		status: httpStatusText.SUCCESS,
		data: {
			users,
		},
	});
});

const register = catchAsyncError(async (req, res, next) => {
	// console.log(req.body);
	// console.log(req.file);
	const { firstName, lastName, email, password, role } = req.body;

	const oldUser = await User.findOne({ email: email });

	if (oldUser) {
		const error = appError.create('user already exists', 400, httpStatusText.FAIL);
		return next(error);
	}

	// password hashing
	const hashedPassword = await bcrypt.hash(password, 10);

	const newUser = new User({
		firstName,
		lastName,
		email,
		password: hashedPassword,
		role,
		avatar: req.file.filename,
	});

	// generate JWT
	const token = await generateJWT({ email: newUser.email, id: newUser._id, role: newUser.role });
	newUser.token = token;

	await newUser.save();

	res.status(201).json({
		status: httpStatusText.SUCCESS,
		data: {
			user: newUser,
		},
	});
});

const login = catchAsyncError(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		const error = appError.create('email and password are required', 404, httpStatusText.FAIL);
		return next(error);
	}

	const user = await User.findOne({ email: email });

	if (!user) {
		const error = appError.create('user not found', 404, httpStatusText.FAIL);
		return next(error);
	}

	const matchedPassword = await bcrypt.compare(password, user.password);

	if (user && matchedPassword) {
		// logged in successfully

		const token = await generateJWT({ email: user.email, id: user._id, role: user.role });

		return res.status(200).json({
			status: httpStatusText.SUCCESS,
			data: {
				token,
			},
		});
	} else {
		const error = appError.create('something went wrong', 500, httpStatusText.ERROR);
		return next(error);
	}
});

module.exports = {
	getAllUsers,
	register,
	login,
	uploadAvatar,
};
