const debug = require('debug')('lib:giveaways')
const crypto = require('crypto');
const fs = require('fs');
const config = require('config');

const hashKey = config.get('giveaways.freetrial.hashKey');
const productDatabasePath = config.get('giveaways.freetrial.productDatabasePath');
const productTemplatePath = config.get('giveaways.freetrial.productTemplatePath');

/*
 * Generates a unique ID to be used in a one-time giveaway.
 *
 * The ID is computed with the formula:
 *
 *      md5("email|isodate|hashKey")
 */
function generateUniqueProductId(email) {
    const hash = crypto.createHash('md5');
    hash.update(email);
    hash.update('|');
    hash.update(new Date().toISOString());
    hash.update('|');
    hash.update(hashKey);

    var hex = hash.digest('hex');
    debug('Generated product ID for email "%s": %s', email, hex);
    return hex;
}

/*
 * Generates a one-time product in the giveaway shop with the give ID.
 */
function generateProduct(productId, callback) {
    fs.readFile(productTemplatePath, (err, data) => {

        if (err) return callback(err);

        debug('Read product template from file "%s"', productTemplatePath);

        // configure dynamic product details
        var productObj = JSON.parse(data);
        productObj.linker = productId;
        // the shop will not validate the items if the ID is longer than 24 characters
        productObj.id = productId.substring(0, 23);
        productObj.datecreated = new Date().toISOString();

        debug('Prepared giveaway product for freetrial shop: %s', JSON.stringify(err));

        fs.appendFile(productDatabasePath, JSON.stringify(productObj) + '\n', (err) => {
            if (err) {
                debug('Failed to append the product to the product database file: %s', productDatabasePath);
                return callback(err);
            }

            debug('Giveaway product added to the freetrial shop.');

            callback(null, productObj);
        });
    });
}

exports.generateProduct = generateProduct;
exports.generateUniqueProductId = generateUniqueProductId;
