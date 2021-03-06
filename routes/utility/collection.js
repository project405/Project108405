'use strict';

//引用操作資料庫的物件
const sql = require('./asyncDB');
const member = require('./member');
var moment = require('moment');

//=========================================
//---------  getCollRecommend() -----------
//=========================================
var getCollRecommend = async function (memID, recompage) {
    var recommendList = [];
    var imgs = [] ; 
    var result = [];
    var collSum;
    //---------  取得收藏推薦內容 -------------
    await sql(`SELECT "T2".*
                FROM(
                    SELECT *
                    FROM( 
                        SELECT "A".*,"I"."imgNum", "I"."imgName", "C"."collDateTime", ROW_NUMBER() OVER(PARTITION BY "A"."recomNum" ORDER BY "I"."imgNum") as "Rank" 
                        FROM "recommendListDataView" AS "A"
                        LEFT JOIN "image" AS "I"
                                ON "A"."recomNum" = "I"."recomNum"
                        INNER JOIN "memberCollection" AS "C"
                                ON "A"."recomNum" = "C"."recomNum"
                        WHERE "I"."recomMessNum" IS NULL AND "C"."memID" = $1) AS "T1"
                    WHERE "T1"."Rank" = '1'
                    ORDER BY "T1"."collDateTime" DESC
                    LIMIT 8
                    OFFSET $2 ) AS "T2"
                ORDER BY "collDateTime" DESC`, [memID, (recompage-1)*8])
        .then((data) => {
            if (!data.rows){
                recommendList = undefined ;
            }else{
                recommendList = data.rows;
            }   
        }, (error) => {
            recommendList = undefined ;
        });

    await sql(' SELECT COUNT(*) ' +
        ' FROM "recommend"' +
        ' WHERE "recomNum"' +
        ' IN (SELECT "recomNum" '+
            ' FROM "memberCollection" '+
            ' WHERE "memID" = $1 ) ', [memID])
        .then((data) => {
            collSum = data.rows;
        }, (error) => {
            collSum = undefined;
            console.log(error)
        })

    result[0] = recommendList ; 
    result[1] = [memID] ;
    // result[2] = checkAuthority ;
    // result[3] = imgs;
    result[4] = collSum;
    result[5] = [recompage];

    return result;
}

