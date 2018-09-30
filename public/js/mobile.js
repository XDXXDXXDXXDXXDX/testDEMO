/**
 * @file mobile, part of public data and function at dataTable.js and common.js
 * @author wei jie huang
 * @copyright Shenzhen TOZI Tech Co.
 * @createDate 2018-7-25 14:41:00
 */
'use strict';

var token=getCookie('token');
var theLanguage = $('html').attr('lang');
var ctrl= document.querySelector('[ng-controller=SwitchViewCtrl]');

var currentPage=1; //the current page of list
var listTotal=0; //the total of list
var pageLimit=20;//Limit the number of the list
var searchStatus=false;//judge the req is for searching or not, false is no ,true is yes
var listData={}; //data of list
var measureData={}; //the measure data of the selected person
var excelId=-1;//the userID of current body sizes' list

var activeIcon=""; //current active icon at the sizes' list
var ptDef={};  // body sizes
var ptDefLength=0; //the length of body sizes
var unit=["cm","in"];
var currentUnit=unit[0];
var maxTableLength=13; //the max number of showing sizes at one table.If over this num, divide to two table
var corpApi=''; // Defined by Client
var httpBasicAuth='';// Defined by Client

var preViewArray=['adjust','show'];// pre view
var preView=preViewArray[0];
var isMobile=true;//close loading toast while getting data from API 'getlimit' on mobile
showTips_BindName=["imgf_Click2Suspension","imgs_Click2Suspension"];

//get corpapi and httpBasicAuth, ready for post sizes' data to client server
getCorpAPI();
uploadList(1);

$("#mobileSearch").click(function () {
    if($("#searchContainer").css("display")==="none"){
        $("#listContainer").hide();
        $("#searchContainer").show();
    }else{
        $("#searchContainer").hide();
        $("#listContainer").show();
    }
});
$("#searchButton").click(function () {
    $("#pageToolbar").empty();
    searchStatus=true;
    uploadList();
    $("#searchContainer").hide();
    $("#listContainer").show();
});
$("#prePage").click(function () {
    if(currentPage===1){
        return;
    }
    currentPage--;
    uploadList(currentPage);
});
$("#nextPage").click(function () {
    if(currentPage===Math.ceil(listTotal/pageLimit)){
        return;
    }
    currentPage++;
    uploadList(currentPage);
});
$("#sortDe").click(function () {
    $("#sortDe").hide();
    $("#sortAs").show();
    listData=listData.sort(timeAscending);
    appendAtList(listData);

});
$("#sortAs").click(function () {
    $("#sortAs").hide();
    $("#sortDe").show();
    listData=listData.sort(timeDescending);
    appendAtList(listData);
});
$("#footerList").click(function () {
    $(".footer-nav-bar-content li").removeClass("mobile-selected");
    $("#footerList").addClass("mobile-selected");
    $(".mobile-container").hide();
    $("#catalogContainer").show();
});

$("#footerMeasure").click(function () {
    $(".footer-nav-bar-content li").removeClass("mobile-selected");
    $("#footerMeasure").addClass("mobile-selected");
    $(".mobile-container").hide();
    if(preView===preViewArray[1]){
        $("#adjustContainer").hide();
        $("#showContainer").show();
    }else{
        $("#showContainer").hide();
        $("#adjustContainer").show();
    }
});
$("#footerTutorial").click(function () {
    $(".footer-nav-bar-content li").removeClass("mobile-selected");
    $("#footerTutorial").addClass("mobile-selected");
    uploadTutorialList(1);
    $(".mobile-container").hide();
    $("#tllistContainer").show();
    $("#tutorialContainer").show();
});
$("#footerAccount").click(function () {
    $(".footer-nav-bar-content li").removeClass("mobile-selected");
    $("#footerAccount").addClass("mobile-selected");
    $(".mobile-container").hide();
    $("#accountContainer").show();

});

$("#toExcelButton").click(function(){
    var sheetData=new Array();
    var ex_tpunit="CM";
    if($(".move").attr("data-state")==="off"){
        ex_tpunit="IN";
    }
    var ex_tempPtDef=cloneObj(ptDef);
    var option={};
    option.fileName =   "UserId"+excelId + "_"+new Date().toISOString().replace(/[\-\:\.]/g, "");

    var theLanguage = $('html').attr('lang');
    if(theLanguage==="zh-cmn-Hans"){
        for(var i in ex_tempPtDef){
            sheetData.push({
                one:ex_tempPtDef[i].nameCn,
                two:ex_tempPtDef[i].adjustedval.toFixed(2)
            })
        };
        option.datas=[
            {
                sheetData:sheetData,
                sheetName:'sheet',
                sheetFilter:['one','two'],
                sheetHeader:['名称','尺寸/'+ex_tpunit],
            }
        ];
    }
    else if(theLanguage==="en"){
        for(var i in ex_tempPtDef){
            sheetData.push({
                one:ex_tempPtDef[i].nameEn,
                two:ex_tempPtDef[i].adjustedval.toFixed(2)
            })
        };
        option.datas=[
            {
                sheetData:sheetData,
                sheetName:'sheet',
                sheetFilter:['one','two'],
                sheetHeader:['Name','Size/'+ex_tpunit],
            }
        ];
    }else if(theLanguage==="ja"){
        for(var i in ex_tempPtDef){
            sheetData.push({
                one:ex_tempPtDef[i].nameEn,
                two:ex_tempPtDef[i].adjustedval.toFixed(2)
            })
        };
        option.datas=[
            {
                sheetData:sheetData,
                sheetName:'sheet',
                sheetFilter:['one','two'],
                sheetHeader:['Name','Size/'+ex_tpunit],
            }
        ];
    }

    var toExcel=new ExportJsonExcel(option);
    toExcel.saveExcel();
});

