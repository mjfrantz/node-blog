const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

// Check connection
db.once('open', function(){
	console.log('Connected to Mongodb')
});

// Check for DB errors
db.on('error', function(err){
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


// Home Route
app.get('/', function (req, res) {
	Article.find({}, function(err, articles){
		if(err){
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
app.get('/article/:id', function(req,res){
	Article.findById(req.params.id, function(err, article){
		res.render('article',{
			article:article
		});
	});
});



// 	// let articles = [
// 	// 	{
// 	// 		id: 1,
// 	// 		title: 'Article One',
// 	// 		author: 'Mike Frantz',
// 	// 		body: 'This is article 1'
// 	// 	},
// 	// 	{
// 	// 		id: 2,
// 	// 		title: 'Article Two',
// 	// 		author: 'Mike F',
// 	// 		body: 'This is article 2'
// 	// 	},
// 	// 	{
// 	// 		id: 3,
// 	// 		title: 'Article Three',
// 	// 		author: 'Mike Frantz',
// 	// 		body: 'This is article 3'
// 	// 	}
// 	// ];

// });

// Add Route
app.get('/articles/add', function (req, res) {
	res.render('add_article', {
		title: 'Add Article'
	});
});

// Get Edit Article
app.get('/article/edit/:id', function(req,res){
	Article.findById(req.params.id, function(err, article){
		res.render('edit_article',{
			article:article
		});
	});
});

//Add Submit POST route
app.post('/articles/add', function(req, res){
	let article = new Article();
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	article.save(function(err){
		if(err){
			console.log(err);
			return;
		} else {
			res.redirect('/');
		}
	});
});

// Start Server
app.listen(3000, function () {
	console.log('Server started on port 3000.....')
});