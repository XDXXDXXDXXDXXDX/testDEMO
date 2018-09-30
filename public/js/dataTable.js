/**
 * @file common data and function
 * @author wei jie huang
 * @copyright Shenzhen TOZI Tech Co.
 * @createDate 2018-7-25 14:41:00
 */
'use strict';

var loginURL={
    "zh-cmn-Hans":'https://www.emtailor.com/b2bviews/backend-sdk/cn/login.html',
    "en":'https://www.emtailor.com/b2bviews/backend-sdk/en/login.html',
    "ja":'https://www.emtailor.com/b2bviews/backend-sdk/jp/login.html',
};
var measureURL={
    "zh-cmn-Hans":"https://www.emtailor.com/b2bviews/backend-sdk/cn/measure.html",
    'en':"https://www.emtailor.com/b2bviews/backend-sdk/en/measure.html",
    'ja':"https://www.emtailor.com/b2bviews/backend-sdk/jp/measure.html",
};

var tutorialURL={
    "zh-cmn-Hans":"https://www.emtailor.com/b2bviews/backend-sdk/cn/tutorial.html",
    'en':"https://www.emtailor.com/b2bviews/backend-sdk/en/tutorial.html",
    'ja':"https://www.emtailor.com/b2bviews/backend-sdk/jp/tutorial.html",
};
var accountURL={
    "zh-cmn-Hans":"https://www.emtailor.com/b2bviews/backend-sdk/cn/account.html",
    'en':"https://www.emtailor.com/b2bviews/backend-sdk/en/account.html",
    'ja':"https://www.emtailor.com/b2bviews/backend-sdk/jp/account.html",
};
var forgetPwURL={
    "zh-cmn-Hans":"https://www.emtailor.com/b2bviews/backend-sdk/cn/forget-password.html",
    'en':"https://www.emtailor.com/b2bviews/backend-sdk/en/forget-password.html",
    'ja':"https://www.emtailor.com/b2bviews/backend-sdk/jp/forget-password.html",
};
var measureMobileURL={
    "zh-cmn-Hans":"https://www.emtailor.com/b2bviews/backend-sdk/cn/measure-mobile.html",
    'en':"https://www.emtailor.com/b2bviews/backend-sdk/en/measure-mobile.html",
    'ja':"https://www.emtailor.com/b2bviews/backend-sdk/jp/measure-mobile.html",
};
var userIdTable={
    "zh-cmn-Hans":"ID",
    'en':"ID",
    'ja':"名前",
};
var adjustTable={
    "zh-cmn-Hans":"调整",
    'en':"Adjust",
    'ja':"調整",
};
var viewTable={
    "zh-cmn-Hans":"展示",
    'en':"View",
    'ja':"表示",
}
var genderTable={
    "zh-cmn-Hans":["女","男"],
    'en':['Female','Male'],
    'ja':["女性","男性"],
};
var accountFirPwWarning={
    "zh-cmn-Hans":"密码长度6-16位，至少分别有一个特殊符号、大写字母、小写字母和数字",
    'en':"Password must be 6-16 characters, and including at least one special character, capital letter, lowercase letter, and digit.",
    'ja':"パスワードは6-16文字で、記号、大文字、小文字、数字を含んでいる必要があります",
};
var accountSecPwWarning={
    "zh-cmn-Hans":"两个密码不一致",
    'en':"Password is different from the first one.",
    'ja':"パスワードが一致しません",
};
var sendText={
    "zh-cmn-Hans":"Send",
    'en':"Send",
    'ja':"送る",
};
var cApiWarnText={
    "zh-cmn-Hans":"这不是一个合法的域名",
    'en':"It isn't an authorized domain!",
    'ja':"It isn't an authorized domain!",
};
var SDKAPI={
    "signin":'https://www.emtailor.com/b2b/api/corp/signin',
    "imgsMeasure":'https://www.emtailor.com/b2b/api/measure/imgs',
    "imgsTutorial":'https://www.emtailor.com/b2b/api/tutorial/imgs',
    'getlimit':'https://www.emtailor.com/b2b/api/corp/acsetting/getlimit',
    'add':'https://www.emtailor.com/b2b/api/measure/add',
    "resetpsw": 'https://www.emtailor.com/b2b/api/corp/acsetting/resetpsw',
    'sendemail':'https://www.emtailor.com/b2b/api/corp/forgetpsw/sendemail',
    'acSendEmail':'https://www.emtailor.com/b2b/api/corp/acsetting/sendemail',
    'vericode': 'https://www.emtailor.com/b2b/api/corp/forgetpsw/vericode',
    'newemail':'https://www.emtailor.com/b2b/api/corp/acsetting/newemail',
    "newpsw":'https://www.emtailor.com/b2b/api/corp/forgetpsw/newpsw',
    'modelling':'https://www.emtailor.com/b2b/api/measure/modelling',//'https://www.emtailor.com/bndsrv/imeasure-bo/api/measure/web/sqn/modeling',
    'listMeasure':'https://www.emtailor.com/b2b/api/measure/list',
    'listTutorial':'https://www.emtailor.com/b2b/api/tutorial/list',
    'updatecorpapi':'https://www.emtailor.com/b2b/api/corp/acsetting/updatecorpapi',
};


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
        if(this.settings[id].url===''){
            toz_Toast.init({title:"Wrong",content:"Url can't be empty.",duration:-1,mask:false,icon:'failure'});
        }

        if(!this.settings[id].closeLoading){
            var loadingToast=toz_Toast.init({title:"Loading",content:"",duration:-1,mask:true,icon:'loading'});
        }
        this.settings[id].beforeSend(this.settings[id]);
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
                if(!_that.settings[id].closeLoading) {
                    toz_Toast.hideToast(loadingToast);
                }

                setTimeout(function () {
                    _that.settings[id].success(res);
                    delete _that.settings[id];
                },550);
            },
            fail:function (err) {
                if(!_that.settings[id].closeLoading) {
                    toz_Toast.hideToast(loadingToast);
                }
                toz_Toast.init({title:"Wrong",content:err,duration:-1,mask:false,icon:'failure'});
                _that.settings[id].fail(err);
                delete _that.settings[id];
            },
            complete: function (XMLHttpRequest,status) {
                if(status == 'timeout') {
                    xhr.abort();    // 超时后中断请求
                }else if(XMLHttpRequest.status!=200){
                    if(!_that.settings[id].closeLoading) {
                        toz_Toast.hideToast(loadingToast);
                    }
                    toz_Toast.init({title:"Wrong",content:"Sorry, network connection failed. Please try again.(ErrorCode:"+XMLHttpRequest.status+")",duration:-1,mask:false,icon:'failure'});
                    _that.settings[id].complete({"XMLHttpRequest":XMLHttpRequest,"status":status});
                    delete _that.settings[id];
                }
            }
        });
    },
    get:function () {

    },
    genID:function(length){
        return Number(Math.random().toString().substr(3,length) + Date.now()).toString(36);
    },
};
var toz_ajax=new toz_ajax();

