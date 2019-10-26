'use strict';

//引用操作資料庫的物件
const sql = require('./asyncDB');
const moment = require('moment');


//==============================
//-------- 點選文章喜愛 --------
//==============================

var AddArticleLike = async function (lineID,artiNum) {
    var result ;
    var isLike ;
    console.log('後台的！！！！！！！！！！！！！！',lineID)
    console.log('後台的artiNum！！！！！！！！！！！！！！',artiNum)
    // 判斷是否被使用者按愛心
    await sql('SELECT "memID", "artiNum" '+
              'FROM "articleLike" '+
              'WHERE "memID" IN (SELECT "memID"  FROM  "member" WHERE "lineID" =  $1 and "artiNum" = $2)', [lineID,artiNum])
        .then((data) => {
            console.log(typeof(data.rows) === null )
            
            
            if(data.rows.length != 0){
                isLike = undefined; 
            }else{
                isLike = data.rows;
            }
        }, (error) => {
            isLike = undefined;;
        });
    
    
    var addTime = moment(Date.now()).format("YYYY-MM-DD hh:mm:ss");
    if(isLike != undefined){
        console.log('我有準備新增喔！')
        await sql('INSERT INTO "articleLike" ("memID","artiNum","artiLikeDateTime") VALUES ((SELECT "memID"  FROM  "member" WHERE "lineID" =  $1),$2,$3)', [lineID, artiNum, addTime])
            .then((data) => {
                result = 1;
            }, (error) => {
                result = 0;
            });
    }else{
        result = 0 ;
    }       
    return result; 
    
}

//==============================
//-------- 點選推薦喜愛 --------
//==============================

var AddRecommendLike = async function (lineID,recomNum) {
    var result ;
    var isLike ;
    console.log('後台的！！！！！！！！！！！！！！',lineID)
    console.log('後台的recomNum！！！！！！！！！！！！！！',recomNum)
    // 判斷是否被使用者按愛心
    await sql('SELECT "memID", "recomNum" '+
              'FROM "recommendLike" '+
              'WHERE "memID" IN (SELECT "memID"  FROM  "member" WHERE "lineID" =  $1 and "recomNum" = $2)', [lineID,recomNum])
        .then((data) => {
            console.log(typeof(data.rows) === null )
            
            
            if(data.rows.length != 0){
                isLike = undefined; 
            }else{
                isLike = data.rows;
            }
        }, (error) => {
            isLike = undefined;;
        });
    
    
    var addTime = moment(Date.now()).format("YYYY-MM-DD hh:mm:ss");
    if(isLike != undefined){
        console.log('我有準備新增喔！')
        await sql('INSERT INTO "recommendLike" ("memID","recomNum","recomLikeDateTime") VALUES ((SELECT "memID"  FROM  "member" WHERE "lineID" =  $1),$2,$3)', [lineID, recomNum, addTime])
            .then((data) => {
                result = 1;
            }, (error) => {
                result = 0;
            });
    }else{
        result = 0 ;
    }       
    return result; 
  
}


var artiImg = async function (artiNum) {
    var result;
    await sql('SELECT "imgName" FROM "image" WHERE "artiNum" = $1 LIMIT 1', [artiNum])
        .then((data) => {
            if (!data.rows) {
                result = undefined;
            } else {
                result = data.rows;
            }
        }, (error) => {
            result = undefined;
        });
    return result;
}

//==============================
//-------- 解碼base64 --------
//==============================
// var apiUrl = 'https://api.imgur.com/3/image';
// var apiKey = '8b8755d8a1c4ace';
        
        
var Imgur = async function (img) {
            const url = 'https://api.imgur.com/3/image',
            // const request;
            // try {
                request = await fetch(url, {
                    method: 'POST',
                    headers: {
                      "Content-Type": "application/json", 
                      "Authorization": 'Client-ID 8b8755d8a1c4ace',
                    },
                    dataType:"json" ,
                    body: img
                    // form: {
                    //   "image": img,
                    //   "image": img,
                    //   "type": "base64"
                    // }
                });
        
              const response = await request.json();
              
            //   console.log('response@@',response.data.link);
            //   console.log('bbb@@',bbb);
            //   console.log('response@@',response);
            return response.data.link;
            // } catch (e) {
            // //   throw new Error(e);
            // }
};
        

//匯出
module.exports = {AddArticleLike,AddRecommendLike,Imgur,artiImg};