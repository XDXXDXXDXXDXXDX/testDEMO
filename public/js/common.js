/**
 * @file common operation of measure and tutorial
 * @author wei jie huang
 * @copyright Shenzhen TOZI Tech Co.
 * @createDate 2018-7-25 14:41:00
 */

'use strict';
var theLanguage = $('html').attr('lang');
var ctrl= document.querySelector('[ng-controller=SwitchViewCtrl]');//to get the scope of tozDraw.js(wrote using angular js )

var stressBoxId;//the div's id of current selected person in list
var showTips=false;//decide to show or hide tips, false is to hide and true is to show
var imgCount=2;//图片数目
var imgViewStatue=['f','s','b'];//小屏情况下，界面所在图片名称
var curImgViewStatue=imgViewStatue[0];;//小屏情况下，当前界面所在图片名称
var fl_kpName_fir=[
    "fl_toe",
    "fl_knee",
    "fl_crotch_cen",
    "fl_crotch_out",
    "fl_waist",
    "fl_hip",
    "fl_armsye",
    "fl_biceps",
    "fl_shoulder",
    "fl_neck",
    "fr_face",
    "fl_headtop",
];//the oldest data of kpName of fl(the left outline on the front img)
var fl_kpName_sec=[
    "fl_toe",
    "fl_calf",
    "fl_knee",
    "fl_crotch_cen",
    "fl_crotch_out",
    "fl_waist",
    "fl_hip",
    "fl_armsye",
    "fl_biceps",
    "fl_shoulder",
    "fl_neck",
    "fr_face",
    "fl_headtop",
];//the second oldest data of kpName of fl, including calf point
var fr_kpName=[
    "fr_toe",
    "fr_knee",
    "fr_waist",
    "fr_hip",
    "fr_armsye",
    "fr_biceps",
    "fr_shoulder",
    "fl_neck",
    "fr_face",
    "fr_headtop",
];//old data of kpName of fr (the right outline on the front img)
var sf_kpName=[
    "sf_knee",
    "sf_knee",
    "sf_knee",
    "sf_knee",
    "sf_belly",
    "sf_belly",
    "sf_belly",
    "sf_bust",
    "sf_jaw",
    "sf_headtop",
];//old data of kpName of sf (the front outline on the side img)
var sb_kpName=[
    "sb_toe",
    "sb_foot",
    "sb_foot",
    "sb_foot",
    "sb_foot",
    "sb_crotch",
    "sb_hip",
    "sb_bkwaist",
    "sb_hump",
    "sb_neck",
    "sb_headtop",

];//old data of kpName of sb (the back outline on the side img)
var exception_kpName={
    f:["fr_thigh"],
    s:["sf_jaw"],
};//no tips' img of these points, so hide these tips
var showTips_BindName=["imgf_Hover2Suspension","imgs_Hover2Suspension"];
var hideGetMeasure=false;//whether hide getMeasurements button, false is no, true is to hide
//append corp name at the account
appendCorpName();

//add scroll bar' style for firefox
addScrollbar(".cus-list");

//to show or hide button and canvas
showOrHideButton();

$(window).resize(function() {
    showOrHideButton();
});

$(document).bind('click',function(e){
    var e = e || window.event; //浏览器兼容性
    var elem = e.target || e.srcElement;
    while (elem) { //循环判断至跟节点，防止点击的是div子元素
        if (elem.id && elem.id=='accountContainer') {
            return;
        }
        elem = elem.parentNode;
    }

    $('.toz-header-drop-down-content').css('display','none'); //点击的不是div或其子元素
});

$("#Account").click(function () {
    window.location.href=accountURL[theLanguage];
});

$("#Measure").click(function () {
    window.location.href=measureURL[theLanguage];
});

$("#Tutorial").click(function () {
    window.location.href=tutorialURL[theLanguage];
});

$("#Logout").click(function () {
    delCookie('tozSDK_corpName');
    delCookie('tozSDK_token');
    window.location.href=loginURL[theLanguage];
});

//click showTips button to show or hide tips
$("#showTips").click(function () {
    var scope = angular.element(ctrl).scope();

    if(showTips===true){
        showTips=false;
        $('.toz-poptip').remove();
        scope.unbindFun(showTips_BindName[0]);
        scope.unbindFun(showTips_BindName[1]);
    }else{
        showGuide(scope);
    }
});

//click side button to hide front img and show side img
$("#showSideImg").click(function () {
    curImgViewStatue=imgViewStatue[1];
    showOrHideButton();
});