//get corpapi and httpBasicAuth, ready for post sizes' data to client server
function getCorpAPI() {
    toz_ajax.post({
        url: SDKAPI['getlimit'],
        data: {
            "accessToken":token,
        },
        closeLoading:true,
        success:function (res) {
            if (res.data.code===0){
                corpApi=res.data.data.corpApi?res.data.data.corpApi:"";
                httpBasicAuth=res.data.data.httpBasicAuth?res.data.data.httpBasicAuth:"";
            }else{
                toz_Toast.init({title:"Wrong",content:res.data.data,duration:-1,mask:false,icon:'failure'});
            }
        },
    })
};

//upload list
function uploadList(page) {
    var value=typeof(page)=="undefined"?1:page;
    var reqData={};
    if(searchStatus===false){
        reqData={
            "accessToken":token,
            "userId":'',
            "limit":pageLimit,
            "offset":(value-1)*pageLimit,
        };
    }else{
        var startTime = new Date($('#startTime').val());
        var endTime = new Date($('#endTime').val());

        reqData={
            "accessToken":token,
            "lastPtsStatus": Number($('input[name="selectedStatus"]:checked').val()),
            "startTime":startTime.getTime()?startTime.getTime():'',
            "endTime":endTime.getTime()?endTime.getTime():'',
            "userId":$("#searchId").val()?$("#searchId").val().toString():'',
            "limit":pageLimit,
            "offset":(value-1)*pageLimit,
        };
    };

    toz_ajax.post({
        url: SDKAPI['listMeasure'],
        data: reqData,
        success:function (res) {
            $(".cus-list").empty();
            if(typeof (res.data.data.data)==="undefined"){
                toz_Toast.init({title:"Wrong",content:"The data is null!",duration:-1,mask:false,icon:'failure'});
                return;
            }
            var listNum=(value-1)*pageLimit+1;
            listData=res.data.data.data;
            appendAtList(listData,listNum);
            maintainHighlightedBox();
            listTotal=res.data.data.total;
        },
    });
};

//upload tutorial list
function uploadTutorialList(page) {
    var value=typeof(page)=="undefined"?1:page;
    var reqData= {
        "accessToken":token,
        "userId":'',
        "limit":pageLimit,
        "offset":(value-1)*pageLimit,
    };

    toz_ajax.post({
        url: SDKAPI['listTutorial'],
        data: reqData,
        success:function (res) {
            var listNum=(value-1)*pageLimit+1;
            $("#tutorialList").empty();
            if(typeof (res.data.data.data)==="undefined"){
                toz_Toast.init({title:"Wrong",content:"The data is null!",duration:-1,mask:false,icon:'failure'});
                return;
            }
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
                    "listNum":listNum,
                    "createdTime":createdate,
                    "id":item.id,
                    "userGender":userGender,
                    "userHeight":item.userHeight,
                    "userId":item.userId,
                    "userWeight":item.userWeight,
                    "Adjusted":Adjusted,
                };
                var listItemList=
                    '<li class="cus-item" >'+
                    '<div class="cus-content">'+
                    '<div class="mobile-cus-data cus-data">'+
                    '<div id="'+tempitem.id+'_data" class="mobile-text-item text-item">'+
                    '<span id="listNum" title="listNum" >'+tempitem.listNum+'</span></br>'+ //<!-- 列表序号 更新数据-->
                    '<div class="mobile-cus-data-content cus-data-content">'+
                    '<span title="id" >'+userIdTable[theLanguage]+': '+tempitem.userId+'</span></br>'+ //<!-- id号 更新数据-->
                    '<span title="sex">'+tempitem.userGender+'</span>'+ //<!-- 性别 更新数据-->
                    '<span title="height">'+tempitem.userHeight+'CM</span>'+ //<!-- 身高 更新数据-->
                    '<span title="weight">'+tempitem.userWeight+'KG</span> </br>'+//<!-- 体重 更新数据-->
                    '<span title="createdTime" >'+tempitem.createdTime+'</span>'+ //<!-- 创建时间号 更新数据-->
                    '</div>'+
                    '</div>'+
                    '<div class="mobile-list-button list-button">'+
                    '<div class="button-item">'+
                    '<button id="'+tempitem.id+'" onclick="getTutorialData(this);select2highlightBox(this)">'+adjustTable[theLanguage]+'</button>'+
                    '</div>'+
                    '</div>'+
                    '</div>'+
                    '</div>'+
                    '</li>';

                $("#tutorialList").append(listItemList);
                listNum++;
            }
            maintainHighlightedBox();
        },
    });
};

