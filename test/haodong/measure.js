/**
 * @file measure
 * @author wei jie huang
 * @copyright Shenzhen TOZI Tech Co.
 * @createDate 2018-8-10 16:29:00
 */
'use strict';


function UrlSearch() {
    var name,value;
    var str=location.href; //取得整个地址栏
    var num=str.indexOf("?");
    if(num<0){
        return;
    }
    str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]

    var arr=str.split("&"); //各个参数放到数组里
    var urlPar={};
    for(var i=0;i < arr.length;i++){
        num=arr[i].indexOf("=");
        if(num>0){
            name=arr[i].substring(0,num);
            value=arr[i].substr(num+1);
            urlPar[name]=value;
        }
    }
    return urlPar;
}
function getData(){
    toz_ajax.get({
        url: 'https://www.tozmart.com:3000/p/users/pullMeasureData',
        contentType:'application/json;charset=utf-8',
        dataType:'text',
        crossDomain:true,
        success:function (res) {
            console.log(res);
        },
    });
};
function pretrData() {
    if(res.data.code=="200"&&res.data.data!=null){
        excelId=Number($(e).attr("id"));
        var jsonptsInfo=JSON.parse(res.data.data.ptsInfo);
        console.log(jsonptsInfo);
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
        console.log(jsonbasicInfo);
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
            imgCont:["#imgfContainer","#imgsContainer"],//容器id号
            retrButton:["#retractFront","#retractSide"],//回退事件按键id号
        };

        var scope = angular.element(ctrl).scope();
        scope.getData(measureData);
        if(showTips===true){
            showGuide(scope);
        }
    }
}

//toz_ajax package ajax
var toz_ajax=function (setting) {
    this.settings={};
};
toz_ajax.prototype = {
    post:function (settings) {
        var _that=this;
        var id="tozA_"+this.genID(2);
        this.settings[id]=$.extend({
            url:'',
            data: '',
            timeout: 120000,          // 设置超时时间
            dataType: 'JSON',
            async: true,
            contentType:"application/x-www-form-urlencoded; charset=UTF-8",
            headers: {
                Authorization:'',
            },
            crossDomain:false,
            beforeSend:new Function("return"),
            success:new Function("return"),
            fail:new Function("return"),
            complete:new Function("return"),
            closeLoading:false,
        }, settings);

        var xhr=$.ajax({
            type: 'post',
            url:_that.settings[id].url,
            data:_that.settings[id].data,
            timeout: _that.settings[id].timeout,          // 设置超时时间
            dataType:_that.settings[id].dataType,
            async: _that.settings[id].async,
            crossDomain:_that.settings[id].crossDomain,
            headers: {
                "Authorization": _that.settings[id].headers.Authorization
            },
            success:function (res) {
                _that.settings[id].success(res);
                delete _that.settings[id];
            },
            fail:function (err) {
                _that.settings[id].fail(err);
                delete _that.settings[id];
            },
            complete: function (XMLHttpRequest,status) {
                if(status == 'timeout') {
                    xhr.abort();    // 超时后中断请求
                }else if(XMLHttpRequest.status!=200){
                    _that.settings[id].complete({"XMLHttpRequest":XMLHttpRequest,"status":status});
                    delete _that.settings[id];
                }
            }
        });
    },
    get:function (settings) {
        // $.get(settings.url, function(res){
        //     console.log(res);
        // });
        // return;

        var _that=this;
        var id="tozA_"+this.genID(2);
        this.settings[id]=$.extend({
            url:'',
            data: '',
            timeout: 120000,          // 设置超时时间
            dataType: 'JSON',
            async: true,
            contentType:"application/x-www-form-urlencoded; charset=UTF-8",
            headers: {
                Authorization:'',
            },
            crossDomain:false,
            beforeSend:new Function("return"),
            success:new Function("return"),
            fail:new Function("return"),
            complete:new Function("return"),
            closeLoading:false,
        }, settings);

        var xhr=$.ajax({
            type: 'get',
            url:_that.settings[id].url,
            timeout: _that.settings[id].timeout,          // 设置超时时间
            dataType:_that.settings[id].dataType,
            // async: _that.settings[id].async,
            crossDomain:_that.settings[id].crossDomain,
            // headers: {
            //     "Authorization": _that.settings[id].headers.Authorization
            // },
            success:function (res) {
                console.log(res);
                _that.settings[id].success(res);
                delete _that.settings[id];
            },
            fail:function (err) {
                console.log(err);
                _that.settings[id].fail(err);
                delete _that.settings[id];
            },
            complete: function (XMLHttpRequest,status) {
                console.log(XMLHttpRequest.status);
                console.log(status);
                if(status == 'timeout') {
                    xhr.abort();    // 超时后中断请求
                }else if(XMLHttpRequest.status!=200){
                    _that.settings[id].complete({"XMLHttpRequest":XMLHttpRequest,"status":status});
                    delete _that.settings[id];
                }
            }
        });
    },
    genID:function(length){
        return Number(Math.random().toString().substr(3,length) + Date.now()).toString(36);
    },
};
var toz_ajax=new toz_ajax();
getData();