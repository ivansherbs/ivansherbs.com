const fs = require('fs');
var config = require('config');

var Mailchimp = require('mailchimp-api-v3')
var mailchimp = new Mailchimp(config.get('mailchimp.apiKey'));

function add(email, data, callback) {
    // validate email
    if (!email) {
        return callback('Invalid email address for subscriber');
    }

    if (typeof data === 'function') {
        callback = data;
        data = {};
    }

    mailchimp.post({
        path: '/lists/{list_id}/members',
        path_params: {
            list_id: '6443ac030e'
        },
        body: {
            email_address: email,
            status: 'subscribed',
            merge_fields: {
                FNAME: data.firstName,
                LNAME: data.lastName
            }
        }
    }, function (err, result) {
        var line = email + (err ? ' not' : '') + ' added successfully to MailChimp' + (err ? ' (' + err.title + ')' : '');
        fs.appendFile('public/subscribers.txt', line + '\n', fserr => console.log(line));

        // accepted errors
        if (err && err.title === 'Member Exists') {
            err = null;
        }

        return callback(err ? line : null);
    });
}
 
exports.add = add;
