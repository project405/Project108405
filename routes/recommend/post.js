var express = require('express');
var router = express.Router();

const fs = require('fs');
const moment = require('moment');
const multer = require('multer');
const member = require('../utility/member');

//post
var maxSize = 1024 * 1024; //設定最大上傳容量
var imgName; //紀錄檔案名稱(不含副檔名)
var imgType; //記錄檔案副檔名
var buf; //將檔案名稱做base64編碼
var isRender = true; //判斷頁面是否有回傳過

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/imgs/recommend');
    },
    filename: function (req, file, cb) {
        imgName = file.originalname.substring(0, file.originalname.lastIndexOf("."));
        imgType = file.originalname.substring(file.originalname.lastIndexOf("."));
        buf = Buffer.from(imgName, 'ascii');
        buf = buf.toString('base64');
        //檔名非法字元\/:*?<>|"
        buf = buf.replace('\\', '');
        buf = buf.replace('/', '');
        buf = buf.replace(':', '');
        buf = buf.replace('*', '');
        buf = buf.replace('?', '');
        buf = buf.replace('<', '');
        buf = buf.replace('>', '');
        buf = buf.replace('|', '');
        buf = buf.replace('\"', '');
        buf += imgType;
        imgName = Date.now() + "--" + buf;
        //設定檔案名稱並儲存
        cb(null, imgName);
    }
})
var upload = multer({
    storage: storage
})

//post請求
router.post('/', upload.array('userImg', 3), function (req, res, next) {
  var memID;
  var recomHead = req.body.recomHead;
  var recomCont = req.body.recomCont;
  var recomClass = req.body.recomClass;
  var analyzeScore = req.body.analyzeScore;
  var positiveWords = req.body.positiveWords;
  var negativeWords = req.body.negativeWords;

  console.log("qqqqqq",req.body);
  var postDateTime = moment(Date().now).format("YYYY-MM-DD hh:mm:ss");
  var tagData = [];
  var imgData = [];
  // console.log(req.files);
  //將所有換行符號替代成<br> 
  recomCont = recomCont.replace(/\n/g, "<br>");

  //判斷是使用哪種方式登入
  if (req.session.memID == undefined && req.session.passport == undefined) {
      memID = undefined;
  } else if (req.session.memID != undefined && req.session.passport == undefined) {
      memID = req.session.memID;
  } else if (req.session.memID == undefined && req.session.passport != undefined) {
      memID = req.session.passport.user.id;
  }

  for (var i in req.files) {
      imgData.push(req.files[i].filename);
      console.log("files= ", req.files[i]);
      // if (recomCont.match("\\:imgLocation") != null) {
      //     console.log("近來囉");
      //     // recomCont = recomCont.replace("\\:imgLocation", "<div class='wrapperCard card-img-top' style='background-image: url(/userImg/" + req.files[i].filename + "'); border-radius:8px; '></div>");
      //     recomCont = recomCont.replace("\\:imgLocation", "<div class='wrapperCard card-img-top'><img src='/userImg/" + req.files[i].filename + "' style='max-height: 450px; max-width: 70%; cursor: pointer; border-radius: 12px; padding: 0.35em; ' ></div>");
      // }

  }

  console.log(recomCont);
  // console.log(imgData);
  // tag
  if (req.body.tag != '') {
      tagData = req.body.tag.split(",");
  }
  // console.log("typeof", typeof req.file);
  if (memID == undefined) {
      if (req.body.userImg != 'undefined') {
          for (var i = 0; i < imgData.length; i++) {
              fs.unlinkSync('public/imgs/recommend/' + imgData[i]); //刪除檔案
          }
      }
      res.send("請進行登入");
  } else {
      // console.log(req.file,imgType);
      if (typeof (req.file) != 'undefined') {
          //如果檔案超過限制大小
          if (req.file.size > maxSize) {
              isRender = false;
              for (var i = 0; i < imgData.length; i++) {
                  fs.unlinkSync('public/imgs/recommend/' + imgData[i]); //刪除檔案
              }
              res.send("圖片過大，僅接受1M以下的圖片");
          }
          //如果檔案類型不符合規定
          if ((imgType != '.png' && imgType != '.jpg' && imgType != '.jpeg' && imgType != '.jfif') && isRender) {
              isRender = false;
              for (var i = 0; i < imgData.length; i++) {
                  fs.unlinkSync('public/imgs/recommend/' + imgData[i]); //刪除檔案
              }
              res.send("只能上傳.jpg , .png , .jpeg , .jfif 類型的檔案");
          }
      }
      if (isRender) {
          if (recomHead == 'undefined' || recomCont == '') {
              if (req.body.userImg != 'undefined') {
                  for (var i = 0; i < imgData.length; i++) {
                      fs.unlinkSync('public/imgs/recommend/' + imgData[i]); //刪除檔案
                  }
              }
              res.send("標題及內容不可為空，請重新輸入");
          } else {
              if (req.body.userImg == 'undefined') {
                  for (var i = 0; i < imgData.length; i++) {
                      fs.unlinkSync('public/imgs/recommend/' + imgData[i]); //刪除檔案
                  }
              }
              member.recommendPost(memID, recomHead, recomCont, recomClass, postDateTime, imgData, tagData, analyzeScore, positiveWords, negativeWords).then(data => {
                  if (data == 0) {
                      console.log("發文成功");
                      res.send("發文成功");
                  } else {
                      for (var i = 0; i < imgData.length; i++) {
                          fs.unlinkSync('public/imgs/recommend/' + imgData[i]); //刪除檔案
                      }
                      console.log("發文失敗");
                      res.send("發文失敗");
                  }
              })
          }
      } else {
          for (var i = 0; i < imgData.length; i++) {
              fs.unlinkSync('public/imgs/recommend/' + imgData[i]); //刪除檔案
          }
          console.log("發文失敗");
          res.send("發文失敗");
      }
  }

});


module.exports = router;