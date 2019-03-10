var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('home');
});
router.get('/winivansherbs', (req, res, next) => {
    res.render('winivansherbs');
});

router.get('*', function(req, res){
    res.status(404).render('error', { layout: 'basic' });
});

/* POST pages. */
router.post('/charge', (req, res, next) => {
    console.dir(req.body);
    res.redirect('thankyou');
});

module.exports = router;
