/**
 * @file forgetPassword.js
 * @author wei jie huang
 * @copyright Shenzhen TOZI Tech Co.
 * @createDate 2018-7-25 14:41:00
 */
'use strict';
var theLanguage = $('html').attr('lang');

$("#cnForgetPwUrl").click(function () {
    window.location.href=forgetPwURL["zh-cmn-Hans"];
});
$("#enForgetPwUrl").click(function () {
    window.location.href=forgetPwURL["en"];
});
$("#jpForgetPwUrl").click(function () {
    window.location.href=forgetPwURL["ja"];
});

$("#returnLogin").click(function () {
    window.location.href=loginURL[theLanguage];
});

$("#sendCode").click(function () {
    $("#sendCode").attr("disabled","true");
    var i=60;
    var coutDown=setInterval(function () {
        $("#sendCode").html(i);
        i--;
        if(i===0){
            clearInterval(coutDown);
            $("#sendCode").html(sendText[theLanguage]);
            $("#sendCode").removeAttr("disabled")
        }
    },1000);
    var email=$("#email").val();
    var reqData={
        "email":email,
    };

    toz_ajax.post({
        url: SDKAPI['sendemail'],
        data: reqData,
        success:function (res) {
            if (res.data.code!=0){
                toz_Toast.init({title:"Wrong",content:res.data.data,duration:-1,mask:false,icon:'failure'});
            }
        },
    });
});

$("#VerCode").on('change',function () {
    var reqData={
        "email":$("#email").val(),
        "code":$("#VerCode").val(),
    };
    toz_ajax.post({
        url: SDKAPI['vericode'],
        data: reqData,
        success:function (res) {
            if(res.data.code===0){
                $("#codeWrong").hide();
                $("#codeRight").show();
                $("input[type='password']").removeAttr("disabled");
            }else{
                $("#codeRight").hide();
                $("#codeWrong").show();
                $("input[type='password']").attr("disabled","true");
            }
        },
    });
});

$("#firPw").on('change',function () {
    var pPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{6,16}$/;
    if(pPattern.test($("#firPw").val())){
        $("#firPwWarning p").remove();
        $("#firPwWrong").hide();
        $("#firPwRight").show();
    }else{
        $("#firPwRight").hide();
        $("#firPwWrong").show();
        if(!$('#firPwWarning').html()){
            var html='<p>'+accountFirPwWarning[theLanguage]+'</p>';
            $("#firPwWarning").append(html);
        }
    }
});

$("#secPw").on('change',function () {
    if($("#firPw").val()===$("#secPw").val()){
        $("#secPwWarning p").remove();
        $("#secPwWrong").hide();
        $("#secPwRight").show();
        // $("#Submit").removeAttr("disabled");
    }else{
        $("#secPwRight").hide();
        $("#secPwWrong").show();
        // $("#Submit").attr("disabled","true");
        if(!$("#secPwWarning").html()){
            var html='<p>'+accountSecPwWarning[theLanguage]+'</p>';
            $("#secPwWarning").append(html);
        }
    }
});

$("#Submit").click(function () {
    toz_Toast.init({title:"Loading",duration:-1,mask:true,icon:'loading'});

    var pPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{6,16}$/;
    if((!pPattern.test($("#firPw").val()))||($("#firPw").val()!=$("#secPw").val())){
        if(!pPattern.test($("#firPw").val())){
            toz_Toast.init({title:"Warning",content:accountFirPwWarning[theLanguage],duration:-1,mask:false,icon:'warning'});
        }else if($("#firPw").val()!=$("#secPw").val()){
            toz_Toast.init({title:"Warning",content:accountSecPwWarning[theLanguage],duration:-1,mask:false,icon:'warning'});
        }
        return;
    }
    var reqData={
        "email":$("#email").val(),
        "password":$("#firPw").val(),
        "code":$("#VerCode").val(),
    };
    toz_ajax.post({
        url: SDKAPI['newpsw'],
        data: reqData,
        success:function (res) {
            if(res.data.code===0){
                toz_Toast.init({title:"Success",content:"Password has changed",duration:2000,mask:false,icon:'success'});
            }else{
                toz_Toast.init({title:"Wrong",content:res.data.data,duration:-1,mask:false,icon:'failure'});
            }
        },
    })
});