//click front button to hide side img and show front img
$("#showFrontImg").click(function () {
    curImgViewStatue=imgViewStatue[0];
    showOrHideButton();
});
//click Back button to hide side img and show Back img
$("#showBackImg").click(function () {
    curImgViewStatue=imgViewStatue[2];
    showOrHideButton();
});
//click Back2Side button to hide back img and show side img
$("#back2SideImg").click(function () {
    curImgViewStatue=imgViewStatue[1];
    showOrHideButton();
});

//drop down
$('.toz-header-drop-down').click(function () {
    if($(this).find('.toz-header-drop-down-content').css('display')==='none'){
        $(this).find('.toz-header-drop-down-content').css({
            'display': 'block'
        });
    }else{
        $(this).find('.toz-header-drop-down-content').css({
            'display': 'none'
        });
    }
});

//append corp name at the account
function appendCorpName(){
    var corpName=localStorage.getItem("cropName"); //getCookie('tozSDK_corpName');
    var corpHtml='<span>'+corpName+'</span>';
    var corpEmail = '<p style="font-size: small">'+decodeURIComponent(localStorage.getItem("email")) +'</p>'; //getCookie("tozSDK_email")
    $("#Account-P").append(corpHtml);
    $("#Account-Label").append(corpHtml);
    $("#Account-Label").append(corpEmail);
}

