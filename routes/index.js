var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', { title: 'Express' });
});

/* POST pages. */
router.post('/charge', (req, res, next) => {
    console.dir(req.body);
    res.redirect('thankyou');
});

module.exports = router;
