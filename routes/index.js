const config = require('config');
const express = require('express');
const fs = require('fs');

const router = express.Router();

const contentRoutePath = config.get('content.sourceDir') + '/routes.json';
console.dir(contentRoutePath);
var contentRoutes = require(contentRoutePath);

fs.watchFile(contentRoutePath, (curr, prev) => {
    // TODO validation checks
    console.log(`Updating routes. Content route file changed: ${contentRoutePath}`);

    fs.readFile(contentRoutePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        try {
            contentRoutes = JSON.parse(data);
        } catch (err) {
            console.error(`Error while loading the new content routes from file: ${contentRoutePath}`);
            console.error(err);
        }
    });
});

const subscribers = require('../lib/subscribers');
const content = require('../lib/content');

// GET: home page
router.get('/', (req, res, next) => {
    res.render('home');
});
// GET: /freetrial page
router.get('/freetrial', (req, res, next) => {
    res.render('freetrial');
});
// GET: /winivansherbs page
router.get('/winivansherbs', (req, res, next) => {
    res.render('winivansherbs', { layout: 'info' });
});
// GET: /<lang>/* pages
router.get('/:lang/:title', (req, res, next) => {
    var pageLanguage = req.params.lang;
    var pageUrlTitle = req.params.title;

    if (['en', 'nl', 'de'].indexOf(pageLanguage) === -1) {
        next();
        return
    }

    if (!contentRoutes[pageLanguage] || !contentRoutes[pageLanguage][pageUrlTitle]) {
        next();
        return
    }

    let contentPath = contentRoutes[pageLanguage][pageUrlTitle];

    res.render('content/' + contentPath, { layout: 'empty', lang: req.params.lang }, async (err, page) => {

        // if the view was not found
        if (err && err.message.startsWith('Failed to lookup view')) {
            // try to generate missing content
            try {
                await content.generatePage(contentPath);
                res.render(err.view.name, { layout: 'empty', lang: req.params.lang });
                return;
            } catch (err) {
                next();
                return;
            }
        }

        res.send(page);
    });
});

/* Subscribe */

// GET: subscribe page
router.get('/subscribe', (req, res, next) => {
    var email = (req.query.email || '').substr(0, 100);
    res.render('subscribe', { layout: 'empty', email: email });
});

// POST: subscribe action
router.post('/subscribe', (req, res, next) => {
    var email = (req.body.email || '').substr(0, 101);
    var firstName = (req.body.first_name || '').substr(0, 51);
    var lastName = (req.body.last_name || '').substr(0, 51);

    // TODO add validators library
    //if (!email.match...)

    if (email.length === 101) {
        // TODO add resources file for texts
        ERROR_EMAIL_ADDRESS_TOO_LONG = 'This email looks suspiciously long to us.<br>Please contact us in case you really want to add such a long email address.';
        res.render('subscribe', {
            layout: 'empty',
            email: email,
            error: ERROR_EMAIL_ADDRESS_TOO_LONG
        });
        return;
    }
    if (firstName.length === 51 || lastName.length === 51) {
        // TODO add resources file for texts
        ERROR_NAME_FIELD_TOO_LONG = 'We don\'t support names longer than 50 characters long.<br>Provide a shorter name or contact us in case you really want to enter such a long name.';
        res.render('subscribe', {
            layout: 'empty',
            email: email,
            error: ERROR_NAME_FIELD_TOO_LONG
        });
        return;
    }

	subscribers.add(email, {
        firstName: firstName,
        lastName: lastName
    }, err => {

        if (err) {
            ERROR_SUBSCRIBE_ADD_FAILED = 'Something terribly wrong happened while trying to save your email address. Please try again or contact us at hello@ivansherbs.com.';
            res.render('home', {
                layout: 'empty',
                email: email,
                error: ERROR_SUBSCRIBE_ADD_FAILED
            });
            return;
        }

        res.render('thankyou', {
            layout: 'empty'
        });
    });
});

// GET: 404 error page

router.get('*', function(req, res){
    res.status(404).render('error', { layout: 'empty' });
});

module.exports = router;