//if mouse hover on special points, show the Tips
function showGuide(){
    var $scope = angular.element(ctrl).scope();
    $scope.unbindFun("imgf_Hover2Suspension");
    $scope.unbindFun("imgs_Hover2Suspension");
    showTips=true;
    $scope.bindFun(
        "imgf_Hover2Suspension",
        function(ev,v){
            var f_offsets = $('#canvasContainer').offset();
            var offsets = $('#imgfContainer').offset();
            var tempx=v.x+offsets.left-f_offsets.left;
            var addDx=300;
            var minusDx=-300;
            var Dx=50,Dy=$("#canvasContainer").height()*0.0556;
            var addDy=500+Dy;
            var minusDy=-addDy;

            var showx;
            var showy;
            if(v.dir===0){
                if((tempx+minusDx)>0){
                    showx=(tempx+minusDx);
                    if((v.y+minusDy)>0){
                        showy=(v.y+minusDy);
                    }else if((v.y+addDy)<=$('#canvasContainer').height()){
                        showy=(v.y+Dy);
                    }
                }
                else if((tempx+addDx)<$('#canvasContainer').width()){
                    showx=(tempx+Dx);
                    if((v.y+minusDy)>0){
                        showy=(v.y+minusDy);
                    }else if((v.y+addDy)<=$('#canvasContainer').height()){
                        showy=(v.y+Dy);
                    }
                }
            }
            else if(v.dir===1||v.dir===2){
                if((tempx+addDx)<$('#canvasContainer').width()){
                    showx=(tempx+Dx);
                    if((v.y+minusDy)>0){
                        showy=(v.y+minusDy);
                    }else if((v.y+addDy)<=$('#canvasContainer').height()){
                        showy=(v.y+Dy);
                    }
                }
            }
            else if((tempx+minusDx)>0){
                showx=(tempx+minusDx);
                if((v.y+minusDy)>0){
                    showy=(v.y+minusDy);
                }else if((v.y+addDy)<=$('#canvasContainer').height()){
                    showy=(v.y+Dy);
                }
            }
            var pName="";

            if(measureData.PaintKeyPts===null||measureData.PaintKeyPts===''){
                if(v.dir===0){
                    if(measureData.FL_MP.length===13){
                        pName=fl_kpName_sec[v.index];
                    }else{
                        pName=fl_kpName_fir[v.index];
                    }
                }
                else if(v.dir===1){
                    pName=fr_kpName[v.index];
                }
                else{
                    if(v.index==="FT_Waist_Line"){
                        pName+="f_side_waistline_point";
                    }
                };
            }
            else{
                if(v.dir===0){
                    pName=measureData.PaintKeyPts[v.index].PtName;
                }
                else if(v.dir===1){
                    pName=measureData.PaintKeyPts[v.index+measureData.MP['f'][0].length].PtName;
                }
                else{
                    if(v.index==="FT_Waist_Line"){
                        pName+="f_side_waistline_point";
                    }
                };
            }

            for (var i=0;i<exception_kpName.f.length;i++){
                if(pName===exception_kpName.f[i]){
                    return;
                }
            }

            $('#canvasContainer').append("<div class='toz-poptip'><img class='tipimg' src='assets/imgs/Guide/"+pName+".png'></div>");

            $(".toz-poptip").css({
                "top":showy+"px",
                "left":showx+"px"
            });
            $(".toz-poptip").show();
        },
        function(){
            $('.toz-poptip').remove();
        }
    );

    $scope.bindFun(
        "imgs_Hover2Suspension",
        function(ev,v){
            var f_offsets = $('#canvasContainer').offset();
            var offsets = $('#imgsContainer').offset();
            var tempx=v.x+offsets.left-f_offsets.left;
            var addDx=300;
            var minusDx=-300;

            var Dx=50,Dy=$("#canvasContainer").height()*0.0556;
            var addDy=500+Dy;
            var minusDy=-addDy;
            var showx;
            var showy;
            if(v.dir===1){
                if((tempx+minusDx)>0){
                    showx=(tempx+minusDx);
                    if((v.y+minusDy)>0){
                        showy=(v.y+minusDy);
                    }else if((v.y+addDy)<=$('#canvasContainer').height()){
                        showy=(v.y+Dy);
                    }
                }
                else if((tempx+addDx)<$('#canvasContainer').width()){
                    showx=(tempx+Dx);
                    if((v.y+minusDy)>0){
                        showy=(v.y+minusDy);
                    }else if((v.y+addDy)<=$('#canvasContainer').height()){
                        showy=(v.y+Dy);
                    }
                }
            }
            else if(v.dir===0||v.dir===2){
                if((tempx+addDx)<$('#canvasContainer').width()){
                    showx=(tempx+Dx);
                    if((v.y+minusDy)>0){
                        showy=(v.y+minusDy);
                    }else if((v.y+addDy)<=$('#canvasContainer').height()){
                        showy=(v.y+Dy);
                    }
                }
                else if((tempx+minusDx)>0){
                    showx=(tempx+minusDx);
                    if((v.y+minusDy)>0){
                        showy=(v.y+minusDy);
                    }else if((v.y+addDy)<=$('#canvasContainer').height()){
                        showy=(v.y+Dy);
                    }
                }
            }
            var pName="";
            if(measureData.PaintKeyPts===''||measureData.PaintKeyPts===null){
                if(v.dir===0){
                    pName=sf_kpName[v.index];
                }
                else if(v.dir===1){
                    pName=sb_kpName[v.index];
                }
                else{
                    if(v.index==="Sd_FT_Waist_Line"){
                        pName+="s_front_waistline_point";
                    }
                    else if(v.index==="Sd_BK_Waist_Line"){
                        pName+="s_back_waistline_point";
                    }else if(v.index==="Sd_Arm-S"){
                        pName+="s_arm_line_top_point";
                    }else if(v.index==="Sd_Arm-E"){
                        pName+="s_sleeve_length_end_point";
                    }
                };
            }
            else{
                if(v.dir===0){
                    pName=measureData.PaintKeyPts[v.index+measureData.MP['f'][0].length+measureData.MP['f'][1].length].PtName;
                }
                else if(v.dir===1){
                    pName=measureData.PaintKeyPts[v.index+measureData.MP['f'][0].length+measureData.MP['f'][1].length+measureData.MP['s'][0].length].PtName;
                }
                else{
                    if(v.index==="Sd_FT_Waist_Line"){
                        pName+="s_front_waistline_point";
                    }
                    else if(v.index==="Sd_BK_Waist_Line"){
                        pName+="s_back_waistline_point";
                    }else if(v.index==="Sd_Arm-S"){
                        pName+="s_arm_line_top_point";
                    }else if(v.index==="Sd_Arm-E"){
                        pName+="s_sleeve_length_end_point";
                    }
                };
            };
            for (var i=0;i<exception_kpName.s.length;i++){
                if(pName===exception_kpName.s[i]){
                    return;
                }
            }
            $('#canvasContainer').append("<div class='toz-poptip'><img class='tipimg' src='assets/imgs/Guide/"+pName+".png'>666666</div>");

            $(".toz-poptip").css({
                "top":showy+"px",
                "left":showx+"px"
            });
            $(".toz-poptip").show();
        },

        function(){
            $('.toz-poptip').remove();
        }
    );
};

//when click adjust or view button, the selected box of list will be emphasized with blue frame
function select2highlightBox(e) {
    var getId=$(e).attr("id").split("_");
    $(".text-item").removeClass("select-box");
    $("#"+getId[0]).addClass("select-box");
    stressBoxId="#"+getId[0];
};

//make sure the selected box being highlighted
function maintainHighlightedBox() {
    $(".text-item").removeClass("select-box");
    $(stressBoxId).addClass("select-box");
}

