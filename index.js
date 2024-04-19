require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const cors = require('cors');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const mongoose = require('mongoose');

const httpStatusText = require('./utils/httpStatusText');

const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
	console.log('mongodb server started✅');
});

app.use(cors());
app.use(express.json());

const coursesRouter = require('./routes/courses.route');
const usersRouter = require('./routes/users.route');

app.use('/api/courses', coursesRouter);
app.use('/api/users', usersRouter);

//! global middleware for not found router
app.all('*', (req, res, next) => {
	res.status(404).json({
		status: httpStatusText.ERROR,
		message: 'This resource is not available',
	});
});

//! global error handler (any MW has next)
app.use((error, req, res, next) => {
	res.status(error.statusCode || 500).json({
		status: error.statusText || httpStatusText.ERROR,
		message: error.message,
		code: error.statusCode || 500,
		data: null,
	});
});

port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log('Server is running on port 5000');
});
