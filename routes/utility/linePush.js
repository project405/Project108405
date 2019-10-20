'use strict';

//引用操作資料庫的物件
const sql = require('./asyncDB');
const moment = require('moment');


//==============================
//------ 對推播內容點選喜愛 ------
//==============================

var linebotAddLike = async function (lineID) {
    var result;
    var isLike ;
    // 判斷是否被使用者按愛心
    console.log('8**************************')
    await sql('SELECT "memID", "artiNum" '+
              'FROM "articleLike" '+
              'WHERE "memID" IN (SELECT "memID"  FROM  "member" WHERE "lineID" =  $1', [lineID])


        .then((data) => {
            if(!data.rows){
                isLike = undefined ; 
                result = 1;

            }else{
                isLike = data.rows ;
                result = 0;
            }
        }, (error) => {
            isLike.push('0');
        });
    
    
    var addTime = moment(Date.now()).format("YYYY-MM-DD hh:mm:ss");
    var result;
    // await sql('INSERT INTO "articleLike" ("memID","artiNum","artiLikeDateTime") VALUES ($1,$2,$3)', [memID, artiNum, addTime])
    //     .then((data) => {
    //         result = 1;
    //     }, (error) => {
    //         result = 0;
    //     });
    return result;
  
}


//匯出
module.exports = {linebotAddLike};