//add scroll bar' style for firefox
function addScrollbar(cN) {
    if (navigator.userAgent.indexOf("Firefox") > -1){
        $(".cover-layer").show();
        $(cN).css({
            "overflow-y": "hidden",
            "-ms-overflow-y": "hidden",
        });
        $(cN).addClass("mCustomScrollbar");
        $(cN).addClass("fluid");
        $(".cover-layer").hide();
    }
};

//to show or hide button and canvas
function  showOrHideButton() {
    var windowWidth = $(window).width(); //获取窗口宽度
    if(windowWidth<=768){
        $(".img-container").css('width',"100%");
        if(curImgViewStatue===imgViewStatue[0]){
            $(".adjust-button-group button").hide();
            $(".front-img-button").show();
            $("#imgfContainer").css("z-index",9);
            $("#imgsContainer").css("z-index",9);
            $("#imgbContainer").css("z-index",9);
        }
        else if(curImgViewStatue===imgViewStatue[1]){
            $(".adjust-button-group button").hide();
            $(".side-img-button").show();
            $("#imgfContainer").css("z-index",9);
            $("#imgbContainer").css("z-index",9);
            $("#imgsContainer").css("z-index",9);
            if(imgCount===2){
                $("#showBackImg").hide();
                $("#getMeasurements").show();
            }else if(imgCount===3){
                $("#showBackImg").show();
                $("#getMeasurements").hide();
            }
        }
        else if(curImgViewStatue===imgViewStatue[2]){
            $(".adjust-button-group button").hide();
            $(".back-img-button").show();
            $("#getMeasurements").show();
            $("#imgfContainer").css("z-index",9);
            $("#imgsContainer").css("z-index",9);
            $("#imgbContainer").css("z-index",9);
        }
    }
    else{
        $(".img-container").css('width',90/imgCount+"%");
        $(".adjust-button-group button").hide();
        $("#getMeasurements").show();
        $("#retractFront").show();
        $("#retractSide").show();
        if(imgCount===2){
            $("#retractBack").hide();
        }else if(imgCount===3){
            $("#retractBack").show();
        }

        $("#imgfContainer").css("z-index",9);
        $("#imgsContainer").css("z-index",9);
        $("#imgbContainer").css("z-index",9);
    }
    $("#showTarget").show();
    $("#showTips").show();
}

//if token is overtime,log out
// setTimeout(function () {
//     $("#Logout").click();
// },Number(getCookie('tozSDK_keepTime'))*3600000);

// function  showOrHideButton() {
//     var windowWidth = $(window).width(); //获取窗口宽度
//     if(windowWidth<=768){
//         $(".img-container").css('width',"100%");
//         if(curImgViewStatue===imgViewStatue[0]){
//             $(".adjust-button-group button").hide();
//             $(".front-img-button").show();
//             $("#imgfContainer").css("z-index",9);
//             $("#imgsContainer").css("z-index",-9);
//             $("#imgbContainer").css("z-index",-9);
//         }
//         else if(curImgViewStatue===imgViewStatue[1]){
//             $(".adjust-button-group button").hide();
//             $(".side-img-button").show();
//             $("#imgfContainer").css("z-index",-9);
//             $("#imgbContainer").css("z-index",-9);
//             $("#imgsContainer").css("z-index",9);
//             if(imgCount===2){
//                 $("#showBackImg").hide();
//                 $("#getMeasurements").show();
//             }else if(imgCount===3){
//                 $("#showBackImg").show();
//                 $("#getMeasurements").hide();
//             }
//         }
//         else if(curImgViewStatue===imgViewStatue[2]){
//             $(".adjust-button-group button").hide();
//             $(".back-img-button").show();
//             $("#getMeasurements").show();
//             $("#imgfContainer").css("z-index",-9);
//             $("#imgsContainer").css("z-index",-9);
//             $("#imgbContainer").css("z-index",9);
//         }
//     }
//     else{
//         $(".img-container").css('width',90/imgCount+"%");
//         $(".adjust-button-group button").hide();
//         $("#getMeasurements").show();
//         $("#retractFront").show();
//         $("#retractSide").show();
//         if(imgCount===2){
//             $("#retractBack").hide();
//         }else if(imgCount===3){
//             $("#retractBack").show();
//         }

//         $("#imgfContainer").css("z-index",9);
//         $("#imgsContainer").css("z-index",9);
//         $("#imgbContainer").css("z-index",9);
//     }
//     $("#showTarget").show();
//     $("#showTips").show();
// }