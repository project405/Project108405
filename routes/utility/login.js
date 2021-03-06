'use strict';

//引用操作資料庫的物件
const sql = require('./asyncDB');

//===================================
// --------- 使用者登入 --------------
//===================================
var userLogin = async function(id, password){   
    var result;

    //取得員工資料
    await sql('SELECT * FROM "member" WHERE "memID"=$1 and "memPass"=$2', [id, password])
        .then((data) => {
            if(data.rows.length > 0){
                result = data.rows[0];
            }else{
                result = undefined;
            } 
        }, (error) => {
            result = undefined;
        });
    
    //回傳物件
    return result;
}

//---------------------------------------------
// line綁定
//---------------------------------------------
var userBind = async function(id, password, lineID){   
    var result;

    //取得員工資料
    await sql('SELECT * FROM "member" WHERE "memID"=$1 and "memPass"=$2', [id, password])
        .then((data) => {
            if(data.rows.length > 0){
                result = data.rows[0];
            } else {
                result = null;
            } 
        }, (error) => {
            result = null;
        });
    
    //回傳物件
    return result;
}

var addLineID = async function(memID, lineID){  
    var result;
    await sql('UPDATE "member" SET "lineID" = $2 WHERE "memID" = $1', [memID, lineID])
    .then((data) => {
        result = data.rows[0];
    }, (error) => {
        console.error(error)
        result = null;
    }) 
    //回傳物件
    return result;
}

var userJudgeBind = async function(lineID){
    
    var result ;

    
    await sql('SELECT * FROM "member" WHERE "lineID" = $1', [lineID])
        .then((data) => {
            if(!data.rows){
                result = undefined ;
            }else{
                result = data.rows ;
            }
        }, (error) => {
            result = undefined ;
        });


    //回傳物件
    return result;
}

//匯出
module.exports = {userLogin ,userBind ,addLineID ,userJudgeBind};