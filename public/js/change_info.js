/**
 * 用户信息
 */
var xOriData = {
    corpName : "",
    email : "",
    password : "",
    lastLoginTime : "",
    corpApi : "",
    httpBasicAuth : ""
};

//测试用途
// var xStorage=window.localStorage;
//写入password字段
// xStorage.pass=1;

/**
 * 拉取初始数据
 */
function oriData() {
    $(".input-corpName").val(xOriData.corpName);//名称
    $(".input-email").val(xOriData.email);//邮箱
    $(".input-domain").val(xOriData.corpApi);//corpApi
    $("input-http").val(xOriData.httpBasicAuth);//httpBasicAuth

    let date = new Date();
    date.setTime(xOriData.lastLoginTime);
    $('.last-login-time').html(date); //最后登录时间
}


/**
 * 登陆一下
 */
(function xLogin() {
    for(let i = 0; i < 3; i++) {
        document.getElementsByClassName('x-login')[i].addEventListener('click', () => {
            applyTrial();
        })
    }
    
    function applyTrial() {
        var reqData={
            "username": "shuo.liu@tozmart.com",
            "password": "66668888",
            "rememberMe": 1,
        };
    
        $.post({
            url: SDKAPI['signin'],
            data: reqData,
            success:function (res) {
                // console.log(res);
                if(res.data.code=="200"&&res.data.data.accessToken!=''){
                    if(1){
                        // console.log(res);
                        setCookie('tozSDK_email',reqData.username,7); //保存帐号到cookie，有效期7天
                        setCookie('tozSDK_token',res.data.data.accessToken,7); //保存密码到cookie，有效期7天
                        setCookie('tozSDK_corpName',res.data.data.corpName,7); //保存corpName到cookie
                        setCookie('tozSDK_keepTime',168,7);
                    }
                    //拉取初始数据
                    xOriData.corpName = res.data.data.corpName;
                    xOriData.password = res.data.data.accessToken;
                    xOriData.lastLoginTime = res.data.data.lastLoginTime;

                    // //测试用
                    // xStorage.pass = res.data.data.accessToken;
                    // xStorage.email = reqData.username;
                    // xStorage.cropName = res.data.data.corpName;
                    // $('body').append("<iframe id='xframe' src='./tutorial.html' frameborder='0'></iframe>");
                    
                    $.post({
                        url: SDKAPI['getlimit'],
                        data: {"accessToken":xOriData.password},
                        success:function (res) {
                            // console.log(res);
                            xOriData.email = res.data.data.email;
                            xOriData.corpApi = res.data.data.corpApi?res.data.data.corpApi.replace("https://",""):"https://";
                            xOriData.httpBasicAuth = res.data.data.httpBasicAuth?res.data.data.httpBasicAuth:"";
                            profileControl();//个人信息控制器
                            passwordControl();//密码控制器
                            domainControl();//domain控制器
                            oriData();//拉取初始数据
                        },
                    });   
                }
                else{
                    toz_Toast.init({title:"Wrong",content:res.data.data,duration:-1,mask:false,icon:'failure'});
                }
            },
        });
    }
})();

/**
 * 个人资料页面总操作
 */
function profileControl() {
    phoneFun();//更改手机
    emailFun();//更改邮箱
    submitProfile();//提交个人信息
};


/*手机相关*/
//更改手机相关操作
function phoneFun() {
    let oriPhone = [123, 13288888888];
    let phone1 = $(".phone-location")[0]; //要验证值的手机地区
    let phone2 = $(".phone-number")[0]; //要验证值的手机号码
    //绑定键盘事件
    phone2.onkeyup = () => {checkPhone(oriPhone, phone1, phone2);};
};

