var express = require('express');
var router = express.Router();
//增加引用函式
const index = require('./utility/index');

//接收GET請求
router.get('/', function (req, res, next) {
    var memID;

    //判斷是使用哪種方式登入
    if (req.session.memID != undefined && req.session.passport == undefined) {
        memID = req.session.memID;
    } else if (req.session.memID == undefined && req.session.passport != undefined) {
        memID = req.session.passport.user.id;
    }
    
    index.getIndexData(memID).then(data => { 
        // 將正向文章字串替換成圖片
        for (var i = 0; i < data[6].length; i++) {
            if (data[6][i].artiCont.match("\\:imgLocation") != null) {
                for (var j = 0; j < data[8].length; j++) {
                    data[6][i].artiCont = data[6][i].artiCont.replace("\\:imgLocation", "<img class='sentimentImg'  src='/userImg/" + data[8][j].imgName + "'</div>");
                }
            }
        }

        // 將負向文章字串替換成圖片
        for (var i = 0; i < data[7].length; i++) {
            if (data[7][i].artiCont.match("\\:imgLocation") != null) {
                for (var j = 0; j < data[9].length; j++) {
                    data[7][i].artiCont = data[7][i].artiCont.replace("\\:imgLocation", "<img class='sentimentImg' src='/userImg/" + data[9][j].imgName + "'</div>");
                }
            }
        }
        
        if (data == null) {
            res.render('error');  //導向錯誤頁面
        } else if (data.length > 0) {
            res.render('index', { items: data });
        } else {
            res.render('notFound');  //導向找不到頁面
        }
    })
});


module.exports = router;