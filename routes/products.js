// ******
// routes
// ******

module.exports = function(router) {
    // public routes
    router.get('/products', getProducts);
};

// ***************************
// route function dependencies
// ***************************

const config = require('config');

const content = require('../lib/content');

function collectProductsFromRoutes(routes, language) {
    let products = [];
    let langRoutes = routes[language];

    for (let route in langRoutes) {
        if (typeof langRoutes[route].product === 'object') {
            // clone the route product object in order not to have side effects
            let enrichedProduct = JSON.parse(JSON.stringify(langRoutes[route].product));
            enrichedProduct.link = route;
            products.push(enrichedProduct);
        }
    };

    return products;
}

// ***************
// route functions
// ***************

// GET /products
function getProducts(req, res, next) {
    // TODO solve the product listing language page problems
    // currently only listing the EN products
    let language = 'en';
    let products = collectProductsFromRoutes(content.routes, language);
    res.render('products', { products: products, language: language });
}
