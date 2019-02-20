var express = require('express');
var router = express.Router();

var subscribers = require('../lib/subscribers');

// GET: home page
router.get('/', (req, res, next) => {
    res.render('home');
});

/* Subscribe */

// GET: subscribe page
router.get('/subscribe', (req, res, next) => {
    var email = (req.query.email || '').substr(0, 100);
    res.render('subscribe', { layout: 'basic', email: email });
});

// POST: subscribe action
router.post('/subscribe', (req, res, next) => {
    var email = (req.body.your_precious || '').substr(0, 100);
    if (email.length === 100) {
        // TODO add resources file for texts
        ERROR_EMAIL_ADDRESS_TOO_LONG = 'This email looks suspiciously long to us.<br>Please contact us in case you really want to add such a long email address.';
        res.render('subscribe', {
            layout: 'basic',
            email: email,
            error: ERROR_EMAIL_ADDRESS_TOO_LONG
        });
        return;
    }

    // TODO add validators library
    //if (!email.match...)

	subscribers.add(req.body.your_precious, err => {
        if (err) {
            ERROR_SUBSCRIBE_ADD_FAILED = 'Something terribly wrong happened while trying to save your email address. Please try again or contact us at hello@ivansherbs.com.';
            res.render('subscribe', {
                layout: 'basic',
                email: email,
                error: ERROR_SUBSCRIBE_ADD_FAILED
            });
            return;
        }

        res.render('subscribe', {
            layout: 'basic',
            message: 'Thank you for your support! The Ivan Chai Stories will soon reach you.'
        });
    });
});

// GET: 404 error page

router.get('*', function(req, res){
    res.status(404).render('error', { layout: 'basic' });
});

// TODO POST: pages
router.post('/charge', (req, res, next) => {
    console.dir(req.body);
    res.redirect('thankyou');
});

module.exports = router;
