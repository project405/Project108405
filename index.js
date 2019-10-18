//----------------------------------------
// 載入必要的模組
//----------------------------------------

var linebot = require('linebot');
var express = require('express');
const request = require('request');
const app = express();
var cors = require('cors')
// var corsOptions = {
//     origin: 'http://localhost:3000/',
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors())

const article = require('./utility/article');
// const member = require('./utility/member');
const member = require('./utility/LinePush');
const byClassData = require('./utility/index');



//----------------------------------------
// 填入自己在Line Developers的channel值
//----------------------------------------
var bot = linebot({
    channelId: '1653312089',
    channelSecret: 'f582b751649f1b57f33910c0238113eb',
    channelAccessToken: 'QRKiyeWZcixMaO55Yf35KXjZTkrDD70ZAP2gyt8W55aeLgtA75mOVIkOZpruRurKgUgq6ow1+V85huiGRDEBas0Uq57+o4nNREgClY6s+gSg28gC1HNAbELCV7JxGEDlA2bkF8SuWeFNULCG1Z/lwgdB04t89/1O/w1cDnyilFU='
});


//----------------------------------------
// 建立一個網站應用程式app
// 如果連接根目錄, 交給機器人處理
//----------------------------------------
const linebotParser = bot.parser();
app.post('/', linebotParser);

//----------------------------------------
// 可直接取用檔案的資料夾
//----------------------------------------
app.use(express.static('public'));

//----------------------------------------
// 監聽3000埠號, 
// 或是監聽Heroku設定的埠號
//----------------------------------------
var server = app.listen(process.env.PORT || 3000, function() {
    const port = server.address().port;
    console.log("正在監聽埠號:", port);
});
var test = '敘述瑞貝爾威爾森和安海瑟薇是一對擦出精彩火花的女騙徒，她們在位於南法的一座濱海小鎮展開一場騙術大比拼。喬瑟芬柴斯特菲德（安海瑟薇 飾）是一個穿著光鮮亮麗、蠱惑誘人、善於算計、刁滑奸詐的英國正妹，她在濱海博蒙這座位於南法蔚藍海岸的小鎮擁有一棟豪宅，專門詐騙來自世界各地的有錢凱'
console.log(test.length)

   
    

