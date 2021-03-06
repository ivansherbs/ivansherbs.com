// ******
// routes
// ******

module.exports = function(router) {
    // public routes
    router.get('/subscribe', getSubscribePage);
    router.post('/subscribe', postSubscribeForm);
};

const subscribers = require('../lib/subscribers');

/* Subscribe */

// GET /subscribe
function getSubscribePage(req, res, next) {
    var email = (req.query.email || '').substr(0, 100);
    res.render('subscribe', { layout: 'empty', email: email });
}

// POST /subscribe
function postSubscribeForm(req, res, next) {
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
}
