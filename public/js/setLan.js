var xSetLan = {
    lan : "en",//语言类型，默认英语
};

var lanContent = {
    cn : {
        "Login" : "登陆",
        "Profile" : "个人账户",
        "Sign out" : "登出",
        "Users" : "用户",
        "Tutorial" : "教程",
        "Account" : "账户",
        "Password" : "密码",
        "Server Domain" : "Server Domain",
        "Last login time" : "最后登录时间",
        "CorpName" : "公司名称",
        "Phone" : "手机",
        "Email" : "邮箱",
        "Code" : "验证码",
        "Submit" : "提交",
        "emailTips1" : "*新名称不能与原来相同",
        "emailTips2" : "*新手机号码不能与原来相同",
        "emailTips3" : "*新邮箱不能与原来相同",
        "Original Password" : "旧密码",
        "New Password" : "新密码",
        "Confirm Password" : "确认新密码",
        "passwordTips1" : "*旧密码不正确",
        "passwordTips2" : "*新密码需要6-16位,由字母、数字或'_'组成",
        "passwordTips3" : "*与新密码不匹配",
    },
    
    jp : {
        "Login" : "ログイン",
        "Profile" : "プロフィール",
        "Sign out" : "サインアウト",
        "Users" : "ユーザー",
        "Tutorial" : "チュートリアル",
        "Account" : "アカウント",
        "Password" : "パスワード",
        "Server Domain" : "Server Domain",
        "Last login time" : "最終ログイン時刻",
        "CorpName" : "社名",
        "Phone" : "電話",
        "Email" : "Email",
        "Code" : "検証コード",
        "Submit" : "提出する",
        "emailTips1" : "*新しい名前はオリジナルと同じであってはなりません",
        "emailTips2" : "*新しい携帯電話番号は元のものと同じにはできません",
        "emailTips3" : "*新しいメールボックスは元のメールボックスと同じにはできません",
        "Original Password" : "元のパスワード",
        "New Password" : "新しいパスワード",
        "Confirm Password" : "パスワードの確認",
        "passwordTips1" : "*元のパスワードが正しくありません",
        "passwordTips2" : "*新しいパスワードは、文字、数字、および '_'で構成された6〜16桁の数字が必要です",
        "passwordTips3" : "*新しいパスワードと一致しません",
    },
    
    en : {
        "Login" : "Login",
        "Profile" : "Profile",
        "Sign out" : "Sign out",
        "Users" : "Users",
        "Tutorial" : "Tutorial",
        "Account" : "Account",
        "Password" : "Password",
        "Server Domain" : "Server Domain",
        "Last login time" : "Last login time",
        "CorpName" : "CorpName",
        "Phone" : "Phone",
        "Email" : "Email",
        "Code" : "Code",
        "Submit" : "Submit",
        "emailTips1" : "*The new name cannot be the same as the original",
        "emailTips2" : "*The new mobile number cannot be the same as the original",
        "emailTips3" : "*New mailbox cannot be the same as the original",
        "Original Password" : "Original Password",
        "New Password" : "New Password",
        "Confirm Password" : "Confirm Password",
        "passwordTips1" : "*Original password is not correctly",
        "passwordTips2" : "*New password needs 6-16 digits, consisting of letters, numbers, and '_'",
        "passwordTips3" : "*Does not match the new password",
    },
    //set-lan="xx"
};

//绑定选择语言的事件
(function bindChooseLan() {
    let chooseLan = document.getElementsByClassName('choose-lan');
    let len =  chooseLan.length;
    for(let i = 0; i < len; i++) {
        
         chooseLan[i].addEventListener('click', () => {
            xSetLan.lan =  chooseLan[i].getAttribute("data-lan");
    
            $('[set-lan]').each(function(){
                var me = $(this);
                var a = me.attr('set-lan');
             
                //选取语言文字
                switch(xSetLan.lan){
                    case 'cn':
                        var t = lanContent.cn[a]; 
                        break;
                    case 'en':
                        var t = lanContent.en[a];
                        break;
                    default:
                        var t = lanContent.jp[a];
                }
             
                //如果所选语言的json中没有此内容就选取其他语言显示
                if(t==undefined) t = lanContent.cn[m];
                if(t==undefined) t = lanContent.en[m];
                if(t==undefined) t = lanContent.jp[m];
    
                //如果还是没有就跳出返回他的标识
                if(t==undefined) t = m;   
                
                me.html(t);
            });
    
        });
    }
})();
    
    
    
//按照选择的语言初始化文字
$('[set-lan]').each(function(){
    var me = $(this);
    var a = me.attr('set-lan');
    switch(xSetLan.lan){
        case 'cn':
            var t = lanContent.cn[a]; 
            break;
        case 'en':
            var t = lanContent.en[a];
            break;
        default:
            var t = lanContent.jp[a];
    }

    //如果所选语言的json中没有此内容就选取其他语言显示
    if(t==undefined) t = lanContent.cn[a];
    if(t==undefined) t = lanContent.en[a];
    if(t==undefined) t = lanContent.jp[a];

    //如果还是没有就跳出
    if(t==undefined) t = m;   
    
    me.html(t);
}); 


//js往html中插入文字使用的函数
function xGetContent(m){
    //获取文字
    var lan = xSetLan.lan;     //语言版本
    //选取语言文字
    switch(lan){
        case 'cn':
            var t = lanContent.cn[m];
            break;
        case 'jp':
            var t = lanContent.jp[m];
            break;
        default:
            var t = lanContent.en[m];
    }

    //如果所选语言的json中没有此内容就选取其他语言显示
    if(t==undefined) t = lanContent.cn[m];
    if(t==undefined) t = lanContent.en[m];
    if(t==undefined) t = lanContent.jp[m];

    if(t==undefined) t = m;

    return t;
}   
