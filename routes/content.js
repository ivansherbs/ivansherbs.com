// ******
// routes
// ******

module.exports = function(router) {
    // public routes
    router.get('/:lang(en|nl)/:title', getContentPage);

    // internal routes
    router.get('/:lang(en|nl)', getContentPagesForLanguage);
};


// ****************************
// route functions dependencies
// ****************************

const config = require('config');
const fs = require('fs');

const content = require('../lib/content');
const inspectKey = config.get('admin.inspectKey');


// ***************
// route functions
// ***************

// GET /:lang
function getContentPagesForLanguage(req, res, next) {
    var pageLanguage = req.params.lang;

    if (req.query.key !== inspectKey) {
        next();
        return
    }

    res.send(content.routes[pageLanguage] || {});
}

// GET /:lang/:title
function getContentPage(req, res, next) {
    var pageLanguage = req.params.lang;
    var pageUrlTitle = req.params.title;

    if (!content.routes[pageLanguage] || !content.routes[pageLanguage][pageUrlTitle]) {
        next();
        return
    }

    let contentPath = content.routes[pageLanguage][pageUrlTitle];

    res.render('content/' + contentPath, { layout: 'content', lang: req.params.lang }, async (err, page) => {

        // if the view was not found
        if (err && err.message.startsWith('Failed to lookup view')) {
            // try to generate missing content
            try {
                await content.generatePage(contentPath);
                res.render(err.view.name, { layout: 'content', lang: req.params.lang });
                return;
            } catch (err) {
                next();
                return;
            }
        }

        res.send(page);
    });
}