//判断手机输入是否正确
function checkPhone(oriPhone, phone1, phone2){
// 　  let reg = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/; //正则表达式
　　//当手机输入正确/错误时，正确显示手机输入错误图像
    //当输入手机与原来相同时，提示用户
    if(phone2.value == oriPhone[1] && phone1.value == oriPhone[0]){
        $(".repeat-phone").css('visibility','visible');
        return false;
    }else{
        $(".repeat-phone").css('visibility','hidden');
　　　　return true;
    }
    
}

/*邮箱相关*/
//更改邮箱相关操作
function emailFun() {
    let oriEmail = xOriData.email;
    let email = $(".input-email")[0]; //要验证值的邮箱输入框
    //绑定键盘事件
    email.onkeyup = () => {checkEmail(oriEmail, email, true);};
    sendCode(oriEmail, email, checkEmail);
    //调用验证码验证函数
    codeFun();
};

//判断邮箱输入是否正确
function checkEmail(oriEmail, email, timeState){
　  let reg = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/; //正则表达式
　　//当邮箱输入正确/错误时，正确显示邮箱输入错误图像、发送验证码图像、验证码输入框
    //当输入邮箱与原来相同时，提示用户
    if(email.value == oriEmail && timeState){
        $(".repeat-email").css('visibility','visible');
        $(".email-wrong-img").css('display','inline-block');
        $(".send-img").css('display','none');
        return false;
    }else if(!reg.test(email.value) && timeState){ //正则验证不通过
        $(".email-wrong-img").css('display','inline-block');
        $(".send-img").css('display','none');
        $(".profile-code").css('display','none');
        $(".repeat-email").css('visibility','hidden');
　　　　return false;
　　}else if(timeState){
        $(".email-wrong-img").css('display','none');
        $(".send-img").css('display','inline-block');
        $(".repeat-email").css('visibility','hidden');
　　　　return true;
    }   
}

//发送验证码相关操作
function sendCode(oriEmail, email, callback) {
    //验证码发送小飞机图像绑定点击事件
    $(".send-img")[0].addEventListener('click', () => {
        XsendCode(oriEmail, email, callback);
    });
}

// 发送验证码
function XsendCode(oriEmail, email, callback) {
    //验证码倒计时状态
    let timeState = true;
    let newEmail=$(".input-email").val();
    var reqData={
        "accessToken": xOriData.password,
        "email": newEmail,
    };
        $.post({
        url: SDKAPI['acSendEmail'],
        data: reqData,
        success:function () {
            //每次点击发送验证码重置倒计时
            $(".left-time").html('10');
            //展示倒计时与验证码输入框
            $(".profile-code").css('display','block');
            $(".send-img").css('display','none');
            $(".send-code-time").css('display','inline-block');
            timeState = false;
            //可再次点击发送验证码的倒计时
            let sendCodeTime = setInterval(() => {
                $(".left-time").html((i, oldNum) => {
                    if(oldNum - 1 < 10) {
                        return "0" + (oldNum - 1);   
                    }else{
                        return oldNum - 1;  
                    }    
                });
                //倒计时结束，清除计时器，恢复60s倒计时
                if($(".left-time").html() == 0) {
                    $(".send-code-time").css('display','none');
                    $(".left-time").html('10');
                    callback(oriEmail, email, true);//判断新的输入邮箱是否正确
                    clearInterval(sendCodeTime);
                    timeState = true;
                }
                email.onkeyup = function() {callback(oriEmail, email, timeState);};//重新绑定按下事件
            },1000);
        }
    });
};

//验证码检验按键绑定
function codeFun() {
    let code = $(".input-code")[0]; //要验证值的验证码输入框
    code.onkeyup = () => {checkCode();};
}

//验证码验证
function checkCode() {
    var reqData={
        "email":$(".input-email").val(),
        "code":$(".input-code").val(),
    };
    $.post({
        url:SDKAPI['vericode'],
        data: reqData,
        success:function (res) {
            if(res.data.code===0){
                $(".code-right-img").css('display','inline-block');
                $(".code-wrong-img").css('display','none');
        　　　　 return true;
            }else{
                $(".code-right-img").css('display','none');
                $(".code-wrong-img").css('display','inline-block');
        　　　　 return false;
            }
        },
    });
}

