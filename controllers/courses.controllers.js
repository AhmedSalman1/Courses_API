const { validationResult } = require('express-validator');
const Course = require('../models/course.model');
const httpStatusText = require('../utils/httpStatusText');
const catchAsyncError = require('../middlewares/catchAsyncError');
const appError = require('../utils/appError');

const getAllCourses = catchAsyncError(async (req, res) => {
	const query = req.query;

	const limit = query.limit || 10;
	const page = query.page || 1;
	const skip = (page - 1) * limit;

	const courses = await Course.find({}, { __v: 0 }).limit(limit).skip(skip);

	res.json({
		status: httpStatusText.SUCCESS,
		data: { courses },
	});
});

const getCourse = catchAsyncError(async (req, res, next) => {
	// console.log(req.params);
	const course = await Course.findById(req.params.courseId);

	if (!course) {
		const error = appError.create('course not found', 404, httpStatusText.FAIL);
		return next(error);
	}
	return res.json({
		status: httpStatusText.SUCCESS,
		data: { course },
	});
});

const addCourse = catchAsyncError(async (req, res, next) => {
	// console.log(req.body);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
		return next(error);
	}

	const newCourse = new Course(req.body);
	await newCourse.save();

	res.status(201).json({
		status: httpStatusText.SUCCESS,
		data: {
			course: newCourse,
		},
	});
});

const updateCourse = catchAsyncError(async (req, res) => {
	const courseId = req.params.courseId;

	const updatedCourse = await Course.updateOne({ _id: courseId }, { $set: { ...req.body } });

	res.status(200).json({
		status: httpStatusText.SUCCESS,
		data: {
			course: updatedCourse,
		},
	});
});

const deleteCourse = catchAsyncError(async (req, res) => {
	const data = await Course.deleteOne({ _id: req.params.courseId });

	res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
	getAllCourses,
	getCourse,
	addCourse,
	updateCourse,
	deleteCourse,
};
