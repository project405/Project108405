'use strict';

//引用操作資料庫的物件
const sql = require('./asyncDB');
const member = require('./member');
var moment = require('moment');

//=========================================
//---------  getRecommendList() -----------
//=========================================
var getRecommendList = async function (memID, recomPage) {
    var recommendList = [];
    var checkAuthority;
    var imgs = [] ; 
    var result = [];
    var recommendSum;
    // -----------  取得推薦清單 --------------
    await sql(`SELECT "T2".*
                FROM(
                    SELECT *
                    FROM( 
                        SELECT "A".*,"I"."imgNum", "I"."imgName", ROW_NUMBER() OVER(PARTITION BY "A"."recomNum" ORDER BY "I"."imgNum") as "Rank" 
                        FROM "recommendListDataView" AS "A"
                        LEFT JOIN "image" AS "I"
                                        ON "A"."recomNum" = "I"."recomNum"
                        WHERE "I"."recomMessNum" IS NULL)  AS "T1"
                    WHERE "T1"."Rank" = '1'
                    ORDER BY "recomNum" DESC
                    LIMIT 8
                    OFFSET $1 ) AS "T2"
                ORDER BY "recomDateTime" DESC , "recomNum" DESC `, [(recomPage-1) * 8])
        .then((data) => {
            if (data.rows != undefined) {
                recommendList = data.rows
            } else {
                recommendList = undefined
            }
        }, (error) => {
            console.log(error)
            recommendList = undefined;
        });
    
    await sql('SELECT COUNT(*) ' +
              'FROM "recommendListDataView"')
        .then((data) => {
            recommendSum = data.rows;
        }, (error) => {
            console.log(error)
            recommendSum = undefined;
        })

    //取得權限
    await member.checkAuthority(memID).then(data => {
        if (data != undefined) {
            checkAuthority = data;
        } else {
            checkAuthority = undefined;
        }
    })

    result[0] = recommendList;
    result[1] = [memID];
    result[2] = checkAuthority;
    // result[3] = imgs ;
    result[4] = recommendSum ;
    result[5] = [recomPage] ;
    return result;
}

