/**
 * @file login.js
 * @author wei jie huang
 * @copyright Shenzhen TOZI Tech Co.
 * @createDate 2018-7-25 14:41:00
 */
'use strict';

var theLanguage = $('html').attr('lang');
var oUser = document.getElementById('inputEmail');
var oPswd = document.getElementById('inputPassword');
var oRemember = document.getElementById('remember');
var singin=angular.module('signin',[]);
singin.controller("signinCtr",["$scope",function ($scope) {
    if(getCookie('tozSDK_email') && getCookie('tozSDK_token')){
        $scope.email = getCookie('tozSDK_email');
        $scope.password = "******";
    }
    else{
        $scope.email='';
        $scope.password='';
    }

    $scope.applyTrial=function () {
        if(!($scope.email!=''&&$scope.password!=''&&$scope.email!=null&&$scope.password!=null)){
            toz_Toast.init({title:"Warning",content:"Email and password can't empty!",duration:-1,mask:false,icon:'warning'});
            return;
        }
        if($scope.email===getCookie('tozSDK_email') && getCookie('tozSDK_token')){
            window.location.href=measureURL[theLanguage];
            return;
        }
        var reqData={
            "username": $scope.email.toString(),
            "password":$scope.password.toString(),
            "rememberMe":oRemember.checked?1:0,
        };

        $.post({
            url: SDKAPI['signin'],
            data: reqData,
            success:function (res) {
                console.log(res);
                if(res.data.code=="200"&&res.data.data.accessToken!=''){
                    if(oRemember.checked){
                        setCookie('tozSDK_email',reqData.username,7); //保存帐号到cookie，有效期7天
                        setCookie('tozSDK_token',res.data.data.accessToken,7); //保存密码到cookie，有效期7天
                        setCookie('tozSDK_corpName',res.data.data.corpName,7); //保存corpName到cookie
                        setCookie('tozSDK_keepTime',168,7);
                    }else{
                        setCookie('tozSDK_token',res.data.data.accessToken); //保存token到cookie
                        setCookie('tozSDK_corpName',res.data.data.corpName); //保存corpName到cookie
                        setCookie('tozSDK_keepTime',24);
                    }

                    var winWidth = document.documentElement.clientWidth;
                    if(isPc()||winWidth>768){
                        window.location.href=measureURL[theLanguage];
                    }
                    else{
                        window.location.href=measureMobileURL[theLanguage];
                    }
                }
                else{
                    toz_Toast.init({title:"Wrong",content:res.data.data,duration:-1,mask:false,icon:'failure'});
                }
            },
        })
    };
}]);

window.onload = function(){
    //页面初始化时，如果帐号密码cookie存在则填充
    if(getCookie('tozSDK_email') && getCookie('tozSDK_token')){
        oUser.value = getCookie('tozSDK_email');
        oPswd.value = "******";
        oRemember.checked = true;
    }
    //复选框勾选状态发生改变时，如果未勾选则清除cookie
    oRemember.onchange = function(){
        if(!this.checked){
            delCookie('tozSDK_email');
            delCookie('tozSDK_token');
            oPswd.value='';
        }
    };
    oPswd.onchange=function () {
        delCookie('tozSDK_token');
    };
    oUser.onchange=function () {
        delCookie('tozSDK_email');
        delCookie('tozSDK_token');
        oPswd.value='';
    };

    $("#cnLoginUrl").click(function () {
        window.location.href=loginURL["zh-cmn-Hans"];
    });
    $("#enLoginUrl").click(function () {
        window.location.href=loginURL["en"];
    });
    $("#jpLoginUrl").click(function () {
        window.location.href=loginURL["ja"];
    });

    $(".register-button").click(function () {
        toz_Toast.init({title:"Opening soon",content:"",duration:3000,mask:false,icon:'warning'});
    });
};

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

