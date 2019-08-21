const express = require('express');
const router = express.Router();

const fs = require('fs');

fs.readdirSync(__dirname).forEach(file => {
    if (!file.match(/\.js$/) || file === 'index.js') {
        return;
    }
    try {
        require('./' + file)(router);
    } catch(err) {
        console.error(`Error while loading router file "${file}": ${err.message}`);
    }
});


// GET 404 error page
router.get('*', (req, res) => {
    res.status(404).render('error', { layout: 'empty' });
});

module.exports = router;