//=========================================
//---------  getOneRecommend() -------------
//=========================================
var getOneRecommend = async function (recomNum, memID) {
    var oneRecommend = [];  //存放文章內容
    var oneRecomMessage = []; //存放文章留言內容
    var tag = [];
    var isCollection = [];
    var isLike = [];
    var isMessLike = []; //判斷留言愛心是否被按過
    var imgs = [] ;
    var checkAuthority;
    var result = [];
    var replyImgs = []
    var guessRecommend = undefined ; //取得猜測使用者可能喜歡的文章


    // -----------  取得單一推薦文章 --------------
    await sql('SELECT * FROM "recommendListDataView" WHERE "recomNum" = $1', [recomNum])
        .then((data) => {
            if (!data.rows) {
                oneRecommend = undefined ; 
            } else {
                oneRecommend = data.rows ; 
            }
        }, (error) => {
            oneRecommend = undefined ; 
        });
 

    // -----------  取得單一文章所有留言 --------------
    await sql('SELECT "Mess"."recomMessNum" '+
                ' ,"Mess"."memID" '+
                ' ,to_char("Mess"."recomMessDateTime",\'YYYY-MM-DD\') AS "recomMessDateTime" '+
                ' ,"Mess"."recomMessCont" '+
                ' ,count("MessLike"."recomMessNum") AS "likeCount" '+
                ',"member"."memName"' +
            ' FROM "recommendMessage" AS "Mess" '+
                ' LEFT JOIN "recommendMessageLike" AS "MessLike" '+
                    ' ON "Mess"."recomMessNum" = "MessLike"."recomMessNum" '+
                'INNER JOIN "member"' +
                    'ON "member"."memID" = "Mess"."memID"' +
            ' WHERE "Mess"."recomNum" = $1 '+
            ' GROUP BY "Mess"."recomMessNum" '+
                ' ,"Mess"."memID" '+
                ' ,"Mess"."recomMessDateTime" '+
                ' ,"Mess"."recomMessCont"'+
                ' ,"member"."memName" ' +
            ' ORDER BY "Mess"."recomMessDateTime"', [recomNum])
        .then((data) => {
           if(!data.rows){
                oneRecomMessage = undefined ;
           }else {
                oneRecomMessage = data.rows;
           }
        }, (error) => {
            oneRecomMessage = undefined ;
        });
  
    // -----------  取得tag --------------
    await sql('SELECT "tagName" FROM "recommendTagView" WHERE "recomNum" = $1 ', [recomNum])
        .then((data) => {
            if (!data.rows) {
                tag = undefined ;
            } else {
               tag = data.rows ;
            }
        }, (error) => {
            tag = undefined ;
        });

    // 判斷是否被使用者收藏
    await sql('SELECT "memID" , "recomNum" FROM "memberCollection" WHERE "recomNum" = $1 AND "memID" = $2', [recomNum, memID])
        .then((data) => {
            if (!data.rows) {
                isCollection = undefined ; 
            } else {
                isCollection = data.rows ;
            }
        }, (error) => {
            isCollection = undefined ; 
        });
    // 判斷是否被使用者案愛心
    await sql('SELECT "recomNum" FROM "recommendLike" WHERE "recomNum" = $1 AND "memID" = $2 ', [recomNum, memID])
        .then((data) => {
            if (!data.rows) {
                isLike = undefined ;
            } else {
                isLike = data.rows ;
            }
        }, (error) => {
            isLike = undefined ;
        });

    // 判斷留言是否被按過愛心
    await sql('SELECT "Mess"."recomMessNum" '+
            ' FROM "recommendMessage" AS "Mess" '+
                ' INNER JOIN "recommendMessageLike" AS "MessLike" '+
                ' ON "Mess"."recomMessNum" = "MessLike"."recomMessNum" '+
            ' WHERE "Mess"."recomNum" = $1 AND "MessLike"."memID" = $2', [recomNum, memID])
        .then((data) => {
            if (!data.rows) {
                isMessLike = undefined ;
            } else {
                isMessLike = data.rows;
            }
        }, (error) => {
            isMessLike = undefined ;
        });

    //----------- 取得照片 ----------- 
    await sql('SELECT "recomNum" , "imgName" '+
             ' FROM "image" '+ 
             ' WHERE "recomNum" = $1 and "recomMessNum" IS NULL'+
             ' ORDER BY "imgNum"',[recomNum])
    .then((data) => {
        if (!data.rows) {
            imgs = undefined;
        } else {
            imgs = data.rows;
        }
    }, (error) => {
        imgs = undefined;
    });

    // ----------- 取得照片 -----------
    await sql('SELECT "recomNum" , "imgName" '+
             ' FROM "image" '+ 
             ' WHERE "recomNum" = $1 and "recomMessNum" IS NOT NULL'+
             ' ORDER BY "recomMessNum","imgNum"',[recomNum])
    .then((data) => {
        if (!data.rows) {
            replyImgs = undefined;
        } else {
            replyImgs = data.rows;
        }
    }, (error) => {
        replyImgs = undefined;
        console.log(error)
    });

    
    // ----------- 根據該文章的tag去猜測使用者可能喜歡的文章 -----------
    await sql('SELECT * '+ 
              ' FROM "recommend" '+
              ' WHERE "recomNum" '+ 
              ' IN(SELECT "A"."recomNum" '+
                ' FROM(SELECT "recomNum" , count("recomNum") '+
                    ' FROM "tagLinkArticle" '+
                    ' WHERE "tagNum" '+ 
                        ' IN(SELECT "tagNum" '+
                            ' FROM "tag" '+
                            ' WHERE "tagName"  '+
                                ' IN(SELECT "tagName" '+
                                    ' FROM "tag" '+
                                    ' WHERE "tagNum" '+
                                        ' IN (SELECT "tagNum" '+ 
                                            ' FROM "tagLinkArticle" '+ 
                                            ' WHERE "recomNum" = $1 ) '+
                                    ' ) '+
                            ' ) AND "recomNum" != $1 '+
                    ' GROUP BY "recomNum" '+
                    ' ORDER BY "count" DESC ,"recomNum" DESC '+
                    ' LiMIT 3 '+
                    ' ) AS "A" '+
                ') '+
        ' ORDER BY "recomNum" DESC', [recomNum])
        .then((data) => {
            if (data.rowCount <= 0) {
                guessRecommend = undefined ;
            } else {
                guessRecommend = data.rows;
            }   
        });
        
    // ----------- 如果tag沒任何關聯 則隨機取三篇文章 -----------
    if(guessRecommend == undefined){
        await sql('SELECT * '+
            ' FROM "recommend" '+
            ' ORDER BY random() '+
            ' LIMIT 3') 
        .then((data) => {
                if (!data.rows) {
                    guessRecommend = undefined ;
                } else {
                    
                    guessRecommend = data.rows;
                }   
        });
    }else if(guessRecommend.length < 3 ) { //  如果tag關聯數量小於三篇文章 
        if(guessRecommend.length == 1 ){ //如果只有一篇
            await sql('SELECT * '+
                    ' FROM "recommend" '+
                    ' WHERE "recomNum" != $1 '+
                    ' ORDER BY random() '+
                    ' LIMIT 2',[guessRecommend[0].recomNum]) 
            .then((data) => {
                    if (!data.rows) {
                        guessRecommend = undefined ;
                    } else {
                        for(var i = 0 ; i < data.rows.length ; i++){
                            guessRecommend.push(data.rows[i]);
                        }
                    }   
            });
        }else if (guessRecommend.length == 2 ){  //如果有兩篇
            await sql('SELECT * '+
                     ' FROM "recommend" '+
                     ' WHERE "recomNum" != $1 AND "recomNum" != $2 '+
                     ' ORDER BY random() '+
                     ' LIMIT 1',[guessRecommend[0].recomNum ,guessRecommend[1].recomNum]) 
            .then((data) => {
                    if (!data.rows) {
                        guessRecommend = undefined ;
                    } else {
                        guessRecommend.push(data.rows[0]);
                    }   
            });
        }
    }
    
    //取得權限
    await member.checkAuthority(memID).then(data => {
        if (data != undefined) {
            checkAuthority = data;
        } else {
            checkAuthority = undefined;
        }
    })

    result[0] = oneRecommend;
    result[1] = oneRecomMessage;
    result[2] = tag;
    result[3] = imgs ;
    result[4] = isLike;
    result[5] = isCollection;
    result[6] = isMessLike;
    result[7] = checkAuthority;
    result[8] = [memID];
    result[9] = replyImgs;
    result[10] = guessRecommend;
    
    return result;
}
//=========================================
//---------  getOneRecommendReply() -------
//=========================================
var getOneRecommendReply = async function (recomMessNum, memID) {
    var oneReply = []; //存放文章留言內容
    var replyImgs = [];
    var result = [];

    //取得單篇留言
    await sql('SELECT * FROM "recommendMessage" WHERE "recomMessNum"= $1 ORDER BY "recomMessDateTime" ' , [recomMessNum])
    .then((data) => {
        if (!data.rows) {
            oneReply = undefined;
        } else {
            oneReply = data.rows;
        }
    }, (error) => {
        oneReply = undefined;
        console.log(error)
    });

    // ----------- 取得照片 -----------
    await sql('SELECT "recomMessNum" , "imgName" '+
             ' FROM "image" '+
             ' WHERE "recomMessNum" = $1 '+
             ' ORDER BY "imgNum"',[recomMessNum])
        .then((data) => {
            if (!data.rows) {
                replyImgs = undefined;
            } else {
                replyImgs = data.rows;
            }
        }, (error) => {
            replyImgs = undefined;
            console.log(error)
        });

    result[0] = oneReply;
    result[1] = replyImgs;
    result[2] = [memID];
    return result;
}

