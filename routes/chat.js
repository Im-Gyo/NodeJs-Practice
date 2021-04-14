const express = require('express');

const router = express.Router();

router.get('/chat', function(req, res)
{
    res.render('chat');
});

module.exports = router;