var express = require('express');
var router = express.Router();

const article = require('../utility/article');

//接收GET請求 
router.get('/:artiNum', async function (req, res, next) {
    var artiNum = req.params.artiNum;   //取出參數
    var memID ;

    //判斷是使用哪種方式登入
	if (req.session.memID != undefined && req.session.passport == undefined) {
		memID = req.session.memID;
	} else if (req.session.memID == undefined && req.session.passport != undefined) {
		memID = req.session.passport.user.id;
    }

    article.getOneArticle(artiNum, memID).then(data => {
        // if (memID != data[0])
        console.log(data[0].memID)
        console.log(data)
        // 將字串替換成圖片
        for (var i = 0; i < data[0].length; i++) {
            if (data[0][i].artiCont.match("\\:imgLocation") != null) {
                for (var j = 0; j < data[6].length; j++) {
                    data[0][i].artiCont = data[0][i].artiCont.replace("\\:imgLocation", "<div class='wrapperCard card-img-top'><img src='/userImg/" + data[6][j].imgName + "' style='max-height: 450px; max-width: 70%; cursor: pointer; border-radius: 12px; padding: 0.35em; ' ></div>");
                }
            }
        }

        let sumDisplayImg = 0
        console.log(data[9])
        if (data[9]) {
            data[1].forEach((item, index) => {
                console.log('data.artiMessCont', item.artiMessCont)
                while (item.artiMessCont.match("\\:imgLocation")) {
                    console.log('data[9][sumDisplayImg].imgName', data[9][sumDisplayImg].imgName)
                    item.artiMessCont = item.artiMessCont.replace("\\:imgLocation", "<div class='wrapperCard card-img-top'><img src='/userImg/replyImg/" + data[9][sumDisplayImg].imgName + "' style='max-height: 450px; max-width: 70%; cursor: pointer; border-radius: 12px; padding: 0.35em; ' ></div>");
                    sumDisplayImg = sumDisplayImg + 1
                    console.log('sumDisplayImg', sumDisplayImg)
                }
            })
        }

        if (data == null) {
            res.render('error');  //導向錯誤頁面
        } else if (data == -1) {
            res.render('notFound');  //導向找不到頁面                
        } else {
            res.render('editArticle', { items: data });
        }
    })

});

module.exports = router;