app.post('/webhook', function (req, res) {
    let allUser = [];
    member.AllMember().then(data => {  
        data.forEach(item => {
            allUser.push(item.lineID);
            console.log(allUser)
        });
        byClassData.getIndexData().then(data =>{
            var pushContent = []
            //data為文章
            if(data[10][0].recomHead == undefined){
                pushContent.push(data[10][0].artiHead)
                //有圖片
                if (data[10][0].artiCont.match("\:imgLocation") != null){
                    pushContent.push(data[10][0].artiCont.replace(/\:imgLocation/ig, "img")); 
                    // console.log(pushContent)
                    // if (data[10][0].artiCont.length >= 130){
                    //     pushContent.push(data[10][0].artiCont.slice(0,129)+'...')
                    // }
                }else{
                    pushContent.push(data[10][0].artiCont); 


                }


            //data為推薦
            }else{
                pushContent.push(data[10][0].recomHead)
                //有圖片
                if (data[10][0].recomCont.match("\:imgLocation") != null){
                    pushContent.push(data[10][0].recomCont.replace(/\:imgLocation/ig, "img")); 
                    // console.log(pushContent)
                    // if (data[10][0].artiCont.length >= 130){
                    //     pushContent.push(data[10][0].artiCont.slice(0,129)+'...')
                    // }
                }else{
                    pushContent.push(data[10][0].recomCont); 


                }



            }
            // linePush();
            linePushPhoto();

            console.log(pushContent)

            // ////--------------------判斷文章
            // if (data[10][0].recomHead == undefined){
            //     pushContent.push(data[10][0].artiHead)
            //     //Confirm template字元限制
            //     if(data[10][0].artiCont.match("\:imgLocation") != null){
            //         pushContent.push('我有圖片')
            //         linePushPhoto();
            //     }
            //     if (data[10][0].artiCont.length >= 130){
            //         pushContent.push(data[10][0].artiCont.slice(0,129)+'...')
            //         //加入判斷圖片，依據圖片送出不同的template
            //         linePush();
                    
            //     }else{
            //         if(data[10][0].artiCont.match("\:imgLocation") != null){
            //             pushContent.push('我有圖片')
            //             linePushPhoto();
            //         }else{
            //             pushContent.push(data[10][0].artiCont)
            //             linePush();
            //         }
            //     }
            // ////--------------------判斷推薦
            // }else{
            //     pushContent.push(data[10][0].recomHead)
            //     //Confirm template字元限制
            //     if (data[10][0].recomCont.length >= 130){
            //         pushContent.push(data[10][0].recomCont.slice(0,129)+'...')
            //         //加入判斷圖片，依據圖片送出不同的template
            //         linePush();
            //         if(data[10][0].recomCont.match("\:imgLocation") != null){
            //             pushContent.push('我有圖片')
            //             linePushPhoto();
            //         }
            //     }else{
            //         if(data[10][0].recomCont.match("\:imgLocation") != null){
            //             pushContent.push('我有圖片')
            //             linePushPhoto();
            //         }else{
            //             pushContent.push(data[10][0].recomCont)
            //             linePush();
            //         }
            //     }
            // }

            // data[1].forEach((item, index) => {
            //     while (item.artiMessCont.match("\\:imgLocation")) {
            //         item.artiMessCont = item.artiMessCont.replace("\\:imgLocation", "<div class='wrapperCard card-img-top'><img src='/userImg/replyImg/" + data[9][sumDisplayImg].imgName + "' style='max-height: 450px; max-width: 70%; cursor: pointer; border-radius: 12px; padding: 0.1em; ' ></div>");
            //     }
            // })
            

            // console.log('req@@@@@@@@@@@@@@@@@@@@@@@@@',req)  
            //文章、推薦內容無圖片的推播樣式
            function linePush (){
                request.post({
                    headers: {
                        'content-type' : 'application/json',
                        //Authorization為Channel access token 
                        // ----------測試line
                        'Authorization': 'Bearer QRKiyeWZcixMaO55Yf35KXjZTkrDD70ZAP2gyt8W55aeLgtA75mOVIkOZpruRurKgUgq6ow1+V85huiGRDEBas0Uq57+o4nNREgClY6s+gSg28gC1HNAbELCV7JxGEDlA2bkF8SuWeFNULCG1Z/lwgdB04t89/1O/w1cDnyilFU='
                        // ----------正式line
                        // 'Authorization': 'Bearer xQw+g1O20RWNkcAoq8UXnPeucNdgBaXKgSv26TQxIUouB1Ld3Y8KpS6vtjWtEldqWl5jRU1Xdp5m0nUUbaKQ7FE+YNVtTQbdGH3D+12qfXFCgk+uXwbgHSbGdmPThSJFvPMqNctqd5jUePtJLTdBggdB04t89/1O/w1cDnyilFU='
                    },
                    // url: 'https://api.line.me/v2/bot/message/multicast',
                    url: 'https://api.line.me/v2/bot/message/push',
                    body: JSON.stringify({
                        //to給資料庫有的使用者
                        // to: allUser,
                        to: 'U2251202deb66b8a73da26e53c8399a13',
                            messages: [
                                {
                                    type: "template",
                                    altText: "相信你會喜歡😎",
                                    template: {
                                        type: "confirm",
                                        text: `【文藝富心】推薦 🎉\n🔸標題：${pushContent[0]}\n🔹內容：${pushContent[1]}`,
                                        actions: [
                                            {
                                                "type": "message",
                                                "label": "我喜歡",
                                                "text": "我敲擊喜歡的唷"
                                            },
                                            {
                                                "type": "message",
                                                "label": "我不喜歡",
                                                "text": "我敲擊討厭的唷"
                                            }
                                        ]
                                    }
                                }               
                            ]
                            
                        })
                }, function(error, response, body){
                
                    res.end(body);
                
                });
            }
            //文章、推薦內容有圖片的推播樣式 
            function linePushPhoto(){
                request.post({
                    headers: {
                        'content-type' : 'application/json',
                        //Authorization為Channel access token 
                        // ----------測試line
                        'Authorization': 'Bearer QRKiyeWZcixMaO55Yf35KXjZTkrDD70ZAP2gyt8W55aeLgtA75mOVIkOZpruRurKgUgq6ow1+V85huiGRDEBas0Uq57+o4nNREgClY6s+gSg28gC1HNAbELCV7JxGEDlA2bkF8SuWeFNULCG1Z/lwgdB04t89/1O/w1cDnyilFU='
                        // ----------正式line
                        // 'Authorization': 'Bearer xQw+g1O20RWNkcAoq8UXnPeucNdgBaXKgSv26TQxIUouB1Ld3Y8KpS6vtjWtEldqWl5jRU1Xdp5m0nUUbaKQ7FE+YNVtTQbdGH3D+12qfXFCgk+uXwbgHSbGdmPThSJFvPMqNctqd5jUePtJLTdBggdB04t89/1O/w1cDnyilFU='
                    },
                    // url: 'https://api.line.me/v2/bot/message/multicast',
                    url: 'https://api.line.me/v2/bot/message/push',
                    body: JSON.stringify({
                        //to給資料庫有的使用者
                        // to: allUser,
                        to: 'U2251202deb66b8a73da26e53c8399a13',
                            messages: [
                                {
                                    type: "template",
                                    altText: "相信你會喜歡😎",
                                    template: {
                                        type: "buttons",
                                        thumbnailImageUrl: "https://example.com/bot/images/image.jpg",
                                        imageAspectRatio: "rectangle",
                                        imageSize: "cover",
                                        imageBackgroundColor: "#FFFFFF",
                                        title: "Menu",
                                        text: `【文藝富心】推薦 🎉\n🔸標題：${pushContent[0]}\n🔹內容：${pushContent[1]}`,
                                        defaultAction: {
                                            "type": "uri",
                                            "label": "View detail",
                                            "uri": "http://example.com/page/123"
                                        },
                                        actions: [
                                            {
                                            "type": "message",
                                            "label": "我喜歡",
                                            "text": "我敲擊喜歡的唷"
                                            },
                                            {
                                            "type": "message",
                                            "label": "我不喜歡",
                                            "text": "我敲擊討厭的唷"
                                            }
                                        ]
                                    }
                                }           
                            ]
                        })
                }, function(error, response, body){
                
                    res.end(body);
                
                });
            }
            
        })    
    })      
});
