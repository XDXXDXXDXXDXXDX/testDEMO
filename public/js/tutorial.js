/**
 * @file tutorial, part of public data and function at dataTable.js and common.js
 * @author wei jie huang
 * @copyright Shenzhen TOZI Tech Co.
 * @createDate 2018-7-25 14:41:00
 */
'use strict';

var token=localStorage.getItem("pass");
//var theLanguage = $('html').attr('lang');
var ctrl= document.querySelector('[ng-controller=SwitchViewCtrl]');
var measureData={};
var pageLimit=20;//Limit the number of the list
var theLanguage = 'en';


//uploadList(1);

// $("#cnTutorialUrl").click(function () {
//     window.location.href=tutorialURL["zh-cmn-Hans"];
// });
// $("#enTutorialUrl").click(function () {
//     window.location.href=tutorialURL["en"];
// });
// $("#jpTutorialUrl").click(function () {
//     window.location.href=tutorialURL["ja"];
// });

// $(".header-nav-bar-content li a").hover(function () {
//     $("#headerTutorial").removeClass("nav-bar-select");
// }, function () {
//     $("#headerTutorial").addClass("nav-bar-select");
// });

$(".tutorial-launch").click(function () {
    $(".show-view").hide();
    $(".show-adjustView").hide();
    uploadList(1);
});

