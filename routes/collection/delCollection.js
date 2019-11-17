var express = require('express');
var router = express.Router();

const collection = require('../utility/collection');

//接收POST請求
router.post('/', function (req, res, next) {
    var memID;

    //判斷是使用哪種方式登入
    if (req.session.memID == undefined && req.session.passport == undefined) {
        res.redirect("login");
    } else if (req.session.memID != undefined && req.session.passport == undefined) {
        memID = req.session.memID;
    } else if (req.session.memID == undefined && req.session.passport != undefined) {
        memID = req.session.passport.user.id;
    }

    if (req.body.likeType == "recommend") {
        collection.delColleRecommend(memID, req.body.recomNum).then(data => {
            if (data == 1) {
                res.send("刪除成功摟!");
            } else {
                res.send("新增失敗摟!");
            }
        })
    } else {
        collection.delColleArticle(memID, req.body.artiNum).then(data => {
            if (data == 1) {
                res.send("刪除成功摟!");
            } else {
                res.send("新增失敗摟!");
            }
        })
    }
});


module.exports = router;