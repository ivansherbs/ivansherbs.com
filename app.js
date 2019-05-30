const config = require('config');

var path = require('path');

var express = require('express');
var exphbs  = require('express-handlebars');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');

var logger = require('morgan');

var meetRouter = require('./routes/meet');
var indexRouter = require('./routes/index');

var webRootDir = path.join(__dirname, 'public');

var app = express();

// save the configuration in the app locals
app.locals.config = config;

// view engine setup
app.engine('html', exphbs({
    extname: '.html',
    defaultLayout: 'main'
}));
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(webRootDir));

app.use('/meet', meetRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});


module.exports = app;
