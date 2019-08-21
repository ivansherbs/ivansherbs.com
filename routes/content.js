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

    const DEFAULT_TITLE = 'Ivan\'s Herbs';

    let route = content.routes[pageLanguage][pageUrlTitle];
    let routeFile = route;
    let routeTitle = DEFAULT_TITLE;
    let routeDescription = DEFAULT_TITLE;
    let routeKeywords = [];

    if (typeof route === 'object') {
        routeFile = route.file;
        if (route.title) {
            routeTitle = `${route.title} | ${DEFAULT_TITLE}`;
        }
        if (route.description) {
            routeDescription = route.description;
        }
        if (route.keywords && Array.isArray(route.keywords) && route.keywords.length) {
            routeKeywords = route.keywords;
        }
    }

    let viewData = {
        layout: 'content',
        meta: {
            lang: pageLanguage,
            title: routeTitle,
            description: routeDescription,
            keywords: routeKeywords
        }
    };

    res.render('content/' + routeFile, viewData, async (err, page) => {
        // if the view was not found
        if (err && err.message.startsWith('Failed to lookup view')) {
            // try to generate missing content
            try {
                await content.generatePage(routeFile);
                res.render(err.view.name, viewData);
                return;
            } catch (err) {
                next();
                return;
            }
        }

        res.send(page);
    });
}
