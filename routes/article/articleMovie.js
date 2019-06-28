var express = require('express');
var router = express.Router();

const article = require('../utility/article');
var moment = require('moment');

//接收GET請求
router.get('/', function(req, res, next) {
    var memID = req.session.memID ;
    article.getClassMovie(memID).then(data => {
        console.log(data);
        if (data==null){
            res.render('error');  //導向錯誤頁面
        }else if(data==-1){
            res.render('notFound');  //導向找不到頁面                
        }else{
            // console.log(data)
            res.render('articleClass', {items:data});  //將資料傳給顯示頁面
        }  
    })
});


module.exports = router;