//=========================================
//---------  getOneCollRecom() -------------
//=========================================
var getOneColleRecommend = async function (recomNum, memID) {
    var oneRecommend = [];  //存放文章內容
    var oneRecomMessage = []; //存放文章留言內容
    var isCollection = []; //是否有收藏過
    var tag = [];
    var isLike = []; //是否有過愛心
    var isMessLike = []; //判斷留言愛心是否被按過
    var imgs = [] ;
    var result = [];
    var replyImgs = []
    var checkAuthority;
    

    // -----------  取得單一文章 --------------
    await sql('SELECT * FROM "recommendListDataView" WHERE "recomNum" = $1', [recomNum])
        .then((data) => {
            if (!data.rows) {
                oneRecommend = undefined;
            } else {
                oneRecommend = data.rows ; 
            }
        }, (error) => {
            oneRecommend = undefined;
        });
    
    // -----------  取得單一推薦所有留言 --------------
    await sql('SELECT "Mess"."recomMessNum" '+
                ' ,"Mess"."memID" '+
                ' ,to_char("Mess"."recomMessDateTime",\'YYYY-MM-DD\') AS "recomMessDateTime" '+
                ' ,"Mess"."recomMessCont" '+
                ' ,count("MessLike"."recomMessNum") AS "likeCount" '+
                ' ,"member"."memName"' +
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
            ' ORDER BY "recomMessNum"', [recomNum])
        .then((data) => {
           if(!data.rows){
              oneRecomMessage = undefined ;
           }else{
              oneRecomMessage = data.rows ;
           }
           
        }, (error) => {
            oneRecomMessage = undefined ;
        });

    await sql('SELECT "memAuthority" FROM "member" where "memID" = $1 ', [memID])
        .then((data) => {
            if (!data.rows[0]) {
                checkAuthority = undefined;
            } else {
                checkAuthority = data.rows[0].memAuthority;
            }
        }, (error) => {
            console.log(error)
        });
    // -----------  取得tag --------------
    await sql('SELECT "tagName" FROM "recommendTagView" WHERE "recomNum" = $1', [recomNum])
        .then((data) => {
            if (!data.rows) {
                tag = undefined ; 
            } else {
                tag = data.rows ;
            }
        }, (error) => {
            tag = undefined ; 
        });
   
    // ----------- 判斷是否被使用者收藏 -----------
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

    // ----------- 判斷是否被使用者案愛心 -----------
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

    // ----------- 判斷留言是否被按過愛心 -----------
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
            ' FROM "image" WHERE "recomNum" = $1 and "recomMessNum" IS NULL'+
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
              ' WHERE "recomNum" = $1 and "recomMessNum" IS NOT NULL '+
              ' ORDER BY "imgNum" ',[recomNum])
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

    result[0] = oneRecommend ;
    result[1] = oneRecomMessage ;
    result[2] = tag ;
    result[3] = imgs ;
    result[4] = isLike;
    result[5] = isCollection;
    result[6] = isMessLike;
    result[7] = checkAuthority;
    result[8] = [memID];
    result[9] = replyImgs;
    
    return result;
}
//=========================================
//---------  getCollArticle() -------------
//=========================================
var getCollArticle = async function (memID, collpage) {
    var colleArticle = [];
    var tag = [];
    var isLike = [];
    var imgs = [];
    var result = [];
    var collSum;

    //---------  取得每個會員收藏的文章內容 -------------
    await sql(`SELECT "T2".*, "M"."memName"
                FROM(
                    SELECT *
                    FROM( 
                        SELECT "A".*,"I"."imgNum", "I"."imgName", "C"."collDateTime", ROW_NUMBER() OVER(PARTITION BY "A"."artiNum" ORDER BY "I"."imgNum") as "Rank" 
                        FROM "articleListDataView" AS "A"
                        LEFT JOIN "image" AS "I"
                                ON "A"."artiNum" = "I"."artiNum"
                        INNER JOIN "memberCollection" AS "C"
                                ON "A"."artiNum" = "C"."artiNum"
                        WHERE "I"."artiMessNum" IS NULL AND "C"."memID" = $1) AS "T1"
                    WHERE "T1"."Rank" = '1'
                    ORDER BY "T1"."collDateTime" DESC
                    LIMIT 10 
                    OFFSET $2 ) AS "T2"
                    INNER JOIN "member" "M"
                    ON "M"."memID" = "T2"."memID"
                ORDER BY "collDateTime" DESC`,  [memID, (collpage-1)*10 ])
        .then((data) => {
            if(!data.rows){
                colleArticle = undefined ; 
            }else {
                colleArticle = data.rows ;
            }
        }, (error) => {
            colleArticle = undefined ;
        });

    await sql('SELECT COUNT(*) ' +
            'FROM "articleListDataView" AS "artiView"' +
            'WHERE "artiView"."artiNum" '+
            'IN (SELECT "artiNum" FROM "memberCollection"  WHERE "memID" = $1)' , [memID])
    .then((data) => {
        collSum = data.rows;
    }, (error) => {
        collSum = undefined;
    })

    // -----------  取得每篇收藏文章的tag --------------
    await sql('SELECT "tagName" '+
             ' FROM "articleTagView" '+
             ' WHERE "artiNum" '+
                ' IN(SELECT "artiNum" '+
                   ' FROM "memberCollection"  '+
                   ' WHERE "memID" = $1)', [memID])
        .then((data) => {
            if (!data.rows) {
                tag = undefined ;
            } else {
                tag = data.rows ;
            }
        }, (error) => {
            tag = undefined ;
        });

    // ----------- 判斷是否被使用者按愛心 -----------
    await sql('SELECT "artiNum" '+
             ' FROM "articleLike" '+ 
             ' WHERE "artiNum" '+
                ' IN(SELECT "artiNum" '+
                   ' FROM "memberCollection" '+
                   ' WHERE "memID" = $1) AND "memID" = $1', [memID])
        .then((data) => {
            if (!data.rows) {
                isLike = undefined ; 
            } else {
                isLike = data.rows;
            }
        }, (error) => {
            isLike = undefined ; 
        });

    result[0] = colleArticle;
    result[1] = tag;
    result[2] = isLike;
    // result[3] = imgs;
    result[4] = [memID];
    result[5] = collSum;
    result[6] = [collpage];

    return result;
}

