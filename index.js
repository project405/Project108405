//----------------------------------------
// 載入必要的模組
//----------------------------------------
var linebot = require('linebot');
var express = require('express');
// var Promise = require('express-promise');

//增加引用函式
// const collection = require('./utility/collection');
const index = require('./routes/utility/index');
const login = require('./routes/utility/login');
const collection = require('./routes/utility/collection');
const recommend = require('./routes/utility/recommend');
const mood = require('./routes/utility/mood');
const linePush = require('./routes/utility/linePush');




//----------------------------------------
// 填入自己在Line Developers的channel值
//----------------------------------------
var bot = linebot({
    channelId: '1594135622',
    channelSecret: 'c503bd8ed4d7b8e183333309ddd135fd',
    channelAccessToken: 'xQw+g1O20RWNkcAoq8UXnPeucNdgBaXKgSv26TQxIUouB1Ld3Y8KpS6vtjWtEldqWl5jRU1Xdp5m0nUUbaKQ7FE+YNVtTQbdGH3D+12qfXFCgk+uXwbgHSbGdmPThSJFvPMqNctqd5jUePtJLTdBggdB04t89/1O/w1cDnyilFU='
});

      

//========================================
// 機器人接受回覆的處理
//========================================
bot.on('postback', function(event) { 
    event.source.profile().then(
        function (profile) {
            
            const userName = profile.displayName;
            const userId = profile.userId;
            const data = event.postback.data;
            console.log("postback 資料",data)
            console.log("userId",userId)
            //------------------------------------------------
            //----------------未綁定Line_id用戶-----------------
            //------------------------------------------------
            var myLineTemplate={
                type: 'template',
                altText: '很抱歉您未綁定line',
                template: {
                    type: 'buttons',
                    text: 'LINE用戶請至文藝富心登入\n登入後能：\n1.在LINE收藏你喜歡的事物\n2.不定時收到文藝相關資訊',
                    actions: [{
                        type:"uri",
                        label:" 👣 至文藝富心官網登入",
                        // uri:"line://app/1594135622-705e8pDP"   
                        uri: "line://app/1594135622-82v9mEZq"

                    }]
                }
            };
            
            
            if (data == '電影' ||data == '音樂' ||data == '書籍' || data =='展覽'){
                //---------------進到四大推薦---------------
                index.getIndexData().then(d => {  
                    
                    let recommendCont = [];
                    let recommendNum = [];
                    let recommendClass = [];
                    d[0].forEach(item => {
                        item.recomCont = item.recomCont.replace(/\n/g,' ').replace(/\r/g,' ').replace(/\\:imgLocation/g, ' ').replace(/<br>/g,' ');
                        item.recomCont = item.recomCont.length>75 ? `${item.recomCont.substr(0,75)}...` : item.recomCont
                        recommendCont.push(item.recomCont);
                        recommendNum.push(item.recomNum);
                        recommendClass.push(item.recomClass);
                        if (data == item.recomClass){
                            return event.reply([
                                {
                                    "type": "template",
                                    "altText": `精選${item.recomClass}`,
                                    "template": {
                                        "type": "buttons",
                                        "text": item.recomCont,
                                        "actions": [
                                        {
                                            "type": "uri",
                                            "label": " 👀 至文藝富心官網觀看",
                                            "uri": `https://project108405.herokuapp.com/oneRecommend/${item.recomNum}`
                                        }
                                        ]
                                    }
                                }
                            ]);		
                        }
                    });
                });
            }else if(data.match('add')){
                login.userJudgeBind(userId).then(userID =>{
                    console.log('userID!!!!!!!',userID)
                    if(userID.length !== 0){                         
                        if(userID[0].lineID == userId){
                            var addRecom = data.replace('add','')
                            console.log('addRecom!!!!!!!!!!!!!!!!',addRecom)
                            collection.addLineColleRecommend(userID[0].memID, parseInt(addRecom)).then(b =>{
                                console.log(b)
                                if(b == 0){
                                    event.reply({
                                        "type": "template",
                                        "altText": "已重複收藏 ❌ ",
                                        "template": {
                                          "type": "buttons",
                                          "text": '          '+userName+' 已重複收藏 ❌ ',
                                          "actions": [
                                            {
                                              "type": "uri",
                                              "label": " 👀 查看所有收藏",
                                              "uri": `https://project108405.herokuapp.com/collection/recommend/`
                                            //   "uri": `https://8d9dfb88.ngrok.io/collection/recommend/1`
                                            }
                                          ]
                                        }
                                    })
                                }else{
                                    event.reply({
                                        "type": "template",
                                        "altText": "已收藏成功 😍",
                                        "template": {
                                          "type": "buttons",
                                          "text": '          '+userName+' 已收藏成功 😍 ',
                                          "actions": [
                                            {
                                              "type": "uri",
                                              "label": " 👀 查看所有收藏",
                                              "uri": `https://project108405.herokuapp.com/collection/recommend/1`
                                            }
                                          ]
                                        }
                                    })
                                    
                                }
                            })                            
                        }
                        
                    }else{
                        event.reply(myLineTemplate)
                    }
                }) 
            }else if (data.match("article")){
                login.userJudgeBind(userId).then(d =>{
                    if(d.length !== 0){                         
                        if(d[0].lineID == userId){
                            var spliceData = data.replace('article','')
                            console.log('切割後的data!!!!!!!!',spliceData)
                            linePush.AddArticleLike(userId,spliceData).then(data =>{
                                console.log(data)
                                // if(data == 1){
                                    // console.log('喜愛成功')
                                    event.reply('你的喜歡\n       是我們努力的動力...🌱')
                                // }else{
                                //     console.log('已點選過喜愛')
                                // }
                            })
                        }
                    }else{
                        event.reply(myLineTemplate)
                    }
                })
            }else if (data.match("oneRecommend")){
                login.userJudgeBind(userId).then(d =>{
                    if(d.length !== 0){                         
                        if(d[0].lineID == userId){
                            var spliceData = data.replace('recommend','')
                            console.log('切割後的data!!!!!!!!',spliceData)
                            linePush.AddRecommendLike(userId,spliceData).then(data =>{
                                console.log("外面的data!!!!!!!!!!",data)
                                // if(data == 1){
                                    // console.log('喜愛成功')
                                    event.reply('你的喜歡\n       是我們努力的動力...🌱')
                                // }else{
                                //     console.log('已重複按過囉')
                                // }
                            })
                        }
                    }else{
                        event.reply(myLineTemplate)
                    }
                })
            }else if (data == 'dislike'){
                event.reply('文藝富心又更加了解你了')
            }else if(data == 'Goodmood'){
                mood.getMood().then((data) => {
                    console.log('data',data[1])
                    // console.log('data.analyzeScore',data[1].analyzeScore)                    
                    // console.log('@@@@@@@@@@@@@@@@@data.score2,',data[1].score2)                    
                    var goodMoodRecommend = [];

                    if(data[1].artiNum !=  undefined){
                       
                        data[1].artiCont = data[1].artiCont.replace(/\n/g,' ').replace(/\r/g,' ').replace(/\\:imgLocation/g, ' ').replace(/<br>/g,' ');
                        data[1].artiHead = data[1].artiHead.length>30 ? `${data[1].artiHead.substr(0,25)}...` : data[1].artiHead
                        data[1].artiCont = data[1].artiCont.length>50 ? `${data[1].artiCont.substr(0,45)}...` : data[1].artiCont
                        goodMoodRecommend.push('article/'+data[1].artiNum)
                        goodMoodRecommend.push(data[1].artiHead)
                        goodMoodRecommend.push(data[1].artiCont)
                        
                    }else{
                        
                        data[1].recomCont = data[1].recomCont.replace(/\n/g,' ').replace(/\r/g,' ').replace(/\\:imgLocation/g, ' ').replace(/<br>/g,' ');
                        data[1].recomHead = data[1].recomHead.length>30 ? `${data[1].recomHead.substr(0,25)}...` : data[1].recomHead
                        data[1].recomCont = data[1].recomCont.length>50 ? `${data[1].recomCont.substr(0,45)}...` : data[1].recomCont
                        goodMoodRecommend.push('oneRecommend/'+data[1].recomNum)
                        goodMoodRecommend.push(data[1].recomHead)
                        goodMoodRecommend.push(data[1].recomCont)
                    }

                    console.log('good!!!!!!!!!!!!!!!!!',goodMoodRecommend)
                    event.reply({
                        "type": "template",
                        "altText": " 體會，每一種情緒 ",
                        "template": {
                            "type": "carousel",
                            "columns": [
                                {
                                    "title": "【" + goodMoodRecommend[1] + "】" ,
                                    "text": goodMoodRecommend[2] ,
                                    "actions": [
                                        {
                                            "type": "uri",
                                            "label": " 👀 至文藝富心官網觀看",
                                            "uri": `https://project108405.herokuapp.com/${goodMoodRecommend[0]}`
                                            
                                        }
                                    ]
                                }
                            ]
                        }
                    });
                })
                
            }else if(data == 'Badmood'){
                function promiseGetBadMood(GetBadMoodImg) {
                    return new Promise(function(resolve, reject){
                        var badMoodRecommendImg ;
                        if(GetBadMoodImg){
                            if(GetBadMoodImg.match('data:image/jpeg;base64')){
                                console.log('11111')
                                var imgur = imgurGetBadMood(GetBadMoodImg)
                                imgur.then(function(imgurData){
                                    setTimeout(() => {
                                        console.log('近來了！！！')
                                        // resolve(imgurData);
                                        badMoodRecommendImg = imgurData;                  
                                    },1000)
                                })
                            }else{
                                console.log('有圖片但不是base64')
                                badMoodRecommendImg = GetBadMoodImg;
                            }
                        }else{
                            console.log('沒有圖片的')
                            badMoodRecommendImg = 'https://i.imgur.com/oNykVvA.jpg';
                        }
                        resolve(badMoodRecommendImg)                  
                    }) 
                }

                function imgurGetBadMood(GetBadMoodImg) {
                    return new Promise(function(resolve, reject){
                        var img = GetBadMoodImg.replace('data:image/jpeg;base64,', '');
                        linePush.Imgur(img).then((imgData) =>{
                            console.log('成功轉換base64')  
                            resolve(imgData)
                        })
                        
                    })
                }

                mood.getMood().then((data) => {
                    console.log('data[0]',data[0])
                    console.log('data[0].imgName',data[0].imgName)
                    // console.log('data.analyzeScore',data[0].analyzeScore)
                    // console.log('@@@@@@@@@@@@@@@@@data.score2,',data[0].score2)                    
                    var badMoodRecommend = [];
                                      
                    promiseGetBadMood(data[0].imgName).then(function(imgName){
                        if(data[0].artiNum !=  undefined){
                            
                            data[0].artiCont = data[0].artiCont.replace(/\n/g,' ').replace(/\r/g,' ').replace(/\\:imgLocation/g, ' ').replace(/<br>/g,' ');
                            data[0].artiHead = data[0].artiHead.length>30 ? `${data[0].artiHead.substr(0,25)}...` : data[0].artiHead
                            data[0].artiCont = data[0].artiCont.length>50 ? `${data[0].artiCont.substr(0,45)}...` : data[0].artiCont
                            badMoodRecommend.push('article/'+data[0].artiNum)
                            badMoodRecommend.push(data[0].artiHead)
                            badMoodRecommend.push(data[0].artiCont)
                            
                        }else{
                            
                            data[0].recomCont = data[0].recomCont.replace(/\n/g,' ').replace(/\r/g,' ').replace(/\\:imgLocation/g, ' ').replace(/<br>/g,' ');
                            data[0].recomHead = data[0].recomHead.length>30 ? `${data[0].recomHead.substr(0,25)}...` : data[0].recomHead
                            data[0].recomCont = data[0].recomCont.length>50 ? `${data[0].recomCont.substr(0,45)}...` : data[0].recomCont
                            badMoodRecommend.push('oneRecommend/'+data[0].recomNum)
                            badMoodRecommend.push(data[0].recomHead)
                            badMoodRecommend.push(data[0].recomCont)
    
                        }
                        
                            console.log('badMoodRecommendImg',imgName)
                            console.log('bad!!!!!!!!!!!!!!!!!',badMoodRecommend)
                            event.reply(
                                {
                                    "type": "template",
                                    "altText": " 體會，每一種情緒 ",
                                    "template": {
                                    "type": "buttons",
                                    "imageAspectRatio": "rectangle",
                                    "imageSize": "contain",
                                    "thumbnailImageUrl": imgName,
                                    "imageBackgroundColor": '#ffffff',
                                    "title":  "【" + badMoodRecommend[1] + "】",
                                    "text":  badMoodRecommend[2],
                                    "defaultAction": {
                                        "type": "message",
                                        "label": "點到圖片或標題",
                                        "text": "0"
                                    },
                                    "actions": [
                                        {
                                            "type": "uri",
                                            "label": " 👀 至文藝富心官網觀看",
                                            "uri":`https://project108405.herokuapp.com/${badMoodRecommend[0]}`
                                        }
                                    ]
                                    }
                                }    
                            );
                       
                    
                    })
                    
                })    

                    
            }
            // else{
            //     login.userJudgeBind(userId).then(userID =>{
            //         console.log('userID!!!!!!!',userID)
            //         if(userID.length !== 0){                         
            //             if(userID[0].lineID == userId){
            //                 console.log('data!!!!!!!!!!!!!!!!',data)
            //                 collection.addLineColleRecommend(userID[0].memID, parseInt(data)).then(b =>{
            //                     console.log(b)
            //                     if(b == 0){
            //                         event.reply({
            //                             "type": "template",
            //                             "altText": "已重複收藏 ❌ ",
            //                             "template": {
            //                               "type": "buttons",
            //                               "text": '          '+userName+' 已重複收藏 ❌ ',
            //                               "actions": [
            //                                 {
            //                                   "type": "uri",
            //                                   "label": " 👀 查看所有收藏",
            //                                   "uri": `https://project108405.herokuapp.com/collection/recommend/`
            //                                 //   "uri": `https://8d9dfb88.ngrok.io/collection/recommend/1`
            //                                 }
            //                               ]
            //                             }
            //                         })
            //                     }else{
            //                         event.reply({
            //                             "type": "template",
            //                             "altText": "已收藏成功 😍",
            //                             "template": {
            //                               "type": "buttons",
            //                               "text": '          '+userName+' 已收藏成功 😍 ',
            //                               "actions": [
            //                                 {
            //                                   "type": "uri",
            //                                   "label": " 👀 查看所有收藏",
            //                                   "uri": `https://project108405.herokuapp.com/collection/recommend/1`
            //                                 }
            //                               ]
            //                             }
            //                         })
                                    
            //                     }
            //                 })                            
            //             }
                        
            //         }else{
            //             event.reply(myLineTemplate)
            //         }
            //     })  
            // }         
    });    
});



