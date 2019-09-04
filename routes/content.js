// ******
// routes
// ******

module.exports = function(router) {
    // public routes
    router.get('/:language(en|nl)/:title', getContentPage);

    // internal routes
    router.get('/:language(en|nl)', getContentPagesForLanguage);
};


// ***************************
// route function dependencies
// ***************************

const config = require('config');

const content = require('../lib/content');
const inspectKey = config.get('admin.inspectKey');

function getJsonLinkAnnotator(language) {
    return  function(key, value) {
        // annotate route URLs (top keys)
        if (!key) {
            let annotatedObj = {};
            for (route in value) {
                let link = `<a href='/${language}/${route}' target='_blank'>${route}</a>`;
                annotatedObj[link] = value[route];
            }
            value = annotatedObj;
        }

        const contentRepoRoot = config.get('admin.contentRepoRoot');

        // annotate content file paths (top key values if string or 'file' child key value)
        if (key == 'file' || key.startsWith('<a href')) {
            if (typeof value === 'string') {
                let link = `<a href='${contentRepoRoot}${value.replace('.html', '.md')}' target='_blank'>${value}</a>`;
                value = link;
            }
        }

        return value;
    };
}

// ***************
// route functions
// ***************

// GET /:language
function getContentPagesForLanguage(req, res, next) {
    var pageLanguage = req.params.language;

    if (req.query.key !== inspectKey) {
        next();
        return
    }
    let beautyJson = JSON.stringify(content.routes[pageLanguage] || {}, getJsonLinkAnnotator(pageLanguage), 4)
    let response=`<pre>${beautyJson}</pre>`;
    res.send(response);
}

// GET /:language/:title
function getContentPage(req, res, next) {
    var pageLanguage = req.params.language;
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
