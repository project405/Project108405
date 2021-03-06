var express = require('express');
var router = express.Router();

const moment = require('moment');
const multer = require('multer');
const member = require('../utility/member');
var isRender = true; //判斷頁面是否有回傳過

var upload = multer({
    storage: undefined
})

//接收POST請求
router.post('/', upload.array('userImg', 100), function (req, res, next) {
    var memID ;
    //判斷是使用哪種方式登入
    if (req.session.memID == undefined && req.session.passport == undefined) {
        memID = undefined;
    } else if (req.session.memID != undefined && req.session.passport == undefined) {
        memID = req.session.memID;
    } else if (req.session.memID == undefined && req.session.passport != undefined) {
        memID = req.session.passport.user.id;
    }
    if (!memID) {
        res.send("請進行登入");
        return;
    }
    var recomMessCont = req.body.replyCont;
    var recomNum = req.body.artiNum
    var analyzeScore = req.body.analyzeScore;
    var positiveWords = req.body.positiveWords;
    var negativeWords = req.body.negativeWords;
    var swearWords = req.body.swearWords;
    var editReply = req.body.editReply;
    var postDateTime = moment(Date().now).format("YYYY-MM-DD HH:mm:ss");
    var imgData = [];
    //將所有換行符號替代成<br> 
    recomMessCont = recomMessCont.replace(/\n/g, "<br>");
    //內容、標題不可為空
    // tag
    if (memID == undefined || memID == null) {
        res.send("請進行登入");
    } else {
        if (isRender) {
            if (editReply) {
                member.editRecommendReply(recomNum, memID, recomMessCont, postDateTime, req.body.base64Index, analyzeScore, positiveWords, negativeWords, swearWords, req.body.artiMessNum, req.body.score2).then(data => {
                    if (data == 1) {
                        res.send("編輯留言成功");
                    } else {
                        res.send("編輯留言失敗");
                    }
                })
            } else {
                member.recommendReplyPost(recomNum, memID, recomMessCont, postDateTime, req.body.base64Index, analyzeScore, positiveWords, negativeWords, swearWords, req.body.score2).then(data => {
                    if (data == 1) {
                        res.send("留言成功");
                    } else {
                        res.send("留言失敗");
                    }
                })
            }
        } else {
            res.send("留言失敗");
        }
    }

});

module.exports = router;