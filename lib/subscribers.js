const debug = require('debug')('lib:subscribers')
const fs = require('fs');
const config = require('config');

var giveaways = require('./giveaways');

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

    var productId = giveaways.generateUniqueProductId(email);

    var requestObj = {
        path: '/lists/{list_id}/members',
        path_params: {
            list_id: config.get('mailchimp.lists.introduction')
        },
        body: {
            email_address: email,
            status: 'subscribed',
            merge_fields: {
                FNAME: data.firstName,
                FTLINK: config.get('giveaways.freetrial.shopUrlBase') + productId
            }
        }
    };

    debug('Sending the following request to MailChimp: %s', JSON.stringify(requestObj));

    // add the user to the MailChimp list
    mailchimp.post(requestObj, (err, result) => {

        var line = email + (err ? ' not' : '') + ' added successfully to MailChimp' + (err ? ' (' + err.title + ')' : '');
        // TODO migrate to the logs
        fs.appendFile('public/subscribers.txt', line + '\n', fserr => console.log(line));

        if (err) {
            debug('MailChimp replied with an error: %s', JSON.stringify(err));
            // accepted errors
            if (err.title === 'Member Exists') {
                err = null;
            } else {
                return callback(line);
            }
        } else {
            // asynchronously generate a one-time product in the giveaway shop
            // if the user has been successfully subscribed to MailChimp
            giveaways.generateProduct(productId, (err, product) => {

                // TODO log the results
                if (err) console.dir(err);

                console.log('Generated product with ID: ' + product.id);
            });
        }

        return callback(null);
    });
}
 
exports.add = add;