//==============================
//---- getRecomClassList () ----
//==============================
//---------  getRecomClassList() -------------
var getRecomClassList = async function (recomClass, memID, recomPage) {
    var recommendData = [];
    var checkAuthority;
    var imgs = [] ;
    var result = [];
    var recomSum;

    // -----------  取得推薦清單 --------------
    await sql(`SELECT "T2".*
                FROM(
                    SELECT *
                    FROM( 
                        SELECT "A".*,"I"."imgNum", "I"."imgName", ROW_NUMBER() OVER(PARTITION BY "A"."recomNum" ORDER BY "I"."imgNum") as "Rank" 
                        FROM "recommendListDataView" AS "A"
                        LEFT JOIN "image" AS "I"
                                        ON "A"."recomNum" = "I"."recomNum"
                        WHERE "I"."recomMessNum" IS NULL)  AS "T1"
                    WHERE "T1"."Rank" = '1' AND "recomClass" = $1
                    ORDER BY "recomNum" DESC
                    LIMIT 8
                    OFFSET $2 ) AS "T2"
                ORDER BY "recomDateTime" DESC , "recomNum" DESC`, [recomClass, (recomPage-1)*8])
        .then((data) => {
          if(!data.rows){
            recommendData = undefined ;
          }else{
            recommendData = data.rows ;
          }
        }, (error) => {
            recommendData = undefined ;
        });

    await sql('SELECT COUNT(*) ' +
              'FROM "recommendListDataView"' +
              'WHERE "recomClass" = $1' , [recomClass])
    .then((data) => {
        recomSum = data.rows;
    }, (error) => {
        recomSum = undefined;
    })

    //取得權限
    await member.checkAuthority(memID).then(data => {
        if (data != undefined) {
            checkAuthority = data;
        } else {
            checkAuthority = undefined;
        }
    })

    // //----------- 取得照片 ----------- 
    // await sql('SELECT "recomNum" , "imgName" '+
    //          ' FROM "image" '+
    //          ' ORDER BY "imgNum"')
    // .then((data) => {
    //     if (!data.rows) {
    //         imgs = undefined;
    //     } else {
    //         imgs = data.rows;
    //     }
    // }, (error) => {
    //     imgs = undefined;
    // });

    result[0] = recommendData;
    result[1] = [memID];
    result[2] = checkAuthority;
    // result[3] = imgs ; 
    result[4] = recomSum;
    result[5] = [recomPage];


    return result;
}

//=========================================
//---------  addRecommendLike() -----------
//=========================================
var addRecommendLike = async function (memID, recomNum) {
    var addTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    var result;

    await sql('INSERT INTO "recommendLike" ("memID","recomNum","recomLikeDateTime") VALUES ($1,$2,$3)', [memID, recomNum, addTime])
        .then((data) => {
            result = 1;
        }, (error) => {
            result = 0;
        });
    return result;
}
//=========================================
//---------  delRecommedLike() -----------
//=========================================
var delRecommendLike = async function (memID, recomNum) {
    var result;
    await sql('DELETE FROM "recommendLike" WHERE "memID" = $1 and "recomNum"= $2', [memID, recomNum])
        .then((data) => {
            result = 1;
        }, (error) => {
            result = 0;
        });
    return result;
}

module.exports = {
    getRecommendList, getOneRecommend,
    getRecomClassList,
    addRecommendLike, delRecommendLike, getOneRecommendReply
}