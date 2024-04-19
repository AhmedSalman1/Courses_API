const express = require('express');

const router = express.Router();

const coursesController = require('../controllers/courses.controllers');
const { validationSchema } = require('../middlewares/validationSchema');
const verifyToken = require('../middlewares/verifyToken');
const allowedTo = require('../middlewares/allowedTo');

router
	.route('/')
	.get(coursesController.getAllCourses)
	.post(verifyToken, allowedTo('manger'), validationSchema(), coursesController.addCourse);

router
	.route('/:courseId')
	.get(coursesController.getCourse)
	.patch(coursesController.updateCourse)
	.delete(verifyToken, allowedTo('admin', 'manger'), coursesController.deleteCourse);

module.exports = router;