//提交修改个人信息相关
function submitProfile() {
    let oriPhone = [123, 13288888888];
    let phone1 = $(".phone-location")[0]; //要验证值的手机地区
    let phone2 = $(".phone-number")[0]; //要验证值的手机号码
    let oriEmail = xOriData.email;
    let email = $(".input-email")[0]; //要验证值的邮箱输入框
    let code = $(".input-code")[0]; //要验证值的验证码输入框
    $('.profile-submit')[0].addEventListener('click', () => {
        //先判断信息输入是否正确
        if(!(checkEmail2(email) && checkCode2())){
            return false;
        }else{
            if(email.value != oriEmail) {
                var reqData={
                    "email":$(".input-email").val(),
                    "accessToken":xOriData.password,
                };
                $.post({
                    url: SDKAPI['newemail'],
                    data: reqData,
                    success:function (res) {
                        if(res.data.code===0){
                            alert("邮箱修改成功，请重新登陆");
                            window.location.reload();
                        }else{
                            alert("邮箱修改失败");
                        }
                    },
                });
            }else {
                alert('邮箱与原来相同不修改');
            }
            if(phone2.value != oriPhone[1] && phone1.value != oriPhone[0]) {
                console.log([phone1.value, phone2.value]);
            }else {
                console.log('手机与原来相同不提交');
            }
            // alert('修改成功');
            // window.location.reload();
            return true;
        }
    });
}

//仅用作提交时判断邮箱输入是否正确，不做显示改变
function checkEmail2(email){
　  let reg = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/; //正则表达式
    if(!reg.test(email.value)){ //正则验证不通过
　　　　return false;
　　}else{
　　　　return true;
    }   
}

//仅用作提交时判断code是否正确
function checkCode2() {
    if(document.getElementsByClassName('code-right-img')[0].style.display == 'inline-block') {
        return true;
    }else {
        return false;
    }
}



/**
 * 密码页面总操作
 */
function passwordControl() {
    passwordFun();//更改密码相关
    submitPassword();//提交按钮确认旧密码是否输入正确，新密码是否与旧密码相同
};

//更改密码操作
function passwordFun() {
    let password = $(".new-password")[0]; //要验证值的密码输入框
    let password2 = $(".confirm-new-password")[0]; //确认新密码输入框
    //两个新密码输入框验证正确与否的事件
    password.onkeyup = () => {checkPassword(password);};
    password2.onkeyup = () => {checkPassword2(password, password2);};
    //旧密码输入时隐藏提示语
    // $(".ori-password")[0].onkeyup = () => {
    //     $(".password-unmatch").css('visibility','hidden');
    // }
};

//判断新密码输入是否正确
function checkPassword(password){
　  let reg = /^[\w_]{6,16}$/; //正则表达式
    $(".password-illegal").text(xGetContent("passwordTips2"));
　　//当密码输入正确/错误时，正确显示密码输入正确错误图像
    if(!reg.test(password.value)){ //正则验证不通过
        $(".password-illegal").css('visibility','visible');
　　　　return false;
　　}else{
        $(".password-illegal").css('visibility','hidden');
　　　　return true;
    } 
}

//判断确认密码是否输入正确
function checkPassword2(password, password2){
    if(password.value != password2.value) {
        $(".new-password-unmatch").css('visibility','visible');
        return false;
    }else{
        $(".new-password-unmatch").css('visibility','hidden'); 
        return true;
    }
}