//===============================
//---- getCollRecomClassList ----
//===============================
var getCollRecomClassList = async function (memID, recomClass, recompage) {
    var recommendList = [];
    var imgs = [] ;
    var result = [];
    var collSum;
    //--------- 根據分類取得會員收藏的推薦內容 ---------
    await sql(`SELECT "T2".*
                FROM(
                    SELECT *
                    FROM( 
                        SELECT "A".*,"I"."imgNum", "I"."imgName", "C"."collDateTime", ROW_NUMBER() OVER(PARTITION BY "A"."recomNum" ORDER BY "I"."imgNum") as "Rank" 
                        FROM "recommendListDataView" AS "A"
                        LEFT JOIN "image" AS "I"
                                ON "A"."recomNum" = "I"."recomNum"
                        INNER JOIN "memberCollection" AS "C"
                                ON "A"."recomNum" = "C"."recomNum"
                        WHERE "I"."recomMessNum" IS NULL AND "C"."memID" = $1 AND "A"."recomClass" = $2) AS "T1"
                    WHERE "T1"."Rank" = '1'
                    ORDER BY "T1"."collDateTime" DESC
                    LIMIT 8
                    OFFSET $3 ) AS "T2"
                ORDER BY "collDateTime" DESC` , [memID, recomClass, (recompage-1)*8])
        .then((data) => {
            if(!data.rows){
                recommendList = undefined ; 
            }else {
                recommendList = data.rows ;
            }     
        }, (error) => {
            recommendList = undefined ; 
        });
    await sql(' SELECT COUNT(*) ' +
            ' FROM "recommendListDataView" AS "recomView" ' +
            ' WHERE "recomView"."recomNum"' +
            ' IN (SELECT "recomNum"  '+
            ' FROM "memberCollection" '+
            ' WHERE "memID" = $2 ) '+
            ' AND "recomView"."recomClass" = $1', [recomClass, memID])
    .then((data) => {
        collSum = data.rows;
    }, (error) => {
        collSum = undefined;
        console.log(error)
    })

    result[0] = recommendList ; 
    // result[1] = imgs ;
    // result[2] = checkAuthority ;
    result[3] = [memID];
    result[4] = collSum;
    result[5] = [recompage];

    return result ;

}

