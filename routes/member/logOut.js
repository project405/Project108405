var express = require('express');
var router = express.Router();

//接收GET請求
router.get('/', function (req, res, next) {
    if (req.session.memID != undefined || req.session.memID != null) {
        req.session.memID = undefined;
        res.write('<head><meta charset="utf-8"/></head>');
        res.end('<script> alert("您已成功登出囉！"); location.replace("/logIn");</script>');
    }

});

module.exports = router;