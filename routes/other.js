// ******
// routes
// ******

module.exports = function(router) {
    // public routes
    router.get('/', getRootPage);
    router.get('/freetrial', getFreetrialPage);
    router.get('/winivansherbs', getWinivansherbsPage);

    // error page
    router.get('*', getErrorPage);
};

const config = require('config');

// GET /
function getRootPage(req, res, next) {
    res.render('home');
}

// GET /freetrial
function getFreetrialPage(req, res, next) {
    res.render('freetrial');
}

// GET /winivansherbs
function getWinivansherbsPage(req, res, next) {
    res.render('winivansherbs', { layout: 'info' });
}