//set cookie
function setCookie(name,value,day){
    var date = new Date();
    date.setDate(date.getDate() + day*24*60*60*1000);
    document.cookie = name + '=' + value + ';expires='+ date+";path=/";
};
//get cookie
function getCookie(name){
    var reg = RegExp(name+'=([^;]+)');
    var arr = document.cookie.match(reg);
    if(arr){
        return arr[1];
    }else{
        return '';
    }
};
//delete cookie
function delCookie(name){
    setCookie(name,null,-1);
};

//clone obj
var cloneObj = function(obj){
    var str, newobj = obj.constructor === Array ? [] : {};
    if(typeof obj !== 'object'){
        return;
    } else if(window.JSON){
        str = JSON.stringify(obj), //系列化对象
            newobj = JSON.parse(str); //还原
    } else {
        for(var i in obj){
            newobj[i] = typeof obj[i] === 'object' ?
                cloneObj(obj[i]) : obj[i];
        }
    }
    return newobj;
};

//判断是否为pc端 是返回true 否返回false
function isPc() {
    var system ={};
    var p = navigator.platform;
    system.win = p.indexOf("Win") == 0;
    system.mac = p.indexOf("Mac") == 0;
    system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
    if(system.win||system.mac||system.xll){//如果是电脑跳转到
        return true;
    }else{  //如果是手机,跳转到
        return false;
    }
}