//upload list
function uploadList(page) {
    var listNum=typeof(page)=="undefined"?1:page;
    var reqData= {
            "accessToken":token,
            "userId":'',
            "limit":pageLimit,
            "offset":(listNum-1)*pageLimit,
        };

    $.post({
        url: SDKAPI['listTutorial'],
        data: reqData,
        success:function (res) {
            // var listNum=(value-1)*pageLimit+1;
            $("#tutorialList").empty();
            // if(typeof (res.data.data.data)==="undefined"){
            //     toz_Toast.init({title:"Wrong",content:"The data is null!",duration:-1,mask:false,icon:'failure'});
            //     return;
            // }
            for(var i=0;i<res.data.data.data.length;i++){
                var item=res.data.data.data[i];
                var userGender=genderTable[theLanguage][Number(item.userGender)];

                var date = new Date(item.createdTime);
                var createdate=date.getFullYear() + '-';
                createdate+=(date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
                createdate+=(date.getDate() < 10 ? '0'+date.getDate(): date.getDate())+ ' ';
                createdate+=(date.getHours() < 10 ? '0'+date.getHours(): date.getHours()) + ':';
                createdate+=(date.getMinutes() < 10 ? '0'+date.getMinutes(): date.getMinutes()) + ':';
                createdate+=(date.getSeconds() < 10 ? '0'+date.getSeconds(): date.getSeconds()) ;

                var Adjusted=false;
                if(!(item.measureInfo===undefined||item.measureInfo===null||item.measureInfo===[]||item.measureInfo.length===0)){
                    if(typeof (item.measureInfo.measures)!=undefined&&item.measureInfo.measures!=null){
                        Adjusted=true;
                    }
                }
                var tempitem={
                    // "listNum":listNum,
                    "createdTime":createdate,
                    "id":item.id,
                    "userGender":userGender,
                    "userHeight":item.userHeight,
                    "userId":item.userId,
                    "userWeight":item.userWeight,
                    "Adjusted":Adjusted,
                };
                var genderhtml = '';
                if (tempitem.userGender == 'Male') {
                    genderhtml = '<div class="userlabel"><i style="color: #3cbedc;margin-left: 5px" class="fas fa-male fa-3x"></i>' +
                        '<div class = "userlogo"><span title="height">' + tempitem.userHeight + 'CM</span><br>' +
                        '<span title="weight">' + tempitem.userWeight + 'KG</span></div></div>';
                }
                else {
                    genderhtml = '<div class="userlabel"><i style="color: #e4ae4a;margin-left: 5px" class="fas fa-female fa-3x"></i>' +
                        '<div class = "userlogo"><span title="height">' + tempitem.userHeight + 'CM</span><br>' +
                        '<span title="weight">' + tempitem.userWeight + 'KG</span></div></div>';
                }

                var listItemList =
                    '<li class="cus-item" >' +
                    '<div id="' + tempitem.id + '" onclick="getTData(this);select2highlightBox(this)" class="text-item">' + genderhtml +
                    '<div class="cus-data-content">' +
                    '<span title="id" >' + userIdTable[theLanguage] + ': ' + tempitem.userId + '</span><br/>' + //<!-- id号 更新数据-->
                    '<span title="createdTime" >' + tempitem.createdTime + '</span>'; //<!-- 创建时间号 更新数据-->

                listItemList += '</div></div></li>';
                $("#tutorialList").append(listItemList);
                // listNum++;
            }
            // maintainHighlightedBox();
        },
    });
};

//get new pts from string
function getNewPts(ptsInfo,ptsName){
    //得到pts
    if(typeof (ptsInfo[ptsName])==="undefined"||!ptsInfo[ptsName]){
        return null;
    }
    var firArray=ptsInfo[ptsName].split(",");
    var secArray;

    var pts=[];
    for(var i=0;i<firArray.length;i++) {
        pts[i]=new Array();
        secArray= firArray[i].split(":");
        for(var j=0;j<secArray.length;j++){
            pts[i].push(Number(secArray[j]));
        }
    }
    return pts;
}

//get color from basic info
function getNewColor(basicInfo,colorName) {
    if(typeof (basicInfo[colorName])==="undefined"||!basicInfo[colorName]){
        return [];
    }
    var firArray=basicInfo[colorName].split(",");
    var color=[];
    for(var i=0;i<firArray.length-1;i++)
    {
        var secArray=firArray[i].split(":");
        color[i]=new Array();
        for(var j=0;j<secArray.length;j++){
            color[i].push(Number(secArray[j]));
        }
    }
    return color;
}

//get pictures' size from basic info
function getImgSize(basicInfo,imgSizeName) {
    if(!basicInfo[imgSizeName]){
        return ['',''];
    }
    var sizeArray=basicInfo[imgSizeName].split(":");
    var sizeWidth=Number(sizeArray[0]);
    var sizeHeight=Number(sizeArray[1]);
    return [sizeWidth,sizeHeight];
}

//get mp from paintKeyPts
function getMPFromPK(PaintKeyPts,PtDir) {
    var MP=new Array();
    for(var j=0;j<PaintKeyPts.length;j++){
        if(PaintKeyPts[j].PtDir===PtDir){
            MP.push(Number(PaintKeyPts[j].PtIndex));
        }
    }
    return MP;
}

//get mp from basic info
function getMPFromStr(basicInfo,MPName) {
    if(!basicInfo[MPName]){
        return '';
    }
    //得到MP
    var MP=new Array();
    var firstArray=basicInfo[MPName].split(";");
    var secondArray=firstArray[0].split(",");
    for(var j=0;j<secondArray.length;j++){
        MP.push(Number(secondArray[j]));
    }
    return MP;
}

//to get measure data and draw outline
function getTData(e){
    $('#buttonGroup').hide();
    $('#buttonGroupT').show();
    var reqData={
        'accessToken': localStorage.getItem("pass"),//getCookie('token'),
        'id':Number($(e).attr("id")),
    };

    $.post({
        url: SDKAPI['imgsTutorial'],
        data: reqData,
        success:function (res) {
            if(res.data.code=="200" && res.data.data.length!=0){
                var jsonPtsInfo=JSON.parse(res.data.data.ptsInfo);
                jsonPtsInfo=jsonPtsInfo[jsonPtsInfo.length-1];

                var jsonBasicInfo=JSON.parse(res.data.data.basicInfo);

                var jsonTargetPtsInfo=JSON.parse(res.data.data.targetPtsInfo);
                jsonTargetPtsInfo=jsonTargetPtsInfo[jsonTargetPtsInfo.length-1];

                //得到pts_f
                var pts_f=getNewPts(jsonPtsInfo,'pts_f');

                //得到pts_s
                var pts_s=getNewPts(jsonPtsInfo,'pts_s');

                //得到pts_b
                var pts_b=getNewPts(jsonPtsInfo,'pts_b');

                //得到ptsTarget_f
                var ptsTarget_f=getNewPts(jsonPtsInfo,'pts_f');

                //得到ptsTarget_s
                var ptsTarget_s=getNewPts(jsonPtsInfo,'pts_s');

                //得到ptsTarget_b
                var ptsTarget_b=getNewPts(jsonPtsInfo,'pts_b');

                //得到FLCOLOR
                var FLCOLOR=getNewColor(jsonBasicInfo,'FLCOLOR');
                //得到FRCOLOR
                var FRCOLOR=getNewColor(jsonBasicInfo,'FRCOLOR');

                //得到SFCOLOR
                var SFCOLOR=getNewColor(jsonBasicInfo,'SFCOLOR');
                //得到SBCOLOR
                var SBCOLOR=getNewColor(jsonBasicInfo,'SBCOLOR');

                //得到 BLCOLOR
                var BLCOLOR=getNewColor(jsonBasicInfo,'BLCOLOR');
                //得到 BRCOLOR
                var BRCOLOR=getNewColor(jsonBasicInfo,'BRCOLOR');

                var imgfSize=getImgSize(jsonBasicInfo,jsonBasicInfo.img_f_size?'img_f_size':'Img_f_size');
                var imgsSize=getImgSize(jsonBasicInfo,jsonBasicInfo.img_s_size?'img_s_size':'Img_s_size');
                var imgbSize=getImgSize(jsonBasicInfo,jsonBasicInfo.img_b_size?'img_b_size':'Img_b_size');

                var PaintKeyPts='';
                if(typeof (jsonBasicInfo.PaintKeyPts)!="undefined"){
                    PaintKeyPts=jsonBasicInfo.PaintKeyPts;
                    //得到FL_MP
                    var FL_MP=getMPFromPK(PaintKeyPts,'fl');

                    //得到FR_MP
                    var FR_MP=getMPFromPK(PaintKeyPts,'fr');

                    //得到SF_MP
                    var SF_MP=getMPFromPK(PaintKeyPts,'sf');

                    //得到SB_MP
                    var SB_MP=getMPFromPK(PaintKeyPts,'sb');

                    var BL_MP=getMPFromPK(PaintKeyPts,'bl');

                    var BR_MP=getMPFromPK(PaintKeyPts,'br');
                }
                else{
                    //得到FL_MP
                    var FL_MP=getMPFromStr(jsonBasicInfo,'FL_MP');
                    //得到FR_MP
                    var FR_MP=getMPFromStr(jsonBasicInfo,'FR_MP');

                    //得到SF_MP
                    var SF_MP=getMPFromStr(jsonBasicInfo,'SF_MP');
                    //得到SB_MP
                    var SB_MP=getMPFromStr(jsonBasicInfo,'SB_MP');

                    //得到BL_MP
                    var BL_MP=getMPFromStr(jsonBasicInfo,'BL_MP');
                    //得到BR_MP
                    var BR_MP=getMPFromStr(jsonBasicInfo,'BR_MP');
                };

                var PaintLines=JSON.parse(jsonPtsInfo.paintLines);

                measureData= {
                    id:res.data.data.id,
                    userId:res.data.data.userId,//useless for drawing,  used in upload sizes to Client server
                    userGender:res.data.data.userGender,//useless for drawing,  used in upload sizes to Client server
                    userHeight:res.data.data.userHeight,//useless for drawing,  used in upload sizes to Client server
                    userWeight:res.data.data.userWeight,//useless for drawing,  used in upload sizes to Client server
                    createdTime:res.data.data.createdTime,//useless for drawing,  used in upload sizes to Client server
                    dir:['f','s','b'],
                    pts:{
                        'f':pts_f,
                        's':pts_s,
                        'b':pts_b
                    },
                    url:{
                        'f':"data:image/png;base64,"+res.data.data.userImgBasedF, //获得图片base64,
                        's':"data:image/png;base64,"+res.data.data.userImgBasedS, //获得图片base64,
                        'b':res.data.data.userImgBasedB?"data:image/png;base64,"+res.data.data.userImgBasedB:'', //获得图片base64
                    },
                    MP:{
                        'f':[FL_MP,FR_MP],
                        's':[SF_MP,SB_MP],
                        'b':[BL_MP,BR_MP]
                    },
                    COLOR:{
                        'f':[FLCOLOR,FRCOLOR],
                        's':[SFCOLOR,SBCOLOR],
                        'b':[BLCOLOR,BRCOLOR],
                    },
                    imgSize:{
                        'f':imgfSize,
                        's':imgsSize,
                        'b':imgbSize,
                    },
                    PaintLines:PaintLines, //得到PaintLines
                    PaintKeyPts:PaintKeyPts,
                    isTutorial:true,//开启教程
                    ptsTarget:{
                        'f':ptsTarget_f,
                        's':ptsTarget_s,
                        'b':ptsTarget_b
                    },
                    PaintLines_target:JSON.parse(jsonTargetPtsInfo.paintLines), //得到PaintLines_target,
                    promptButton:"#showTarget",//提示按钮 用于开启提示点
                };

                if(measureData.url['b']!=''){
                    imgCount=3;
                    $("#imgbContainerT").show();
                    $(".img-container").css('width',"30%");
                }else{
                    imgCount=2;
                    $("#imgbContainerT").hide();
                    $(".img-container").css('width',"45%");
                }

                $("#adjustShowView").show();
                $("#adjustView").show();
                $(".retract-button").attr('disabled',"true");//添加disabled属性
                //窗口宽度小于768时 为小屏 分三页展示
                curImgViewStatue=imgViewStatue[0];
                showOrHideButton();
                var scope = angular.element(ctrl).scope();
                scope.getData(measureData);
                if(showTips===true){
                    showGuide(scope);
                }
            }
            else{
                toz_Toast.init({title:"Wrong",content:"Sorry, network connection failed. Please try again.(Code:"+res.data.code+")",duration:-1,mask:false,icon:'failure'});
            }
        },
    })
};
