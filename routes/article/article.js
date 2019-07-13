var express = require('express');
var router = express.Router();

const article = require('../utility/article');

//接收GET請求 
router.get('/:artiNum', async function (req, res, next) {
    var artiNum = req.params.artiNum;   //取出參數
    var memID = req.session.memID;
    article.getOneArticle(artiNum, memID).then(data => {
        // 測試data
        for (var i = 0; i < data[0].length; i++) {
            if (data[0][i].artiCont.match("\\:imgLocation") != null) {
                console.log("近來囉");
                for (var j = 0; j < data[11][0].length; j++) {
                    // artiCont = artiCont.replace("\\:imgLocation", "<div class='wrapperCard card-img-top' style='background-image: url(/userImg/" + req.files[i].filename + "'); border-radius:8px; '></div>");
                    data[0][i].artiCont = data[0][i].artiCont.replace("\\:imgLocation", "<div class='wrapperCard card-img-top'><img src='/userImg/" + data[11][0][j].imgName + "' style='max-height: 450px; max-width: 70%; cursor: pointer; border-radius: 12px; padding: 0.35em; ' ></div>");
                    // console.log("data[", 11, "][", j, "]=", data[11][0][j]);
                }
            }
        }
        console.log(data[0]);
        if (data == null) {
            res.render('error');  //導向錯誤頁面
        } else if (data == -1) {
            res.render('notFound');  //導向找不到頁面                
        } else {
            res.render('article', { items: data });
        }
    })

});

module.exports = router;