//append item at the list
function appendAtList(listData,num) {
    $(".cus-list").empty();
    var listNum=num?num:1;
    for(var i=0;i<listData.length;i++){
        var item=listData[i];
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
            "listNum":listNum,
            "createdTime":createdate,
            "id":item.id,
            "userGender":userGender,
            "userHeight":item.userHeight,
            "userId":item.userId,
            "userWeight":item.userWeight,
            "Adjusted":Adjusted,
        };
        var listItemList=
            '<li class="cus-item" >'+
            '<div class="cus-content">'+
            '<div class="mobile-cus-data cus-data">'+
            '<div id="'+tempitem.id+'_data" class="mobile-text-item text-item">'+
            '<span id="listNum" title="listNum" >'+tempitem.listNum+'</span></br>'+ //<!-- 列表序号 更新数据-->
            '<div class="mobile-cus-data-content cus-data-content">'+
            '<span title="id" >'+userIdTable[theLanguage]+': '+tempitem.userId+'</span></br>'+ //<!-- id号 更新数据-->
            '<span title="sex">'+tempitem.userGender+'</span>'+ //<!-- 性别 更新数据-->
            '<span title="height">'+tempitem.userHeight+'CM</span>'+ //<!-- 身高 更新数据-->
            '<span title="weight">'+tempitem.userWeight+'KG</span> </br>'+//<!-- 体重 更新数据-->
            '<span title="createdTime" >'+tempitem.createdTime+'</span>'+ //<!-- 创建时间号 更新数据-->
            '</div>'+
            '</div>'+
            '<div class="mobile-list-button list-button">'+
            // '<label>'+
            // '<input type="checkbox">'+
            // '</label>'+
            '<div class="button-item">'+
            '<button id="'+tempitem.id+'" onclick="getData(this);select2highlightBox(this)">'+adjustTable[theLanguage]+'</button>';
        if(tempitem.Adjusted===false){
            listItemList+=
                '<button id="'+tempitem.id+'_show" onclick="viewSize(this);select2highlightBox(this)" disabled>'+viewTable[theLanguage]+'</button>';
        }else{
            listItemList+=
                '<button id="'+tempitem.id+'_show" onclick="viewSize(this);select2highlightBox(this)" >'+viewTable[theLanguage]+'</button>';
        }
        listItemList+=
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</li>';

        $(".cus-list").append(listItemList);
        listNum++;
    }
    maintainHighlightedBox();
};