//提交修改密码相关
function submitPassword() {
    let password = $(".new-password")[0]; //要验证值的密码输入框
    let password2 = $(".confirm-new-password")[0]; //确认新密码输入框 
    $('.password-submit')[0].addEventListener('click', () => {
        //先判断是否新密码输入正确在判断旧密码输入是否正确
        if(!(checkPassword(password) && checkPassword2(password, password2))){
            return false;
        }else{
            var reqData={
                "accessToken": xOriData.password,
                "oldpassword": $(".ori-password").val(),
                "newpassword": $(".new-password").val()
            };
            $.post({
                url: SDKAPI['resetpsw'],
                data: reqData,
                success:function (res) {
                    if(res.data.code===0){
                        alert("密码修改成功,请重新登陆");
                        window.location.reload();
                    }else{
                        alert("密码修改失败,请检查旧密码是否正确");
                    }
                },
            });
        }
    });
}

/**
 * domain页面总操作
 */
function domainControl() {
    domainFun();//更改domain相关
    submitDomain();//提交按钮确认旧密码是否输入正确，新密码是否与旧密码相同
};

//更改domain
function domainFun() {
    let domain = $(".input-domain")[0]; //要验证值的domain输入框
    let httpB = $(".input-httpB")[0]; //要验证值的basic输入框
    //两个信息输入框验证正确与否的事件
    domain.onkeyup = () => {chenckDomain(domain);};
    // httpB.onkeyup = () => {};
}

//检查domain
function chenckDomain(domain) {
        var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        var regex = new RegExp(expression);
        if(!regex.test(domain.value)){ //正则验证不通过
            $(".domain-unmatch").css('visibility','visible');
    　　}else{
            $(".domain-unmatch").css('visibility','hidden');
        } 
        var re = new RegExp("^(http|https)://", "i");
        if(re.test(domain.value)){
            domain.value = domain.value.replace("https://","");
            domain.value = domain.value.replace("http://","")
        }
}


//提交时检查domain
function chenckDomain2() {
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    if(!regex.test($(".input-domain")[0].value)){ //正则验证不通过
        return false;
　　}else{
        return true;
    } 
}

//提交domain相关
function submitDomain() {
    $('.domain-submit')[0].addEventListener('click', () => {
        if(chenckDomain2()){
            return false;
        }else{
            let corpApi='';
            if(!($(".input-domain")[0].value.match(/^\s*$/))){
                corpApi="https://"+$(".input-domain")[0].value;
            }
            let httpBasicAuth=$(".input-httpB")[0].value;
            var reqData={
                "accessToken":xOriData.corpName,
                "httpBasicAuth":httpBasicAuth.toString(),
                "corpApi":corpApi.toString()
            };
            $.post({
                url:SDKAPI['updatecorpapi'],
                data:reqData,
                success:function (res) {
                    if(res.data.code===0){
                        alert('修改成功');
                        window.location.reload();
                    }else{
                        alert('修改失败');
                    }
            }});
               
        }
        
    });
}

/**
 * 点一下垃圾桶删除所有输入内容
 */
(function deleteInput() {
    let del = document.getElementsByClassName('delete-all');
    let len = del.length;
    for(let i = 0; i < len; i++) {
        del[i].addEventListener('click', () => {
            del[i].previousSibling.value = "";
        });
    };
})();

/**
 * 点击个人信息对话框展示相应信息
 */
(function accountSelect() {
    let cusItem = document.getElementsByClassName('cus-item');
    let len = cusItem.length;
    for(let i = 0; i < len; i++) {
        cusItem[i].addEventListener('click', () => {
            switch(i) {
                case 0:
                    $(".profile").css('display','block');
                    $(".password").css('display','none');
                    $(".domain").css('display','none');
                    break;
                case 1:
                    $(".profile").css('display','none');
                    $(".password").css('display','block');
                    $(".domain").css('display','none');
                    break;
                case 2:
                    $(".profile").css('display','none');
                    $(".password").css('display','none');
                    $(".domain").css('display','block');
                    break;
            }
        });
    }
})(); 


function XgetCookie(name){    
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");    
    if(arr=document.cookie.match(reg))  {
        return unescape(arr[2]);   
    }else{
        return null;
    }    
}