//===============================
//---- getCollArtiClassList ----
//===============================
var getCollArtiClassList = async function (memID, artiClass, collpage) {
    var articleList = [];
    var tag = [] ;
    var isLike = [] ;
    var imgs = [] ;
    var result = [];
    var collSum;
    //--------- 根據分類取得會員收藏的文章內容 ---------
    await sql(`SELECT "T2".*, "M"."memName"
                FROM(
                    SELECT *
                    FROM( 
                        SELECT "A".*,"I"."imgNum", "I"."imgName", "C"."collDateTime", ROW_NUMBER() OVER(PARTITION BY "A"."artiNum" ORDER BY "I"."imgNum") as "Rank" 
                        FROM "articleListDataView" AS "A"
                        LEFT JOIN "image" AS "I"
                                ON "A"."artiNum" = "I"."artiNum"
                        INNER JOIN "memberCollection" AS "C"
                                ON "A"."artiNum" = "C"."artiNum"
                        WHERE "I"."artiMessNum" IS NULL AND "C"."memID" = $1 AND "A"."artiClass" = $2)  AS "T1"
                    WHERE "T1"."Rank" = '1'
                    ORDER BY "T1"."collDateTime" DESC
                    LIMIT 10 
                    OFFSET $3 ) AS "T2"
                INNER JOIN "member" "M"
                    ON "M"."memID" = "T2"."memID"
                ORDER BY "collDateTime" DESC` , [memID, artiClass, (collpage-1)* 10])
        .then((data) => {
            if(!data.rows){
                articleList = undefined ; 
            }else {
                articleList = data.rows ;
            }     
        }, (error) => {
            console.log(error)
            articleList = undefined ; 
        });
    await sql(' SELECT COUNT(*) ' +
              ' FROM "articleListDataView"' +
              ' WHERE "artiNum"' +
              ' IN (SELECT "artiNum" '+
              ' FROM "memberCollection" '+
              ' WHERE "memID" = $2 ) '+
              ' AND "artiClass" = $1', [artiClass, memID])
        .then((data) => {
            collSum = data.rows;
        }, (error) => {
            collSum = undefined;
            console.log(error)

        })
    // -----------  取得每篇收藏文章的tag --------------
    await sql('SELECT "tagName" '+
              ' FROM "articleTagView" '+
              ' WHERE "artiNum" '+
                ' IN(SELECT "artiNum" '+
                   ' FROM "memberCollection"  '+
                   ' WHERE "memID" = $1)', [memID])
        .then((data) => {
            if (!data.rows) {
                tag = undefined ;
            } else {
                tag = data.rows ;
            }
        }, (error) => {
            tag = undefined ;
        });

    // --------- 判斷是否被使用者按愛心 ---------
    await sql('SELECT "artiNum" '+
        ' FROM "articleLike" '+ 
        ' WHERE "artiNum" '+
            ' IN(SELECT "artiNum" '+
                ' FROM "memberCollection" '+
                ' WHERE "memID" = $1)', [memID])
        .then((data) => {
            if (!data.rows) {
                isLike = undefined ; 
            } else {
                isLike = data.rows;
            }
        }, (error) => {
            isLike = undefined ; 
        });    

    result[0] = articleList ; 
    result[1] = tag ; 
    // result[2] = imgs ;
    result[3] = isLike ; 
    // result[4] = checkAuthority ;
    result[5] = [memID];
    result[6] = collSum;
    result[7] = [collpage];

    return result ;

}

//=========================================
//---------  addCollention() --------------
//=========================================
var addColleArticle = async function (memID, artiNum) {
    var addTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    var result;

    await sql('INSERT INTO "memberCollection" ("memID","artiNum","collDateTime") VALUES ($1,$2,$3)', [memID, artiNum, addTime])
        .then((data) => {
            result = 1;
        }, (error) => {
            result = 0;
        });

    return result;
}

//=========================================
//---------  addColleRecommend() ----------
//=========================================
var addColleRecommend = async function (memID, recomNum) {
    var addTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    var result;

    await sql('INSERT INTO "memberCollection" ("memID","recomNum","collDateTime") VALUES ($1,$2,$3)', [memID, recomNum,addTime])
        .then((data) => {
            result = 1;
        }, (error) => {
            result = 0;
        });

    return result;
}

//=========================================
//---------  delCollention() -----------
//=========================================
var delColleArticle = async function (memID, artiNum) {
    var result;

    await sql('DELETE FROM "memberCollection" WHERE "memID" = $1 and "artiNum"= $2', [memID, artiNum])
        .then((data) => {
            result = 1;
        }, (error) => {
            result = 0;
        });

    return result;
}

//=========================================
//---------  delColleRecommend() -----------
//=========================================
var delColleRecommend = async function (memID, recomNum) {
    var result;

    await sql('DELETE FROM "memberCollection" WHERE "memID" = $1 and "recomNum"= $2', [memID, recomNum])
        .then((data) => {
            result = 1;
        }, (error) => {
            result = 0;
        });
        
    return result;
}
module.exports = {
    getCollRecommend, getOneColleRecommend, getCollArticle,
    getCollRecomClassList,getCollArtiClassList,
    addColleArticle, delColleArticle,
    addColleRecommend, delColleRecommend
};