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
        
        if (data[0] != undefined) {
            data[0].map((item) => {
                item.recomCont = item.recomCont.replace(/\n/g,' ').replace(/\r/g,' ').replace(/<br>/g,' ').replace(/\\:imgLocation/g, " ");
            })

            //熱門文章 圖片標籤取代為空字串
            for (var i = 0; i < data[1].length; i++) {
                data[1][i].artiCont = data[1][i].artiCont.replace(/\n/g,' ').replace(/\r/g,' ').replace(/<br>/g,' ').replace(/\\:imgLocation/g, " "); 
            }
        }


        // 將葉子文章 > 圖片字串替換成圖片
        if (data[10][0].artiNum != undefined) {
            if (data[10][0].artiCont.match("\\:imgLocation") != null) {
                for (var j = 0; j < data[3].length; j++) {
                    if(data[10][0].artiNum == data[3][j].artiNum){
                        data[10][0].artiCont = data[10][0].artiCont.replace("\\:imgLocation", "<div class='sentimentImg'><img src='" + data[3][j].imgName + "' style='width: 100%; cursor: pointer; border-radius: 12px; padding: 0.1em; ' ></div>");
                    }
                }
            }
        }

        // 將葉子推薦 > 圖片字串替換成圖片
        if (data[10][0].recomNum != undefined) {
            if (data[10][0].recomCont.match("\\:imgLocation") != null) {
                for (var j = 0; j < data[4].length; j++) {
                    if(data[10][0].recomNum == data[4][j].recomNum){
                        data[10][0].recomCont = data[10][0].recomCont.replace("\\:imgLocation", "<div class='sentimentImg'><img src='" + data[4][j].imgName + "' style='width: 100%; cursor: pointer; border-radius: 12px; padding: 0.1em; ' ></div>");
                    }
                }
            }
        }
        
        // 將正向文章字串替換成圖片
        for (var i = 0; i < data[6].length; i++) {
            data[6][i].artiCont = data[6][i].artiCont.replace(/\n/g,'   ').replace(/\r/g,'   ').replace(/<br>/g,'   ').replace(/\\:imgLocation/g, "   "); 
            data[6][i].artiCont = data[6][i].artiCont.length > 300 ? `${data[6][i].artiCont.substring(0,300)}...` : data[6][i].artiCont
        }

        // 將負向文章字串替換成圖片
        for (var i = 0; i < data[7].length; i++) {
            data[7][i].artiCont = data[7][i].artiCont.replace(/\n/g,'   ').replace(/\r/g,'   ').replace(/<br>/g,'   ').replace(/\\:imgLocation/g, "   "); 
            data[7][i].artiCont = data[7][i].artiCont.length > 300 ? `${data[7][i].artiCont.substring(0,300)}...` : data[7][i].artiCont
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