//to get measure data and draw outline
function getData(e){
    var reqData={
        'accessToken':token,
        'id':Number($(e).attr("id")),
    };

    toz_ajax.post({
        url: SDKAPI['imgsMeasure'],
        data: reqData,
        success:function (res) {
            if(res.data.code=="200"&&res.data.data!=null){
                excelId=Number($(e).attr("id"));
                var jsonptsInfo=JSON.parse(res.data.data.ptsInfo);
                jsonptsInfo=jsonptsInfo[jsonptsInfo.length-1];

                //得到pts_f
                var first_grouping=jsonptsInfo.pts_f.split(",");
                var second_grouping;

                var pts_f=[];
                for(var i=0;i<first_grouping.length;i++) {
                    pts_f[i]=new Array();
                    second_grouping= first_grouping[i].split(":");
                    for(var j=0;j<second_grouping.length;j++){
                        pts_f[i].push(Number(second_grouping[j]));
                    }
                }

                //得到pts_S[0] [1]代表侧面照身体正面的点的x、y，[2][3]代表侧面照身体背面的点的x、y
                first_grouping=jsonptsInfo.pts_s.split(",");
                var pts_s=[];
                for(var i=0;i<first_grouping.length;i++) {
                    pts_s[i]=new Array();
                    second_grouping= first_grouping[i].split(":");

                    for(var j=0;j<second_grouping.length;j++){
                        pts_s[i].push(Number(second_grouping[j]));
                    }
                }

                var jsonbasicInfo=JSON.parse(res.data.data.basicInfo);
                //得到FLCOLOR
                first_grouping=jsonbasicInfo.FLCOLOR.split(",");
                var FLCOLOR=[];
                for(var i=0;i<first_grouping.length-1;i++)
                {
                    second_grouping=first_grouping[i].split(":");
                    FLCOLOR[i]=new Array();
                    for(var j=0;j<second_grouping.length;j++){
                        FLCOLOR[i].push(Number(second_grouping[j]));
                    }
                }
                //得到FRCOLOR
                first_grouping=jsonbasicInfo.FLCOLOR.split(",");
                var FRCOLOR=[];
                for(var i=0;i<first_grouping.length-1;i++)
                {
                    second_grouping=  first_grouping[i].split(":");
                    FRCOLOR[i]=new Array();
                    for(var j=0;j<second_grouping.length;j++){
                        FRCOLOR[i].push(Number(second_grouping[j]));
                    }
                }

                //得到SFCOLOR
                first_grouping=jsonbasicInfo.SFCOLOR.split(",");
                var SFCOLOR=[];
                for(var i=0;i<first_grouping.length-1;i++)
                {
                    second_grouping=  first_grouping[i].split(":");
                    SFCOLOR[i]=new Array();
                    for(var j=0;j<second_grouping.length;j++){
                        SFCOLOR[i].push(Number(second_grouping[j]));
                    }
                }
                //得到SBCOLOR
                first_grouping=jsonbasicInfo.SBCOLOR.split(",");
                var SBCOLOR=[];
                for(var i=0;i<first_grouping.length-1;i++)
                {
                    second_grouping=  first_grouping[i].split(":");
                    SBCOLOR[i]=new Array();
                    for(var j=0;j<second_grouping.length;j++){
                        SBCOLOR[i].push(Number(second_grouping[j]));
                    }
                }
                first_grouping=jsonbasicInfo.img_f_size.split(":");
                var img_f_width=Number(first_grouping[0]);
                var img_f_height=Number(first_grouping[1]);

                first_grouping=jsonbasicInfo.img_s_size.split(":");
                var img_s_width=Number(first_grouping[0]);
                var img_s_height=Number(first_grouping[1]);

                //获得图片base64
                var imgf_src="data:image/jpg;base64,"+res.data.data.userImgBasedF;
                var imgs_src="data:image/jpg;base64,"+res.data.data.userImgBasedS;

                var PaintKeyPts='';
                if(typeof (jsonbasicInfo.PaintKeyPts)!="undefined"){
                    PaintKeyPts=jsonbasicInfo.PaintKeyPts;
                    //得到FL_MP
                    var FL_MP=new Array();
                    for(var j=0;j<PaintKeyPts.length;j++){
                        if(PaintKeyPts[j].PtDir==="fl"){
                            FL_MP.push(Number(PaintKeyPts[j].PtIndex));
                        }
                    }
                    //得到FR_MP
                    var FR_MP=new Array();
                    for(var j=0;j<PaintKeyPts.length;j++){
                        if(PaintKeyPts[j].PtDir==="fr"){
                            FR_MP.push(Number(PaintKeyPts[j].PtIndex));
                        }
                    }
                    //得到SF_MP
                    var SF_MP=new Array();
                    for(var j=0;j<PaintKeyPts.length;j++){
                        if(PaintKeyPts[j].PtDir==="sf"){
                            SF_MP.push(Number(PaintKeyPts[j].PtIndex));
                        }
                    }
                    //得到SB_MP
                    var SB_MP=new Array();
                    for(var j=0;j<PaintKeyPts.length;j++){
                        if(PaintKeyPts[j].PtDir==="sb") {
                            SB_MP.push(Number(PaintKeyPts[j].PtIndex));
                        }
                    }
                }
                else{
                    //得到FL_MP
                    var FL_MP=new Array();
                    first_grouping=jsonbasicInfo.FL_MP.split(";");
                    second_grouping=first_grouping[0].split(",");
                    for(var j=0;j<second_grouping.length;j++){
                        FL_MP.push(Number(second_grouping[j]));
                    }
                    //得到FR_MP
                    var FR_MP=new Array();
                    first_grouping=jsonbasicInfo.FR_MP.split(";");
                    second_grouping=first_grouping[0].split(",");//分割FR_MP
                    for(var j=0;j<second_grouping.length;j++){
                        FR_MP.push(Number(second_grouping[j]));
                    }
                    //得到SF_MP
                    var SF_MP=new Array();
                    first_grouping=jsonbasicInfo.SF_MP.split(";");
                    second_grouping=first_grouping[0].split(",");//分割FR_MP
                    for(var j=0;j<second_grouping.length;j++){
                        SF_MP.push(Number(second_grouping[j]));
                    }
                    //得到SB_MP
                    var SB_MP=new Array();
                    first_grouping=jsonbasicInfo.SB_MP.split(";");
                    second_grouping=first_grouping[0].split(",");//分割FR_MP
                    for(var j=0;j<second_grouping.length;j++){
                        SB_MP.push(Number(second_grouping[j]));
                    }
                };

                measureData= {
                    id:res.data.data.id,
                    userId:res.data.data.userId,//useless for drawing,  used in upload sizes to Client server
                    userGender:res.data.data.userGender,//useless for drawing,  used in upload sizes to Client server
                    userHeight:res.data.data.userHeight,//useless for drawing,  used in upload sizes to Client server
                    userWeight:res.data.data.userWeight,//useless for drawing,  used in upload sizes to Client server
                    createdTime:res.data.data.createdTime,//useless for drawing,  used in upload sizes to Client server
                    PaintLines:JSON.parse(jsonptsInfo.paintLines), //得到PaintLines
                    pts_f:pts_f,
                    pts_s:pts_s,
                    url_f:imgf_src,
                    url_s:imgs_src,
                    FL_MP:FL_MP,
                    FR_MP:FR_MP,
                    SF_MP:SF_MP,
                    SB_MP:SB_MP,
                    FLCOLOR:FLCOLOR,
                    FRCOLOR:FRCOLOR,
                    SFCOLOR:SFCOLOR,
                    SBCOLOR:SBCOLOR,
                    img_f_width:img_f_width,
                    img_f_height:img_f_height,
                    img_s_width:img_s_width,
                    img_s_height:img_s_height,
                    isTutorial:false,
                    PaintKeyPts:PaintKeyPts,//可移动点的名称
                    imgCont:["#imgfContent","#imgsContent"],//容器id号
                    retrButton:["#retractFront","#retractSide"],//回退事件按键id号
                    // pts_f_target:pts_f_target,
                    // pts_s_target:pts_s_target,
                    // PaintLines_target:PaintLines_target,
                    // promptButton:"#prompt",//提示按钮 用于开启提示点
                };

                $("#catalogContainer").hide();
                $("#prompt").hide();
                $(".mobile-button-group").show();
                $("#getMeasurements").show();
                $("#adjustContainer").show();
                preView=preViewArray[0];
                $("#footerMeasure").click();

                //窗口宽度小于768时 为小屏 分三页展示
                $("#imgfContent").css("z-index",9);
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
    });
};

//get  get measure data of tutorial and draw outline
function getTutorialData(e){
    $(".show-view").hide();
    $(".right-view").show();
    var reqData={
        'accessToken': getCookie('token'),
        'id':Number($(e).attr("id")),
    };

    toz_ajax.post({
        url: SDKAPI['imgsTutorial'],
        data: reqData,
        success:function (res) {
            if(res.data.code=="200"&&res.data.data.length!=0){
                var jsonptsInfo=JSON.parse(res.data.data.ptsInfo);
                jsonptsInfo=jsonptsInfo[jsonptsInfo.length-1];
                //得到pts_f
                var first_grouping=jsonptsInfo.pts_f.split(",");
                var second_grouping;

                var pts_f=[];
                for(var i=0;i<first_grouping.length;i++) {
                    pts_f[i]=new Array();
                    second_grouping= first_grouping[i].split(":");
                    for(var j=0;j<second_grouping.length;j++){
                        pts_f[i].push(Number(second_grouping[j]));
                    }
                }

                //得到pts_S[0] [1]代表侧面照身体正面的点的x、y，[2][3]代表侧面照身体背面的点的x、y
                first_grouping=jsonptsInfo.pts_s.split(",");
                var pts_s=[];
                for(var i=0;i<first_grouping.length;i++) {
                    pts_s[i]=new Array();
                    second_grouping= first_grouping[i].split(":");

                    for(var j=0;j<second_grouping.length;j++){
                        pts_s[i].push(Number(second_grouping[j]));
                    }
                }

                var jsonbasicInfo=JSON.parse(res.data.data.basicInfo);

                //得到FLCOLOR
                first_grouping=jsonbasicInfo.FLCOLOR.split(",");
                var FLCOLOR=[];
                for(var i=0;i<first_grouping.length-1;i++)
                {
                    second_grouping=first_grouping[i].split(":");
                    FLCOLOR[i]=new Array();
                    for(var j=0;j<second_grouping.length;j++){
                        FLCOLOR[i].push(Number(second_grouping[j]));
                    }
                }
                //得到FRCOLOR
                first_grouping=jsonbasicInfo.FLCOLOR.split(",");
                var FRCOLOR=[];
                for(var i=0;i<first_grouping.length-1;i++)
                {
                    second_grouping=  first_grouping[i].split(":");
                    FRCOLOR[i]=new Array();
                    for(var j=0;j<second_grouping.length;j++){
                        FRCOLOR[i].push(Number(second_grouping[j]));
                    }
                }

                //得到SFCOLOR
                first_grouping=jsonbasicInfo.SFCOLOR.split(",");
                var SFCOLOR=[];
                for(var i=0;i<first_grouping.length-1;i++)
                {
                    second_grouping=  first_grouping[i].split(":");
                    SFCOLOR[i]=new Array();
                    for(var j=0;j<second_grouping.length;j++){
                        SFCOLOR[i].push(Number(second_grouping[j]));
                    }
                }
                //得到SBCOLOR
                first_grouping=jsonbasicInfo.SBCOLOR.split(",");
                var SBCOLOR=[];
                for(var i=0;i<first_grouping.length-1;i++)
                {
                    second_grouping=  first_grouping[i].split(":");
                    SBCOLOR[i]=new Array();
                    for(var j=0;j<second_grouping.length;j++){
                        SBCOLOR[i].push(Number(second_grouping[j]));
                    }
                }
                first_grouping=jsonbasicInfo.img_f_size.split(":");
                var img_f_width=Number(first_grouping[0]);
                var img_f_height=Number(first_grouping[1]);

                first_grouping=jsonbasicInfo.img_s_size.split(":");
                var img_s_width=Number(first_grouping[0]);
                var img_s_height=Number(first_grouping[1]);

                //获得图片base64
                var imgf_src="data:image/jpg;base64,"+res.data.data.userImgBasedF;
                var imgs_src="data:image/jpg;base64,"+res.data.data.userImgBasedS;

                var pts_f_target=[];
                var pts_s_target=[];
                var targetPtsInfo=JSON.parse(res.data.data.targetPtsInfo);
                targetPtsInfo=targetPtsInfo[targetPtsInfo.length-1];
                //得到pts_F[0] [1]代表正面照身体左面的点的x、y，[2][3]代表正面照身体右面的点的x、y
                first_grouping=targetPtsInfo.pts_f.split(",");

                for(var i=0;i<first_grouping.length;i++) {
                    pts_f_target[i]=new Array();
                    second_grouping= first_grouping[i].split(":");
                    for(var j=0;j<second_grouping.length;j++){
                        pts_f_target[i].push(Number(second_grouping[j]));
                    }
                }

                //得到pts_S[0] [1]代表侧面照身体正面的点的x、y，[2][3]代表侧面照身体背面的点的x、y
                first_grouping=targetPtsInfo.pts_s.split(",");

                for(var i=0;i<first_grouping.length;i++) {
                    pts_s_target[i]=new Array();
                    second_grouping= first_grouping[i].split(":");
                    for(var j=0;j<second_grouping.length;j++){
                        pts_s_target[i].push(Number(second_grouping[j]));
                    }
                };
                var PaintKeyPts='';
                if(typeof (jsonbasicInfo.PaintKeyPts)!="undefined"){
                    PaintKeyPts=jsonbasicInfo.PaintKeyPts;
                    //得到FL_MP
                    var FL_MP=new Array();
                    for(var j=0;j<PaintKeyPts.length;j++){
                        if(PaintKeyPts[j].PtDir==="fl"){
                            FL_MP.push(Number(PaintKeyPts[j].PtIndex));
                        }
                    }
                    //得到FR_MP
                    var FR_MP=new Array();
                    for(var j=0;j<PaintKeyPts.length;j++){
                        if(PaintKeyPts[j].PtDir==="fr"){
                            FR_MP.push(Number(PaintKeyPts[j].PtIndex));
                        }
                    }
                    //得到SF_MP
                    var SF_MP=new Array();
                    for(var j=0;j<PaintKeyPts.length;j++){
                        if(PaintKeyPts[j].PtDir==="sf"){
                            SF_MP.push(Number(PaintKeyPts[j].PtIndex));
                        }
                    }
                    //得到SB_MP
                    var SB_MP=new Array();
                    for(var j=0;j<PaintKeyPts.length;j++){
                        if(PaintKeyPts[j].PtDir==="sb") {
                            SB_MP.push(Number(PaintKeyPts[j].PtIndex));
                        }
                    }
                }
                else{
                    //得到FL_MP
                    var FL_MP=new Array();
                    first_grouping=jsonbasicInfo.FL_MP.split(";");
                    second_grouping=first_grouping[0].split(",");
                    for(var j=0;j<second_grouping.length;j++){
                        FL_MP.push(Number(second_grouping[j]));
                    }
                    //得到FR_MP
                    var FR_MP=new Array();
                    first_grouping=jsonbasicInfo.FR_MP.split(";");
                    second_grouping=first_grouping[0].split(",");//分割FR_MP
                    for(var j=0;j<second_grouping.length;j++){
                        FR_MP.push(Number(second_grouping[j]));
                    }
                    //得到SF_MP
                    var SF_MP=new Array();
                    first_grouping=jsonbasicInfo.SF_MP.split(";");
                    second_grouping=first_grouping[0].split(",");//分割FR_MP
                    for(var j=0;j<second_grouping.length;j++){
                        SF_MP.push(Number(second_grouping[j]));
                    }
                    //得到SB_MP
                    var SB_MP=new Array();
                    first_grouping=jsonbasicInfo.SB_MP.split(";");
                    second_grouping=first_grouping[0].split(",");//分割FR_MP
                    for(var j=0;j<second_grouping.length;j++){
                        SB_MP.push(Number(second_grouping[j]));
                    }
                };

                measureData= {
                    id:res.data.data.id,
                    PaintLines:JSON.parse(JSON.parse(jsonptsInfo.paintLines)), //得到PaintLines
                    PaintLines_target:JSON.parse(targetPtsInfo.paintLines),
                    pts_f:pts_f,
                    pts_f_target:pts_f_target,
                    pts_s:pts_s,
                    pts_s_target:pts_s_target,
                    url_f:imgf_src,
                    url_s:imgs_src,
                    FL_MP:FL_MP,
                    FR_MP:FR_MP,
                    SF_MP:SF_MP,
                    SB_MP:SB_MP,
                    FLCOLOR:FLCOLOR,
                    FRCOLOR:FRCOLOR,
                    SFCOLOR:SFCOLOR,
                    SBCOLOR:SBCOLOR,
                    img_f_width:img_f_width,
                    img_f_height:img_f_height,
                    img_s_width:img_s_width,
                    img_s_height:img_s_height,
                    PaintKeyPts:PaintKeyPts,
                    isTutorial:true,
                    imgCont:["#imgfContainer","#imgsContainer"],//容器id号
                    retrButton:["#retractFront","#retractSide"],//回退事件按键id号
                    promptButton:"#prompt",//提示按钮 用于开启提示点
                };
                $("#tllistContainer").hide();
                $("#tutorialContainer").hide();
                $(".mobile-button-group").show();
                $("#prompt").show();
                $("#adjustContainer").show();

                //窗口宽度小于768时 为小屏 分三页展示
                $(".content-imgf").css("z-index",9);
                showOrHideButton(true);
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

//click view button, to view body sizes
function viewSize(e) {
    var id=$(e).attr("id");
    id=id.split("_");
    id=id[0];
    var reqData={
        'accessToken':token.toString(),
        'id':id,
    };

    toz_ajax.post({
        url: SDKAPI['imgsMeasure'],
        data: reqData,
        success:function (res) {
            if(res.data.code===200){
                var imgf_src="data:image/jpg;base64,"+res.data.data.userImgBasedF;
                var imgs_src="data:image/jpg;base64,"+res.data.data.userImgBasedS;
                measureData= {
                    "userGender": res.data.data.userGender, // Int, 0 = female, 1 = male
                    "userHeight": res.data.data.userHeight, //Int, in cm
                    "userWeight": res.data.data.userWeight, //Int, in kg
                    "createdAt": res.data.data.createdTime, // Int, timestamp when the user created the measuring record
                    "frontImg": imgf_src, // String
                    "sideImg": imgs_src, // String
                };

                var measureInfo=JSON.parse(res.data.data.measureInfo);
                excelId=res.data.data.id;
                measureInfo=measureInfo[measureInfo.length-1].measures;

                initSizeView(measureInfo);
            }
            else{
                toz_Toast.init({title:"Wrong",content:res.data.data,duration:-1,mask:false,icon:'failure'});
            }
        },
    });
};

//upload the result of adjustment, then get and show measurements
function getMeasurements() {
    var scope = angular.element(ctrl).scope();

    var reqdata=new newReqdata(scope.postAdjustRes());
    toz_ajax.post({
        url: SDKAPI['modelling'],
        data: reqdata,
        success:function (res) {
            if(res.data.code=="200"){
                initSizeView(res.data.data);
            }
            else{
                toz_Toast.init({title:"Wrong",content:res.data.data,duration:-1,mask:false,icon:'failure'});
            }
        },
    });

    function newReqdata(obj) {
        this.accessToken=token;
        this.id=obj.id;
        this.pts_f=obj.pts_f;
        this.pts_s=obj.pts_s;
        this.paintLines=obj.paintLines;
        this.ptsStatus=obj.ptsStatus;
    }
};

//to init the size list
function initSizeView(measureInfo) {
    $("#catalogContainer").hide();
    $("#adjustContainer").hide();
    initToogle();
    $("#showContainer").show();
    preView=preViewArray[1];
    $("#footerMeasure").click();
    if(document.getElementById('showContainer')!=null){
        initSizeList(measureInfo,false);
    }
    // if(isPc()){
    //     $(window).bind('resize', function (){
    //         if(document.getElementById('showContainer')!=null){
    //             initSizeList(measureInfo,true);
    //         }
    //     });
    // }
}

function initSizeList(measureInfo,isResize) {
    $("#firBodySizeList").empty();
    $("#secBodySizeList").empty();
    var tempcount=0;
    if(isResize===true){ //窗口调整不重新给ptDef赋值
        tempcount=ptDefLength;
    }
    else{
        ptDef={};
        for(var i=0;i<measureInfo.length;i++){
            var tempindex=measureInfo[i].sizeid;
            ptDef[tempindex]={
                "descCn":measureInfo[i].descCn,
                "descEn":measureInfo[i].descEn,
                "descHk":measureInfo[i].descHk,
                "iconUrl":measureInfo[i].iconUrl,
                "nameCn":measureInfo[i].nameCn,
                "nameEn":measureInfo[i].nameEn,
                "nameHk":measureInfo[i].nameHk,
                "sizeval":measureInfo[i].sizeval,
                "adjustedval":measureInfo[i].adjustedval?measureInfo[i].adjustedval:measureInfo[i].sizeval,
                "masureStatus":4,
            }
            tempcount++;
        };
        ptDefLength=tempcount;
    }

    var winW=document.documentElement.clientWidth;//屏幕宽度
    var tableOrderNum=1;
    if(tempcount<maxTableLength||winW<1000){
        $(".sce-table").hide();
        var name='';
        for(var i in ptDef){
            if(ptDef[i].adjustedval!=null && ptDef[i].adjustedval!=""){
                if(theLanguage==="zh-cmn-Hans"){
                    name=ptDef[i].nameCn;
                }else if(theLanguage==="en"){
                    name=ptDef[i].nameEn;
                }else if(theLanguage==="ja"){
                    name=ptDef[i].nameEn;
                }
                var iconUrl = ptDef[i].iconUrl;
                var iconHtml =
                    "<tr  id='"+i+"'  class='measure-cell'>"+
                    "<td  onclick='iconToggle(this)' class='measure-icon'  >"+
                    "<img src="+iconUrl+ ">"+
                    "</td>"+
                    "<td onclick='iconToggle(this)'>"+
                    tableOrderNum+". "+name
                    +"</td>"+
                    "<td ondblclick='editClick(this)'class='detail-form' id='detail-form-"+i+"' value='"+(ptDef[i].adjustedval.toFixed(2))+"' >"+
                    "<span class='size-inf no-edit-form'  >"+ptDef[i].adjustedval.toFixed(2)+"</span>"+
                    "<div class='edit-input'>"+"</div>"+
                    "</td>"+
                    "</tr>"+
                    "<tr  id='"+"remark-"+i+"'>" + "</tr>";
                $("#firBodySizeList").append(iconHtml);
            }
            tableOrderNum++;
        }
    }
    else{
        var tbLength= 0;
        for(var i in ptDef){
            tbLength++;
        }
        tbLength= Math.ceil(tbLength/2);

        $(".sce-table").show();
        var tpcount=0;
        for(var i in ptDef){
            var name='';
            if(theLanguage==="zh-cmn-Hans"){
                name=ptDef[i].nameCn;
            }else if(theLanguage==="en"){
                name=ptDef[i].nameEn;
            }else if(theLanguage==="ja"){
                name=ptDef[i].nameEn;
            };
            if(tpcount<tbLength){
                if(ptDef[i].adjustedval!=null && ptDef[i].adjustedval!=""){

                    var iconUrl = ptDef[i].iconUrl;
                    var iconHtml =
                        "<tr  id='"+i+"'  class='measure-cell'>"+
                        "<td  onclick='iconToggle(this)' class='measure-icon'    >"+
                        "<img src="+iconUrl+ ">"+
                        "</td>"+
                        "<td onclick='iconToggle(this)'>"+
                        tableOrderNum+". "+name
                        +"</td>"+
                        "<td ondblclick='editClick(this)'class='detail-form' id='detail-form-"+i+"' value='"+(ptDef[i].adjustedval.toFixed(2))+"' >"+
                        "<span class='size-inf no-edit-form'  >"+ptDef[i].adjustedval.toFixed(2)+"</span>"+
                        "<div class='edit-input'>"+"</div>"+
                        "</td>"+
                        "</tr>"+
                        "<tr  id='"+"remark-"+i+"'>" + "</tr>";
                    $("#firBodySizeList").append(iconHtml);
                }
            }else{
                if(ptDef[i].adjustedval!=null && ptDef[i].adjustedval!=""){
                    var iconUrl = ptDef[i].iconUrl;
                    var iconHtml =
                        "<tr  id='"+i+"'  class='measure-cell'>"+
                        "<td  onclick='iconToggle(this)' class='measure-icon'  >"+
                        "<img src="+iconUrl+ ">"+
                        "</td>"+
                        "<td onclick='iconToggle(this)'>"+
                        tableOrderNum+". "+name
                        +"</td>"+
                        "<td ondblclick='editClick(this)'class='detail-form' id='detail-form-"+i+"' value='"+(ptDef[i].adjustedval.toFixed(2))+"' >"+
                        "<span class='size-inf no-edit-form'  >"+ptDef[i].adjustedval.toFixed(2)+"</span>"+
                        "<div class='edit-input'>"+"</div>"+
                        "</td>"+
                        "</tr>"+
                        "<tr  id='"+"remark-"+i+"'>" + "</tr>";
                    $("#secBodySizeList").append(iconHtml);
                }
            }
            tableOrderNum++;
            tpcount++;
        }

    }
    $(".content").mCustomScrollbar();
}

function iconToggle(e) {
    var tempIdName = e.parentElement.nextSibling.id;
    var idName = tempIdName.split("-");// 在每个逗号(,)处进行分解。
    var srcTarget = "#remark-"+activeIcon;

    var currTarget= "#"+tempIdName;
    if(idName[1]!=activeIcon){
        if(activeIcon!=""){
            $(srcTarget).removeClass("micon-active");
            $(srcTarget).find(".desc-container").remove();
        }
        $(currTarget).addClass("micon-active");
        activeIcon=idName[1];
        if(theLanguage==="zh-cmn-Hans"){
            var secLine = "<p>"+ptDef[activeIcon].descCn+"</p>";
        }else if(theLanguage==="en"){
            var secLine = "<p>"+ptDef[activeIcon].descEn+"</p>";
        }else if(theLanguage==="ja"){
            var secLine = "<p>"+ptDef[activeIcon].descEn+"</p>";
        }

        $(currTarget).prepend("<td colspan='3' class='desc-container' onclick='descToggle(this)'><div class='desc-arrow desc-arrow-right'></div> "+"<div class='size-desc'>"+secLine+"</div></td>");

    } else {
        $(currTarget).find(".desc-container").remove();
        $(currTarget).removeClass("micon-active");
        activeIcon="";
    }

}

function descToggle(e) {
    var sizeDescId = "#"+e.parentElement.id+" .desc-container .size-desc";
    var arrowId = "#"+e.parentElement.id+" .desc-container .desc-arrow";
    $(sizeDescId ).toggle("fast",function () {
        if($(sizeDescId).css("display")=="none"){
            $(arrowId).removeClass("desc-arrow-right");
            $(arrowId).addClass("desc-arrow-left");
        }else {
            $(arrowId).addClass("desc-arrow-right");
            $(arrowId).removeClass("desc-arrow-left");
        }
    });
}

function editClick(e) {
    if(!$(e).is('.input')){
        var preval=Number($(e).text());
        $(e).addClass('input').html('<input type="number"  value="'+ Number($(e).text()) +'" />')
            .find('input').focus().blur(function(){
            var tempid=e.id.split("-");
            tempid=tempid[2];
            ptDef[tempid].adjustedval=Number($(this).val());
            if(ptDef[tempid].adjustedval!=preval){
                ptDef[tempid].masureStatus=3;
            }

            $(this).parent().removeClass('input').html($(this).val() || preval||0);
        });
    }
}

function toogle(e){
    if($(e).text()==='CM'){
        for(var i in ptDef){
            ptDef[i].adjustedval*=0.3937008;  //换算成英尺
            currentUnit=unit[1];
            $("#detail-form-"+i).text(ptDef[i].adjustedval.toFixed(2));
        }
        $(e).html('IN');
    }else if($(e).text()==='IN'){
        for(var i in ptDef){
            ptDef[i].adjustedval*=2.54;//换算成厘米
            currentUnit=unit[0];
            $("#detail-form-"+i).text(ptDef[i].adjustedval.toFixed(2));
        }
        $(e).html('CM');
    }
}
//init unit's toogle to move on cm
function initToogle() {
    $(".unit-toogle").html('CM');
}

//time Ascending
function timeAscending(value1,value2){
    if (value1.createdTime < value2.createdTime) {
        return -1;
    } else if (value1.createdTime > value2.createdTime) {
        return 1;
    }else{
        return 0;
    }
};

//time Descending
function timeDescending(value1,value2){
    if (value1.createdTime < value2.createdTime) {
        return 1;
    } else if (value1.createdTime > value2.createdTime) {
        return -1;
    }else{
        return 0;
    }
};




