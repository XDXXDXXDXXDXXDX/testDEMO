/**
 * @file account.js
 * @author wei jie huang
 * @copyright Shenzhen TOZI Tech Co.
 * @createDate 2018-7-25 14:41:00
 */
'use strict';
var theLanguage = $('html').attr('lang');
var token=getCookie("tozSDK_token");
if(token===null||token===''){
    delCookie('tozSDK_corpName');
    delCookie('tozSDK_token');
    // window.location.href=loginURL[theLanguage];
}
else{
    toz_ajax.post({
        url: SDKAPI['getlimit'],
        data: {
            "accessToken":token,
        },
        closeLoading:typeof (isMobile)!="undefined"?isMobile:false,//close loading toast while getting data from API 'getlimit' on mobile
        success:function (res) {
            if (res.data.code===0){
                $("#measureTimes").html(res.data.data.apiUsage);
                $("#totalTimes").html(res.data.data.apiLimit);
                $("#emailName").html(res.data.data.email);
                $("#chgTozAPI").html('<p>'+(res.data.data.corpApi?res.data.data.corpApi:"Null")+"</p>");
                $("#corpApi").attr("value",res.data.data.corpApi?res.data.data.corpApi.replace("https://",""):"");
                $("#httpBasicAuth").attr("value",res.data.data.httpBasicAuth?res.data.data.httpBasicAuth:"");
            }else{
                toz_Toast.init({title:"Wrong",content:res.data.data,duration:-1,mask:false,icon:'failure'});
            }
        },
    })
}

$(".cnAccountUrl").click(function () {
    window.location.href=accountURL["zh-cmn-Hans"];
});
$(".enAccountUrl").click(function () {
    window.location.href=accountURL["en"];
});
$(".jpAccountUrl").click(function () {
    window.location.href=accountURL["ja"];
});

$(".return-account-html").click(function () {
    $(".reset-email-html").hide();
    $(".reset-password-html").hide();
    $(".reset-api-html").hide();
    $(".account-html").show();
});

$("#chgEmail").click(function () {
    $(".account-html").hide();
    $(".reset-email-html").show();
});

$("#chgPassword").click(function () {
    $(".account-html").hide();
    $(".reset-password-html").show();
});

$("#chgAPI").click(function () {
    $(".account-html").hide();
    $(".reset-api-html").show();
});

$("#firPw").on('change',function () {
    var pPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{6,16}$/;
    if(pPattern.test($("#firPw").val())){
        $("#firPwWarning p").remove();
        $("#firPwWrong").hide();
        $("#firPwRight").show();
    }
    else{
        $("#firPwRight").hide();
        $("#firPwWrong").show();
        if(!$('#firPwWarning').html()){
            var html='<p>'+accountFirPwWarning[theLanguage]+'</p>';
            $("#firPwWarning").append(html);
        }
    };

    if($("#secPw").val()!=''&&$("#secPw").val()!=null){
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
    }
});

$("#secPw").on('change',function () {
    if($("#firPw").val()===$("#secPw").val()){
        $("#secPwWarning p").remove();
        $("#secPwWrong").hide();
        $("#secPwRight").show();
    }else{
        $("#secPwRight").hide();
        $("#secPwWrong").show();
        if(!$("#secPwWarning").html()){
            var html='<p>'+accountSecPwWarning[theLanguage]+'</p>';
            $("#secPwWarning").append(html);
        }
    }
});

$("#PwSubmit").click(function () {
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
        "accessToken":token,
        "oldpassword":$("#oldPassword").val(),
        "newpassword":$("#firPw").val()
    };
    toz_ajax.post({
        url: SDKAPI['resetpsw'],
        data: reqData,
        success:function (res) {
            if(res.data.code===0){
                toz_Toast.init({title:"Success",content:"Password has changed",duration:2000,mask:false,icon:'success'});
            }else{
                toz_Toast.init({title:"Wrong",content:res.data.data,duration:-1,mask:false,icon:'failure'});
            }
        },
    });
});

