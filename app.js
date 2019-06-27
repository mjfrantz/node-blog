const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
// const validator = require('express-validator');
// const flash = require('connect-flash');
const { check, validationResult } = require('express-validator');
// const { body } = require('express-validator');



mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;


// Check connection
db.once('open', function () {
	console.log('Connected to Mongodb')
});


// Check for DB errors
db.on('error', function (err) {
	console.log(err);
});

// Init app
const app = express();


//Bring in Models
let Article = require('./models/article');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware https://github.com/expressjs/session 
app.set('trust proxy', 1) // trust first proxy
app.use(session({
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true
}));

// Express Messages Middleware https://github.com/visionmedia/express-messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
});



// Home Route
app.get('/', function (req, res) {
	Article.find({}, function (err, articles) {
		if (err) {
			console.log(err);
		} else {
			res.render('index', {
				title: 'Articles',
				articles: articles
			});
		}
	});
});

// Get Single Article
app.get('/article/:id', function (req, res) {
	Article.findById(req.params.id, function (err, article) {
		res.render('article', {
			article: article
		});
	});
});


// Add Route
app.get('/articles/add', function (req, res) {
	res.render('add_article', {
		title: 'Add Article'
	});
});

// Load Edit Form
app.get('/article/edit/:id', function (req, res) {
	Article.findById(req.params.id, function (err, article) {
		res.render('edit_article', {
			title: 'Edit Article',
			article: article
		});
	});
});

//Add Submit POST route
app.post('/articles/add', [
	check('title', 'Title is required')
		.not()
		.isEmpty(),
	check('author', 'Author is required')
		.not()
		.isEmpty(),
	check('body', 'Body is required')
		.not()
		.isEmpty()
], function (req, res) {

	//Get Errors
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		// req.flash('danger', 'fuck me');
		res.render('add_article', {
			title: 'Add Article',
			errors: errors
		});
	} else {
		let article = new Article();
		article.title = req.body.title;
		article.author = req.body.author;
		article.body = req.body.body;

		article.save(function (err) {
			if (err) {
				console.log(err);
				return;
			} else {
				req.flash('success', 'Article Added');
				res.redirect('/');
			}
		});
	}
});

//Update Submit POST route
app.post('/articles/edit/:id', function (req, res) {
	let article = {};
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	let query = { _id: req.params.id }

	Article.update(query, article, function (err) {
		if (err) {
			console.log(err);
			return;
		} else {
			req.flash('success', 'Article Updated');
			res.redirect('/');
		}
	});
});

// Delete Article Route
app.delete('/article/:id', function (req, res) {
	let query = { _id: req.params.id }

	Article.remove(query, function (err) {
		if (err) {
			console.log(err);
		}
		res.send('Success');
	});
});

//User Route
app.use(express.json());
app.post('/user', (req, res) => {
	User.create({
		username: req.body.username,
		password: req.body.password
	}).then(user => res.json(user));
});

//Express User Validation
app.post('/user', [
	// username must be an email
	check('username').isEmail(),
	// password must be at least 5 chars long
	check('password').isLength({ min: 5 })
], (req, res) => {
	// Finds the validation errors in this request and wraps them in an object with handy functions
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

	User.create({
		username: req.body.username,
		password: req.body.password
	}).then(user => res.json(user));
});

// Start Server
app.listen(3000, function () {
	console.log('Server started on port 3000.....')
});