//----------------成功
//網址需連到heroku、圖片也是
bot.on('message', function(event) {
    
    event.source.profile().then(
        function (profile) {
            
            const userName = profile.displayName;
            const userId = profile.userId;
            
    //使用者傳來的文字
    const text = event.message.text;
    
   //------------------------------------------------
   //------------------顯示熱門文章--------------------
   //------------------------------------------------
   
    if (text == "熱門文章") {
        index.getIndexData().then(data => {
             
            console.log(data[1])
            let hotArticleNum = []  
            let hotArticleHead = []  
            let hotArticleCont = []  
            let hotArticleDateTime = []  
            let hotArticleImg = [];
            
            data[1].forEach(async(item, index) =>{
                item.artiCont = item.artiCont.replace(/\n/g,' ').replace(/\r/g,' ').replace(/<br>/g,' ').replace(/\\:imgLocation/g, ' ');
                item.artiCont = item.artiCont.length>35 ? `${item.artiCont.substr(0,34)}...` : item.artiCont
                hotArticleNum.push(item.artiNum)
                hotArticleHead.push(item.artiHead)
                hotArticleCont.push(item.artiCont)
                hotArticleDateTime.push(item.artiDateTime)
                 //-------------
                if(item.imgName){
                    var img = item.imgName.replace('data:image/jpeg;base64,', '');
                    await linePush.Imgur(img).then((imgurData) => {
                        hotArticleImg.splice(index,0,imgurData);
                    })  

                }else{
                    hotArticleImg.splice(index,0,'https://i.imgur.com/oNykVvA.jpg');
                }
                var secondCheck = setInterval(() => {
                    if (hotArticleImg.length == 3) {
                        console.log(hotArticleImg);
                        
                        event.reply(
                            {
                            "type": "template",
                            "altText": "熱門文章",
                            "template": {
                                "type": "carousel",
                                "columns": [
                                    {
                                        "title": "【" + hotArticleHead[0] + "】" ,
                                        "text":'時間：' + hotArticleDateTime[0]  + '\n' + hotArticleCont[0] ,
                                        "actions": [
                                            
                                            {
                                                "type": "uri",
                                                "label": " 👀 至文藝富心官網觀看",
                                                "uri": `https://project108405.herokuapp.com/article/${hotArticleNum[0]}`
                                            }
                                        ]
                                    },
                                    {
                                        "title": "【" + hotArticleHead[1] + "】" ,
                                        "text":'時間：' + hotArticleDateTime[1]  + '\n'+  hotArticleCont[1],
                                        "actions": [
                                            
                                            {
                                                "type": "uri",
                                                "label": " 👀 至文藝富心官網觀看",
                                                "uri": `https://project108405.herokuapp.com/article/${hotArticleNum[1]}`
                                            }
                                        ]
                                    },
                                    {
                                        "title": "【" + hotArticleHead[2] + "】" ,
                                        "text":'時間：' + hotArticleDateTime[2]  + '\n'+ hotArticleCont[2],
                                        "actions": [
                                            
                                            {
                                                "type": "uri",
                                                "label": " 👀 至文藝富心官網觀看",
                                                "uri": `https://project108405.herokuapp.com/article/${hotArticleNum[2]}`
                                            }
                                        ]
                                    }      
                                ]
                            }
                        });
                        clearInterval(secondCheck);
                    }  
                }, 250)
            })

        })
    };
    
    function DateTimeFormat (time){
        
        var dt = new Date(time);
        dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
        var date = dt.toISOString().slice(0, -5).replace(/[T]/g, ' ');
        var formatData = date.split(' ')[0]
        return formatData;
    }

    //-----------本週推薦-----------
	if(text == '本週推薦'){
        index.getIndexData().then(function(data) {  
            
            let recommendNum = []  
            let recommendClass = []  
            let recommendHead = []  
            let recommendDateTime = []  
            let recommendImg = [];
            
            data[0].forEach(async(item, index) => {
                
                recommendNum.push(item.recomNum);
                recommendClass.push(item.recomClass);
                recommendHead.push(item.recomHead);
                recommendDateTime.push(item.recomDateTime);
                //-------------
                if(item.imgName){
                    var img = item.imgName.replace('data:image/jpeg;base64,', '');
                    await linePush.Imgur(img).then((imgurData) => {
                        recommendImg.splice(index,0,imgurData);
                    })  

                }else{
                    recommendImg.splice(index,0,'https://i.imgur.com/oNykVvA.jpg');
                }
                var secondCheck = setInterval(() => {
                    if (recommendImg.length == 4) {
                        console.log(recommendImg);
                        event.reply({
                            "type": "template",
                            "altText": " 👋 本週新推薦",
                            "template": {
                                "type": "carousel",
                                "columns": [
                                        {
                                            "thumbnailImageUrl": recommendImg[0],
                                            "title": "【" + recommendClass[0] + "】" + recommendHead[0],
                                            "text": DateTimeFormat(recommendDateTime[0]),
                                            "defaultAction": {
                                                "type": "uri",
                                                "label": "知道更多",
                                                "uri": `https://project108405.herokuapp.com/oneRecommend/${recommendNum[0]}`
                                            },
                                            "actions": [
                                                {
                                                    "type": "postback",
                                                    "label": "知道更多",
                                                    "data": recommendClass[0]
                                                },
                                                {
                                                    
                                                    "type": "postback",
                                                    "label": "新增至我的收藏",
                                                    "data": `add${recommendNum[0]}`
                                                }
                                            ]
                                        }
                                    ,{
                                    "thumbnailImageUrl": recommendImg[1],
                                    "title":"【" + recommendClass[1] + "】" + recommendHead[1],
                                    "text": DateTimeFormat(recommendDateTime[1]),
                                    "defaultAction": {
                                        "type": "uri",
                                        "label": "詳細資料",
                                        "uri": `https://project108405.herokuapp.com/oneRecommend/${recommendNum[1]}`
                                    },
                                    "actions": [
                                            {
                                                "type": "postback",
                                                "label": "知道更多",
                                                "data": recommendClass[1]
                                            },
                                            {
                                        
                                                "type": "postback",
                                                "label": "新增至我的收藏",
                                                "data": `add${recommendNum[1]}`
                                            }
                                        ]   
                                    },
                                    {
                                        "thumbnailImageUrl": recommendImg[2],
                                        "title":"【" + recommendClass[2] + "】" + recommendHead[2],
                                        "text": DateTimeFormat(recommendDateTime[2]),
                                        "defaultAction": {
                                            "type": "uri",
                                            "label": "詳細資料",
                                            "uri": `https://project108405.herokuapp.com/oneRecommend/${recommendNum[2]}`
                                        },
                                        "actions": [
                                            {
                                                "type": "postback",
                                                "label": "知道更多",
                                                "data": recommendClass[2]
                                            },
                                            {
                                            
                                                "type": "postback",
                                                "label": "新增至我的收藏",
                                                "data": `add${recommendNum[2]}`
                                            }
                                        ]
                                    },
                                    {
                                        "thumbnailImageUrl": recommendImg[3],
                                        "title":"【" + recommendClass[3] + "】" + recommendHead[3],
                                        "text": DateTimeFormat(recommendDateTime[3]),
                                        "defaultAction": {
                                            "type": "uri",
                                            "label": "詳細資料",
                                            "uri": `https://project108405.herokuapp.com/oneRecommend/${recommendNum[3]}`
                                        },
                                        "actions": [
                                            {
                                                "type": "postback",
                                                "label": "知道更多",
                                                "data": recommendClass[3]
                                            },
                                            {
                                            
                                                "type": "postback",
                                                "label": "新增至我的收藏",
                                                "data": `add${recommendNum[3]}`
                                            }
                                        ]
                                    }
                                ],
                                "imageAspectRatio": "rectangle",
                                "imageSize": "cover"
                            }
                        });
                        clearInterval(secondCheck);
                    }  
                }, 250)
                //-------------
            });

            console.log('recommendNum',recommendNum)
            console.log('recommendClass',recommendClass)
            console.log('recommendHead',recommendHead)
            console.log('recommendDateTime',recommendDateTime)
            
        });
    }
    //-----------心情推薦-----------
    if (text == "情緒專區"){
            event.reply(
                {
                    "type": "text", // ①
                    "text": "情緒，其實是一種能量，\n也是一種指引，\n當它向浪潮一般撲襲而來，你能做的\n就是任它流淌而過，\n只有感受過，你才得以\n在人生大海中繼續航行。 \n---- 留佩萱\n《療癒，從感受情緒開始》\n========🕵️‍========\n文藝富心不將情緒分好壞，我們認為\n『每一種情緒都很重要』\n我們會對文藝富心所有文本進行情感分析，你可以在這體會到不同的情緒。",
                    "quickReply": { // ②
                      "items": [
                        {
                          "type": "action", // ③
                          "imageUrl": "https://i.imgur.com/WiHuD6g.png",
                          "action": {
                            "type": "postback",
                            "label": "燦爛、溫暖",
                            "data": "Goodmood"
                          }
                        },
                        {
                          "type": "action",
                          "imageUrl": "https://i.imgur.com/3vXMTpA.png",
                          "action": {
                            "type": "postback",
                            "label": "惆悵、漣漪",
                            "data": "Badmood"
                          }
                        }
                      ]
                    }
                  }
            //     {
            //     "type": "template",
            //     "altText": "文藝富心",
            //     "template": {
            //         "type": "carousel",
            //         "columns": [
            //             {
            //               "thumbnailImageUrl": "https://upload.cc/i1/2019/10/07/QNd8AT.jpg",
            //               "imageBackgroundColor": "#FFFFFF",
            //               "title": "燦爛、溫暖",
            //               "text": "微小的快樂，便足以支撐龐然荒涼的人生。文藝富心帶領你挖掘好心情。",
            //               "defaultAction": {
            //                   "type": "uri",
            //                   "label": "詳細資料",
            //                   "uri": "https://project108405.herokuapp.com/"
            //               },
            //               "actions": [
            //                   {
            //                       "type": "postback",
            //                       "label": "推薦給我",
            //                       "data": "Goodmood"
            //                   },
            //                   {
            //                       "type": "uri",
            //                       "label": "自行探索",
            //                       "uri": "https://project108405.herokuapp.com/"
            //                   }
            //               ]
            //             },
            //             {    
            //               "thumbnailImageUrl": "https://upload.cc/i1/2019/10/07/2EWOCG.jpg",
            //               "imageBackgroundColor": "#000000",
            //               "title": "惆悵、漣漪",
            //               "text": "打擊與挫敗是成功的踏腳石而不是絆腳石。文藝富心陪你克服這道關卡。",
            //               "defaultAction": {
            //                   "type": "uri",
            //                   "label": "詳細資料",
            //                   "uri": "https://project108405.herokuapp.com/"
            //               },
            //               "actions": [
            //                 {
            //                     "type": "postback",
            //                     "label": "推薦給我",
            //                     "data": "Badmood"
            //                 },
            //                 {
            //                     "type": "uri",
            //                     "label": "自行探索",
            //                     "uri": "https://project108405.herokuapp.com/"
            //                 }
            //               ]
            //             }
            //         ],
            //         "imageAspectRatio": "rectangle",
            //         "imageSize": "cover"
            //     } 
            // });
            );
    
    }else if (text != "情緒專區" && text != "本週推薦" && text != "熱門文章"){
        event.reply(
            {   
                "type": "text",
                "text": "我不是很了解你的意思\n請透過圖文選單與我們溝通👋"
            }            
        )

    }
    console.log('使用者傳來的文字',text);

    });
});

//========================================


//----------------------------------------
// 建立一個網站應用程式app
// 如果連接根目錄, 交給機器人處理
//----------------------------------------
const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);



//----------------------------------------
// 可直接取用檔案的資料夾
//----------------------------------------
app.use(express.static('public'));


//接收GET請求

//----------------------------------------
// 監聽3000埠號, 
// 或是監聽Heroku設定的埠號
//----------------------------------------
var server = app.listen(process.env.PORT || 3000, function() {
    const port = server.address().port;
    console.log("正在監聽埠號:", port);
});