$("#sendCode").click(function () {
    var email=$("#email").val();
    if(email===null||email==''){
        toz_Toast.init({title:"Warning",content:"Email can't empty!",duration:3000,mask:false,icon:'warning'});
        return;
    }
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

    var reqData={
        "accessToken":token,
        "email":email,
    };
    toz_ajax.post({
        url: SDKAPI['acSendEmail'],
        data: reqData,
        success:function (res) {
            if (res.data.code!=0){
                clearInterval(coutDown);
                $("#sendCode").html(sendText[theLanguage]);
                $("#sendCode").removeAttr("disabled");
                toz_Toast.init({title:"Wrong",content:res.data.data,duration:-1,mask:false,icon:'failure'});
            }
        },
        complete:function (XMLHttpRequest,status) {
            if(XMLHttpRequest.status!=200){
                clearInterval(coutDown);
                $("#sendCode").html(sendText[theLanguage]);
                $("#sendCode").removeAttr("disabled");
            }
        }
    });
});

$("#VerCode").on('change',function () {
    var reqData={
        "email":$("#email").val(),
        "code":$("#VerCode").val(),
    };
    toz_ajax.post({
        url:SDKAPI['vericode'],
        data: reqData,
        closeLoading:true,
        success:function (res) {
            if(res.data.code===0){
                $("#codeWrong").hide();
                $("#codeRight").show();
                $("#emailSubmit").removeAttr("disabled")
            }else{
                $("#codeRight").hide();
                $("#codeWrong").show();
                $("#emailSubmit").attr("disabled","true");
            }
        },
    });
});

$("#emailSubmit").click(function () {
    var reqData={
        "email":$("#email").val(),
        "accessToken":getCookie("token"),
    };
    toz_ajax.post({
        url: SDKAPI['newemail'],
        data: reqData,
        success:function (res) {
            if(res.data.code===0){
                toz_Toast.init({title:"Success",content:"Password has changed",duration:2000,mask:false,icon:'success'});
            }else{
                toz_Toast.init({title:"Wrong",content:res.data.data,duration:-1,mask:false,icon:'failure'});
            }
        },
    });
});

$("#APISubmit").click(function () {
    var corpApi='';
    if(!($("#corpApi").val().match(/^\s*$/))){
        corpApi="https://"+$("#corpApi").val();
    }
    var httpBasicAuth=$("#httpBasicAuth").val();

    var reqData={
        "accessToken":token,
        "httpBasicAuth":httpBasicAuth.toString(),
        "corpApi":corpApi.toString()
    };
    toz_ajax.post({
        url:SDKAPI['updatecorpapi'],
        data:reqData,
        contentType:"application/json",
        success:function (res) {
            if(res.data.code===0){
                $("#chgTozAPI").html('<p>'+(corpApi===''?'Null':corpApi)+'</p>');
                toz_Toast.init({title:"Success",content:"Api has been reset",duration:2000,mask:false,icon:'success'});
            }else{
                toz_Toast.init({title:"Wrong",content:res.data.data,duration:-1,mask:false,icon:'failure'});
            }
    }});
});

$("#Logout").click(function () {
    delCookie('tozSDK_corpName');
    delCookie('tozSDK_token');
    window.location.href=loginURL[theLanguage];
});

$(".header-nav-bar-content li a").hover(function () {
    $("#accountContainer").removeClass("nav-bar-select");
}, function () {
    $("#accountContainer").addClass("nav-bar-select");
});

$("#corpApi").on('change',function () {
    var auDomainUrl=$(this).val();
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    if (!regex.test(auDomainUrl)) {
        var html='<p>'+cApiWarnText[theLanguage]+'</p>';
        $("#cApiWarnText").empty();
        $("#cApiWarnText").append(html);
    }else{
        $("#cApiWarnText").empty();
    }
    var re = new RegExp("^(http|https)://", "i");
    if(re.test(auDomainUrl)){
        auDomainUrl=auDomainUrl.replace("https://","");
        auDomainUrl=auDomainUrl.replace("http://","")
        $(this).val(auDomainUrl);
    }
})