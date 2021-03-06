var express = require('express');
var router = express.Router();

const recommend = require('../utility/recommend');

//接收GET請求
router.get('/:recomListNum', function (req, res, next) {
    var recomListNum = req.params.recomListNum;   //取出參數
    var memID;

    //判斷是使用哪種方式登入
    if (req.session.memID != undefined && req.session.passport == undefined) {
        memID = req.session.memID;
    } else if (req.session.memID == undefined && req.session.passport != undefined) {
        memID = req.session.passport.user.id;
    }

    recommend.getRecomClassList('書籍', memID, recomListNum).then(data => {
        data[4][0].count = Math.ceil(data[4][0].count / 8)
        data[4][0].count = data[4][0].count == 0 ? 1 : data[4][0].count
 
        if (data == null) {
            res.render('error');  //導向錯誤頁面
        } else if (data == -1) {
            res.render('notFound');  //導向找不到頁面                
        } else {
            data[0].map((item) => {
                item.recomCont = item.recomCont.replace(/\n/g,' ').replace(/\r/g,' ').replace(/<br>/g,' ').replace(/\\:imgLocation/g, " ")
            })
            res.render('recomClass', { recom: data });  //將資料傳給顯示頁面
        }
    })

});

module.exports = router;