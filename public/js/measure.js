/**
 * @file measure, part of public data and function at dataTable.js and common.js
 * @author wei jie huang
 * @copyright Shenzhen TOZI Tech Co.
 * @createDate 2018-7-25 14:41:00
 */
'use strict';
console.log(document.cookie);
var token=getCookie('tozSDK_token');
var theLanguage = 'en';
//var theLanguage = $('html').attr('lang');
var ctrl= document.querySelector('[ng-controller=SwitchViewCtrl]');

var pageLimit=20;//Limit the number of the list
var itemNum = 0;
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
var toogleFlag=0;//to lock toogle function while changing the unit of size
var corpApi=''; // Defined by Client
var httpBasicAuth='';// Defined by Client

var currentLi =null;

$(function() {

    //初始化'view/adjust'开关按钮
    $('#tutorialSwitch input').bootstrapSwitch({
        onText: "VIEW",
        offText: "ADJUST",
        offColor: "warning",
        onColor: "primary",

        onSwitchChange: function (event, state) {
            if (state == true) {
                viewSize(currentLi);
            } else {
                getData(currentLi);
            }

        }
    })


    $('#tipsSwitch input').bootstrapSwitch({
        onText: "ON",
        offText: "OFF",
        onSwitchChange: function (event, state) {
            var scope = angular.element(ctrl).scope();

            if(state == true){
                $('.toz-poptip').remove();
                scope.unbindFun(showTips_BindName[0]);
                scope.unbindFun(showTips_BindName[1]);
            }else{
                showGuide(scope);
            }

        }
    })

    $('#targetSwitch input').bootstrapSwitch({
        onText: "ON",
        offText: "OFF",
        onSwitchChange: function (event, state) {
            if(state == true){}
            else{

            }
        }
    })

    //加载分页栏
    setTimeout(function(){

        $('#pageBar').jqPaginator({
            totalPages: Math.ceil(itemNum / pageLimit),
            visiblePages: 1,
            currentPage: 1,
            onPageChange: function (num, type) {
                if(type=='change'){
                    uploadList(num)
                }
            }

        })
    },1000);

})


    //get corpapi and httpBasicAuth, ready for post sizes' data to client server
    // getCorpAPI();

    //get the list
    uploadList(1);



    $("#cnMeasureUrl").click(function () {
        window.location.href = measureURL["zh-cmn-Hans"];
    });

    $("#enMeasureUrl").click(function () {
        window.location.href = measureURL["en"];
    });

    $("#jpMeasureUrl").click(function () {
        window.location.href = measureURL["ja"];
    });

    $("#searchButton").click(function () {
        $(".cus-list").empty();
        $('#searchContent').css("visibility",'hidden');
        searchStatus = true;
        uploadList(1);
        setTimeout(function(){
            $('#pageBar').jqPaginator({
                totalPages: Math.ceil(itemNum / pageLimit),
                visiblePages: 1,
                currentPage: 1,
                onPageChange: function (num, type) {
                    if(type=='change'){
                        uploadList(num)
                    }
                }
            })
        },1000);

    });


    $("#timeAscending").click(function () {
        listData = listData.sort(timeAscending);
        appendAtList(listData)
    });

    $("#timeDescending").click(function () {
        listData = listData.sort(timeDescending);
        appendAtList(listData)
    });

    // $("#submitSizesList").click(function () {
    //     var uploadMeasureData = [];
    //     var data2CorpMeasureData = [];
    //     var tmpPtDef = cloneObj(ptDef);
    //     if (currentUnit == unit[1]) {
    //         for (var i in tmpPtDef) {
    //             tmpPtDef[i].adjustedval *= 2.54;//换算成厘米
    //         }
    //     }
    //     for (var i in tmpPtDef) {
    //         var tempData = {
    //             "sizeid": i.toString(),
    //             "sizeval": parseFloat(tmpPtDef[i].sizeval),
    //             "adjustedval": parseFloat(tmpPtDef[i].adjustedval),
    //             "nameEn": tmpPtDef[i].nameEn,
    //             "nameHk": tmpPtDef[i].nameHk,
    //             "nameCn": tmpPtDef[i].nameCn,
    //             "descEn": tmpPtDef[i].descEn,
    //             "descHK": tmpPtDef[i].descHK,
    //             "descCn": tmpPtDef[i].descCn,
    //             "iconUrl": tmpPtDef[i].iconUrl,
    //             "masureStatus": tmpPtDef[i].masureStatus,
    //         };
    //         var secTempData = {
    //             "sizeval": parseFloat(tmpPtDef[i].adjustedval),
    //             "name": theLanguage === "zh-cmn-Hans" ? tmpPtDef[i].nameCn : tmpPtDef[i].nameEn,
    //         };
    //         uploadMeasureData.push(tempData);
    //         data2CorpMeasureData.push(secTempData);
    //     }
    //     ;
    //
    //     var reqData = {
    //         'accessToken': token,
    //         'id': excelId.toString(),
    //         "measureData": JSON.stringify(uploadMeasureData),
    //     };
    //
    //     toz_ajax.post({
    //         url: SDKAPI['add'],
    //         data: reqData,
    //         success: function (res) {
    //             if (res.data.code == "200") {
    //                 $("#show_" + excelId).removeAttr("disabled"); //移除disabled属性
    //             }
    //             else {
    //                 toz_Toast.init({
    //                     title: "Wrong",
    //                     content: res.data.data,
    //                     duration: -1,
    //                     mask: false,
    //                     icon: 'failure'
    //                 });
    //             }
    //         },
    //     });
    //
    //     if (corpApi != null && corpApi != '' && corpApi != 'Null' && corpApi != 'null') {
    //         var updatedAt = new Date().getTime();
    //         var data2Corp = {
    //             "userId": reqData.id, // String
    //             "userGender": measureData.userGender, // Int, 0 = female, 1 = male
    //             "userHeight": measureData.userHeight, //Int, in cm
    //             "userWeight": measureData.userWeight, //Int, in kg
    //             "createdAt": measureData.createdTime, // Int, timestamp when the user created the measuring record
    //             "updatedAt": updatedAt, // Int, timestamp when the body measurement was generated
    //             "frontImg": measureData.url['f'], // String
    //             "sideImg": measureData.url['s'], // String
    //             "measurements": JSON.stringify(data2CorpMeasureData) // Stringified object array
    //         };
    //
    //
    //         toz_ajax.post({
    //             url: corpApi,
    //             data: data2Corp,
    //             headers: {
    //                 "Authorization": httpBasicAuth
    //             },
    //             crossDomain: true,
    //             contentType: "application/json; charset=utf-8",
    //             dataType: "JSON",
    //             success: function (res) {
    //                 if (res.code) {
    //                     if (res.code === 0) {
    //                         toz_Toast.init({
    //                             title: "Success",
    //                             content: "Data storage successful",
    //                             duration: 2000,
    //                             mask: false,
    //                             icon: 'success'
    //                         });
    //                     } else {
    //                         toz_Toast.init({
    //                             title: "Wrong",
    //                             content: "Data storage failed(code:" + res.code + ") " + res.msg ? res.msg : '',
    //                             duration: 2000,
    //                             mask: false,
    //                             icon: 'success'
    //                         });
    //                     }
    //                 } else {
    //                     toz_Toast.init({
    //                         title: "Success",
    //                         content: "Data storage successful",
    //                         duration: 2000,
    //                         mask: false,
    //                         icon: 'success'
    //                     });
    //                 }
    //             },
    //         });
    //     }
    // });

    // $("#toExcelButton").click(function () {
    //     var sheetData = new Array();
    //     var excelUnit = "CM";
    //     if ($(".move").attr("data-state") === "off") {
    //         excelUnit = "IN";
    //     }
    //     var ex_tempPtDef = cloneObj(ptDef);
    //     var option = {};
    //     option.fileName = "UserId" + excelId + "_" + new Date().toISOString().replace(/[\-\:\.]/g, "");
    //
    //     var theLanguage = $('html').attr('lang');
    //     if (theLanguage === "zh-cmn-Hans") {
    //         for (var i in ex_tempPtDef) {
    //             sheetData.push({
    //                 one: ex_tempPtDef[i].nameCn,
    //                 two: ex_tempPtDef[i].adjustedval.toFixed(2)
    //             })
    //         }
    //         ;
    //         option.datas = [
    //             {
    //                 sheetData: sheetData,
    //                 sheetName: 'sheet',
    //                 sheetFilter: ['one', 'two'],
    //                 sheetHeader: ['名称', '尺寸/' + excelUnit],
    //             }
    //         ];
    //     }
    //     else if (theLanguage === "en") {
    //         for (var i in ex_tempPtDef) {
    //             sheetData.push({
    //                 one: ex_tempPtDef[i].nameEn,
    //                 two: ex_tempPtDef[i].adjustedval.toFixed(2)
    //             })
    //         }
    //         ;
    //         option.datas = [
    //             {
    //                 sheetData: sheetData,
    //                 sheetName: 'sheet',
    //                 sheetFilter: ['one', 'two'],
    //                 sheetHeader: ['Name', 'Size/' + excelUnit],
    //             }
    //         ];
    //     } else if (theLanguage === "ja") {
    //         for (var i in ex_tempPtDef) {
    //             sheetData.push({
    //                 one: ex_tempPtDef[i].nameEn,
    //                 two: ex_tempPtDef[i].adjustedval.toFixed(2)
    //             })
    //         }
    //         ;
    //         option.datas = [
    //             {
    //                 sheetData: sheetData,
    //                 sheetName: 'sheet',
    //                 sheetFilter: ['one', 'two'],
    //                 sheetHeader: ['Name', 'Size/' + excelUnit],
    //             }
    //         ];
    //     }
    //
    //     var toExcel = new ExportJsonExcel(option);
    //     toExcel.saveExcel();
    // });

    // $(".header-nav-bar-content li a").hover(function () {
    //     $("#headerMeasure").removeClass("nav-bar-select");
    // }, function () {
    //     $("#headerMeasure").addClass("nav-bar-select");
    // });

    $('#searchIcon').click(function () {
        event.stopPropagation();
        if($('#searchContent').css('visibility')=='hidden'){
            $('#searchContent').css("visibility",'visible')
        }
        else $('#searchContent').css("visibility",'hidden')
    })

    $('#clearDate').click(function () {

        $('#dateValue').text('');
        $('#dateValue').append('<i class="fa fa-calendar"></i> Date range picker')

    })

    $('#daterange-btn').daterangepicker(
        {
            ranges   : {
                'Today'       : [moment(), moment()],
                'Yesterday'   : [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days' : [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month'  : [moment().startOf('month'), moment().endOf('month')],
                'Last Month'  : [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            startDate: moment().subtract(29, 'days'),
            endDate  : moment(),
            minDate:"01/01/2016",
            maxDate:"01/01/2050",
        },
        function (start, end) {
            $('#daterange-btn span').html(start.format('MM/DD/YY') + ' - ' + end.format('MM/DD/YY'))
        }
    )
    $('#searchCancel').click(function () {
        $('#searchContent').css("visibility",'hidden');
    })






    //get corpapi and httpBasicAuth, ready for post sizes' data to client server
    function getCorpAPI() {
        $.ajax({
            url: SDKAPI['getlimit'],
            data: {
                "accessToken": token,
            },
            success: function (res) {
                if (res.data.code === 0) {
                    corpApi = res.data.data.corpApi ? res.data.data.corpApi : "";
                    httpBasicAuth = res.data.data.httpBasicAuth ? res.data.data.httpBasicAuth : "";
                } else {
                    toz_Toast.init({
                        title: "Wrong",
                        content: res.data.data,
                        duration: -1,
                        mask: false,
                        icon: 'failure'
                    });
                }
            },
        })
    };

    //upload list
    function uploadList(page) {

        var value = typeof(page) == "undefined" ? 1 : page;
        var reqData = {};
        if (searchStatus === false) {
            reqData = {
                "accessToken": token,
                "userId": '',
                "limit": pageLimit,
                "offset": (value - 1) * pageLimit,
            };
        } else {
            var startTime = '';
            var endTime = '';

            if($('#dateValue')[0].textContent.indexOf("-")>0){
                var oriStartTime = $('#dateValue')[0].textContent.split("-")[0].trim();
                var oriEndtime =  $('#dateValue')[0].textContent.split("-")[1].trim();


                startTime = new Date((Date.parse(oriStartTime)));
                endTime = new Date((Date.parse(oriEndtime)));
            }

            reqData = {
                "accessToken": token,
                "lastPtsStatus": Number($('input[name="selectedStatus"]:checked').val()),
                "startTime": startTime ? startTime.getTime() : '',
                "endTime": endTime ? endTime.getTime() : '',
                "userId": $("#searchText").val() ? $("#searchText").val().toString() : '',
                "limit": pageLimit,
                "offset": (value - 1) * pageLimit,
            };
        }
        ;

        $.post({
            url:"http://localhost:8000/api/measure/list",
            // url: SDKAPI['listMeasure'],
            data: reqData,
            success: function (res) {
                $(".cus-list").empty();

                if (typeof (res.data.data.data) === "undefined") {
                    toz_Toast.init({
                        title: "Wrong",
                        content: "The data is null!",
                        duration: -1,
                        mask: false,
                        icon: 'failure'
                    });
                    return;
                }
                var listNum = (value - 1) * pageLimit + 1;
                itemNum = res.data.data.total;
                listData = res.data.data.data;
                appendAtList(listData, listNum);
                // maintainHighlightedBox();
                //设置分页导航 pagesize为一页pageLimit个 count为总数
                // if ($('#pageToolbar:has(.ui-paging-container)').length === 0) {
                //     $('#pageToolbar').Paging({
                //         pagesize: pageLimit,
                //         count: res.data.data.total,
                //         toolbar: true,
                //         goFunction: uploadList
                //     });
                // }

            },
        });
        searchStatus = false;
    };

//append item at the list
    function appendAtList(listData, num) {
        $("#cusList").empty();
        var listNum = num ? num : 1;
        for (var i = 0; i < listData.length; i++) {
            var item = listData[i];
            var userGender = genderTable[theLanguage][Number(item.userGender)];

            var date = new Date(item.createdTime);
            var createdate = date.getFullYear() + '-';
            createdate += (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
            createdate += (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
            createdate += (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
            createdate += (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());

            // var Adjusted = false;
            // if (!(item.measureInfo === undefined || item.measureInfo === null || item.measureInfo === [] || item.measureInfo.length === 0)) {
            //     if (typeof (item.measureInfo.measures) != undefined && item.measureInfo.measures != null) {
            //         Adjusted = true;
            //     }
            // }
            var tempitem = {
                // "listNum": listNum,
                "createdTime": createdate,
                "id": item.id,
                "userGender": userGender,
                "userHeight": item.userHeight,
                "userId": item.userId,
                "userWeight": item.userWeight,
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
                '<div id="' + tempitem.id + '" onclick="getData(this);select2highlightBox(this)" class="text-item">' + genderhtml +
                '<div class="cus-data-content">' +
                '<span title="id" >' + userIdTable[theLanguage] + ': ' + tempitem.userId + '</span><br/>' + //<!-- id号 更新数据-->
                '<span title="createdTime" >' + tempitem.createdTime + '</span>'; //<!-- 创建时间号 更新数据-->

            listItemList += '</div></div></li>';


            $("#cusList").append(listItemList);
            // listNum++;

        }


        // maintainHighlightedBox();
    }


//get new pts from string
    function getNewPts(ptsInfo, ptsName) {
        //得到pts
        if (typeof (ptsInfo[ptsName]) === "undefined" || !ptsInfo[ptsName]) {
            return '';
        }
        var firArray = ptsInfo[ptsName].split(",");
        var secArray;

        var pts = [];
        for (var i = 0; i < firArray.length; i++) {
            pts[i] = new Array();
            secArray = firArray[i].split(":");
            for (var j = 0; j < secArray.length; j++) {
                pts[i].push(Number(secArray[j]));
            }
        }
        return pts;
    }

//get color from basic info
    function getNewColor(basicInfo, colorName) {
        if (typeof (basicInfo[colorName]) === "undefined" || !basicInfo[colorName]) {
            return [];
        }
        var firArray = basicInfo[colorName].split(",");
        var color = [];
        for (var i = 0; i < firArray.length - 1; i++) {
            var secArray = firArray[i].split(":");
            color[i] = new Array();
            for (var j = 0; j < secArray.length; j++) {
                color[i].push(Number(secArray[j]));
            }
        }
        return color;
    }

//get pictures' size from basic info
    function getImgSize(basicInfo, imgSizeName) {
        if (!basicInfo[imgSizeName]) {
            return ['', ''];
        }
        var sizeArray = basicInfo[imgSizeName].split(":");
        var sizeWidth = Number(sizeArray[0]);
        var sizeHeight = Number(sizeArray[1]);
        return [sizeWidth, sizeHeight];
    }

//get mp from paintKeyPts
    function getMPFromPK(PaintKeyPts, PtDir) {
        var MP = new Array();
        for (var j = 0; j < PaintKeyPts.length; j++) {
            if (PaintKeyPts[j].PtDir === PtDir) {
                MP.push(Number(PaintKeyPts[j].PtIndex));
            }
        }
        return MP;
    }

//get mp from basic info
    function getMPFromStr(basicInfo, MPName) {
        if (!basicInfo[MPName]) {
            return '';
        }
        //得到MP
        var MP = new Array();
        var firstArray = basicInfo[MPName].split(";");
        var secondArray = firstArray[0].split(",");
        for (var j = 0; j < secondArray.length; j++) {
            MP.push(Number(secondArray[j]));
        }
        return MP;
    }

//to get measure data and draw outline
    function getData(e) {

        currentLi = e;
        $("#showView").hide();
        $("#adjustShowView").show();
        $('#buttonGroupT').hide();
        $('#buttonGroup').show();
        var reqData = {
            'accessToken': token,
            'id': Number($(e).attr("id")),
        };


        $.post({
            url: SDKAPI['imgsMeasure'],
            data: reqData,
            success: function (res) {
                if (res.data.code == "200" && res.data.data != null) {
                    excelId = Number($(e).attr("id"));
                    var jsonPtsInfo = JSON.parse(res.data.data.ptsInfo);
                    jsonPtsInfo = jsonPtsInfo[jsonPtsInfo.length - 1];
                    var jsonBasicInfo = JSON.parse(res.data.data.basicInfo);

                    //得到pts_f
                    var pts_f = getNewPts(jsonPtsInfo, 'pts_f');

                    //得到pts_s [0] [1]代表侧面照身体正面的点的x、y，[2][3]代表侧面照身体背面的点的x、y
                    var pts_s = getNewPts(jsonPtsInfo, 'pts_s');

                    //得到pts_b
                    var pts_b = getNewPts(jsonPtsInfo, 'pts_b');


                    //得到FLCOLOR
                    var FLCOLOR = getNewColor(jsonBasicInfo, 'FLCOLOR');
                    //得到FRCOLOR
                    var FRCOLOR = getNewColor(jsonBasicInfo, 'FRCOLOR');

                    //得到SFCOLOR
                    var SFCOLOR = getNewColor(jsonBasicInfo, 'SFCOLOR');
                    //得到SBCOLOR
                    var SBCOLOR = getNewColor(jsonBasicInfo, 'SBCOLOR');

                    //得到 BLCOLOR
                    var BLCOLOR = getNewColor(jsonBasicInfo, 'BLCOLOR');
                    //得到 BRCOLOR
                    var BRCOLOR = getNewColor(jsonBasicInfo, 'BRCOLOR');

                    var imgfSize = getImgSize(jsonBasicInfo, jsonBasicInfo.img_f_size ? 'img_f_size' : 'Img_f_size');
                    var imgsSize = getImgSize(jsonBasicInfo, jsonBasicInfo.img_s_size ? 'img_s_size' : 'Img_s_size');
                    var imgbSize = getImgSize(jsonBasicInfo, jsonBasicInfo.img_b_size ? 'img_b_size' : 'Img_b_size');

                    var PaintKeyPts = '';
                    if (typeof (jsonBasicInfo.PaintKeyPts) != "undefined") {
                        PaintKeyPts = jsonBasicInfo.PaintKeyPts;
                        //得到FL_MP
                        var FL_MP = getMPFromPK(PaintKeyPts, 'fl');

                        //得到FR_MP
                        var FR_MP = getMPFromPK(PaintKeyPts, 'fr');

                        //得到SF_MP
                        var SF_MP = getMPFromPK(PaintKeyPts, 'sf');

                        //得到SB_MP
                        var SB_MP = getMPFromPK(PaintKeyPts, 'sb');

                        var BL_MP = getMPFromPK(PaintKeyPts, 'bl');

                        var BR_MP = getMPFromPK(PaintKeyPts, 'br');

                    }
                    else {
                        //得到FL_MP
                        var FL_MP = getMPFromStr(jsonBasicInfo, 'FL_MP');
                        //得到FR_MP
                        var FR_MP = getMPFromStr(jsonBasicInfo, 'FR_MP');

                        //得到SF_MP
                        var SF_MP = getMPFromStr(jsonBasicInfo, 'SF_MP');
                        //得到SB_MP
                        var SB_MP = getMPFromStr(jsonBasicInfo, 'SB_MP');

                        //得到BL_MP
                        var BL_MP = getMPFromStr(jsonBasicInfo, 'BL_MP');
                        //得到BR_MP
                        var BR_MP = getMPFromStr(jsonBasicInfo, 'BR_MP');
                    }
                    ;

                    var Adjusted = false;
                    var measureInfo = JSON.parse(res.data.data.measureInfo);
                    if (!(measureInfo === undefined || measureInfo === null || measureInfo === [] || measureInfo.length === 0)) {
                        if (typeof (measureInfo[0].measures) != undefined && measureInfo[0].measures != null) {
                            Adjusted = true;
                        }
                    }
                    if(Adjusted == false){
                        $('#tutorialSwitch input').bootstrapSwitch('disabled', true);
                    }else{
                        $('#tutorialSwitch input').bootstrapSwitch('disabled', false)
                    }

                    measureData = {
                        id: res.data.data.id,
                        userId: res.data.data.userId,//useless for drawing,  used in upload sizes to Client server
                        userGender: res.data.data.userGender,//useless for drawing,  used in upload sizes to Client server
                        userHeight: res.data.data.userHeight,//useless for drawing,  used in upload sizes to Client server
                        userWeight: res.data.data.userWeight,//useless for drawing,  used in upload sizes to Client server
                        createdTime: res.data.data.createdTime,//useless for drawing,  used in upload sizes to Client server

                        dir: ['f', 's', 'b'],
                        pts: {
                            'f': pts_f,
                            's': pts_s,
                            'b': pts_b
                        },
                        //ptsTarget
                        url: {
                            'f': "data:image/jpg;base64," + res.data.data.userImgBasedF, //获得图片base64,
                            's': "data:image/jpg;base64," + res.data.data.userImgBasedS, //获得图片base64,
                            'b': res.data.data.userImgBasedB ? "data:image/jpg;base64," + res.data.data.userImgBasedB : '', //获得图片base64
                        },
                        MP: {
                            'f': [FL_MP, FR_MP],
                            's': [SF_MP, SB_MP],
                            'b': [BL_MP, BR_MP]
                        },
                        COLOR: {
                            'f': [FLCOLOR, FRCOLOR],
                            's': [SFCOLOR, SBCOLOR],
                            'b': [BLCOLOR, BRCOLOR],
                        },
                        imgSize: {
                            'f': imgfSize,
                            's': imgsSize,
                            'b': imgbSize,
                        },
                        PaintLines: JSON.parse(jsonPtsInfo.paintLines), //得到PaintLines
                        // PaintLines_target
                        isTutorial: false,
                        // promptButton:spPar.promptButton,//提示按钮 用于开启提示点
                        PaintKeyPts: PaintKeyPts,
                    };

                    if (measureData.url['b'] != '') {
                        imgCount = 3;
                        $("#imgbContainer").show();
                        $(".img-container").css('width', "30%");
                    } else {
                        imgCount = 2;
                        $("#imgbContainer").hide();
                        $(".img-container").css('width', "45%");
                    }

                    $("#adjustShowView").show();
                    $("#adjustView").show();

                    //窗口宽度小于768时 为小屏 分三页展示
                    curImgViewStatue = imgViewStatue[0];
                    showOrHideButton();

                    var scope = angular.element(ctrl).scope();
                    scope.getData(measureData);
                    if (showTips === true) {
                        showGuide(scope);
                    }
                }
                else {
                    toz_Toast.init({
                        title: "Wrong",
                        content: "Sorry, network connection failed. Please try again.(Code:" + res.data.code + ")",
                        duration: -1,
                        mask: false,
                        icon: 'failure'
                    });
                }
            },
        });
    };

//click view button, to view body sizes
    function viewSize(e) {
        var id = $(e).attr("id");
        id = id.split("_");
        id = id[0];

        var reqData = {
            'accessToken': token.toString(),
            'id': id,
        };

        $.post({
            url: SDKAPI['imgsMeasure'],
            data: reqData,
            success: function (res) {
                if (res.data.code === 200) {
                    $("#adjustShowView").show();
                    var imgf_src = "data:image/jpg;base64," + res.data.data.userImgBasedF;
                    var imgs_src = "data:image/jpg;base64," + res.data.data.userImgBasedS;
                    measureData = {
                        "userGender": res.data.data.userGender, // Int, 0 = female, 1 = male
                        "userHeight": res.data.data.userHeight, //Int, in cm
                        "userWeight": res.data.data.userWeight, //Int, in kg
                        "createdAt": res.data.data.createdTime, // Int, timestamp when the user created the measuring record
                        "frontImg": imgf_src, // String
                        "sideImg": imgs_src, // String
                    };

                    var measureInfo = JSON.parse(res.data.data.measureInfo);
                    excelId = res.data.data.id;
                    measureInfo = measureInfo[measureInfo.length - 1].measures;

                    initSizeView(measureInfo);
                }
                else {
                    toz_Toast.init({
                        title: "Wrong",
                        content: res.data.data,
                        duration: -1,
                        mask: false,
                        icon: 'failure'
                    });
                }
            },
        });
    };

//upload the result of adjustment, then get and show measurements
    function getMeasurements() {
        var scope = angular.element(ctrl).scope();

        var reqData = newReqData(scope.postAdjustRes());
        toz_ajax.post({
            url: SDKAPI['modelling'],
            data: reqData,
            // contentType:'application/json',
            success: function (res) {
                if (res.data.code == "200") {
                    initSizeView(res.data.data);
                }
                else {
                    toz_Toast.init({
                        title: "Wrong",
                        content: res.data.data,
                        duration: -1,
                        mask: false,
                        icon: 'failure'
                    });
                }
            },
        });


        function newReqData(obj) {
            return {
                id: obj.id,
                pts_f: obj.pts_f,
                pts_s: obj.pts_s,
                pts_b: obj.pts_b ? obj.pts_b : null,
                paintLines: obj.paintLines,
                ptsStatus: obj.ptsStatus,
                accessToken: token,
            };
        }

        // function newReqdata(obj) {
        //     this.accessToken=token;
        //     this.id=obj.id;
        //     this.pts_f=obj.pts_f;
        //     this.pts_s=obj.pts_s;
        //     this.paintLines=obj.paintLines;
        //     this.ptsStatus=obj.ptsStatus;
        // }
    };

//to init the size list
    function initSizeView(measureInfo) {
        $("#adjustView").hide();
        $("#showView").show();
        initToogle();
        if (document.getElementById('showView') != null) {
            initSizeList(measureInfo, false);
        }
        $(window).bind('resize', function () {
            if (document.getElementById('showView') != null) {
                initSizeList(measureInfo, true);
            }
        });
    }

    function initSizeList(measureInfo, isResize) {
        $("#firBodySizeList").empty();
        $("#secBodySizeList").empty();
        var tempcount = 0;
        if (isResize === true) { //窗口调整不重新给ptDef赋值
            tempcount = ptDefLength;
        }
        else {
            ptDef = {};
            for (var i = 0; i < measureInfo.length; i++) {
                var tempindex = measureInfo[i].sizeid;
                ptDef[tempindex] = {
                    "descCn": measureInfo[i].descCn,
                    "descEn": measureInfo[i].descEn,
                    "descHk": measureInfo[i].descHk,
                    "iconUrl": measureInfo[i].iconUrl,
                    "nameCn": measureInfo[i].nameCn,
                    "nameEn": measureInfo[i].nameEn,
                    "nameHk": measureInfo[i].nameHk,
                    "sizeval": measureInfo[i].sizeval,
                    "adjustedval": measureInfo[i].adjustedval ? measureInfo[i].adjustedval : measureInfo[i].sizeval,
                    "masureStatus": 4,
                }
                tempcount++;
            }
            ;
            ptDefLength = tempcount;
        }

        var winW = document.documentElement.clientWidth;//屏幕宽度
        var tableOrderNum = 1;
        if (tempcount < maxTableLength || winW < 1000) {
            $(".sce-table").hide();
            var name = '';
            for (var i in ptDef) {
                if (ptDef[i].adjustedval != null && ptDef[i].adjustedval != "") {
                    if (theLanguage === "zh-cmn-Hans") {
                        name = ptDef[i].nameCn;
                    } else if (theLanguage === "en") {
                        name = ptDef[i].nameEn;
                    } else if (theLanguage === "ja") {
                        name = ptDef[i].nameEn;
                    }
                    var iconUrl = ptDef[i].iconUrl;
                    var iconHtml =
                        "<tr  id='" + i + "'  class='measure-cell'>" +
                        "<td  onclick='iconToggle(this)' class='measure-icon'  >" +
                        "<img src=" + iconUrl + ">" +
                        "</td>" +
                        "<td onclick='iconToggle(this)'>" +
                        tableOrderNum + ". " + name
                        + "</td>" +
                        "<td ondblclick='editClick(this)'class='detail-form' id='detail-form-" + i + "' value='" + (ptDef[i].adjustedval.toFixed(2)) + "' >" +
                        "<span class='size-inf no-edit-form'  >" + ptDef[i].adjustedval.toFixed(2) + "</span>" +
                        "<div class='edit-input'>" + "</div>" +
                        "</td>" +
                        "</tr>" +
                        "<tr  id='" + "remark-" + i + "'>" + "</tr>";
                    $("#firBodySizeList").append(iconHtml);
                }
                tableOrderNum++;
            }
        }
        else {
            var tbLength = 0;
            for (var i in ptDef) {
                tbLength++;
            }
            tbLength = Math.ceil(tbLength / 2);

            $(".sce-table").show();
            var tpcount = 0;
            for (var i in ptDef) {
                var name = '';
                if (theLanguage === "zh-cmn-Hans") {
                    name = ptDef[i].nameCn;
                } else if (theLanguage === "en") {
                    name = ptDef[i].nameEn;
                } else if (theLanguage === "ja") {
                    name = ptDef[i].nameEn;
                }
                ;
                if (tpcount < tbLength) {
                    if (ptDef[i].adjustedval != null && ptDef[i].adjustedval != "") {

                        var iconUrl = ptDef[i].iconUrl;
                        var iconHtml =
                            "<tr  id='" + i + "'  class='measure-cell'>" +
                            "<td  onclick='iconToggle(this)' class='measure-icon'    >" +
                            "<img src=" + iconUrl + ">" +
                            "</td>" +
                            "<td onclick='iconToggle(this)'>" +
                            tableOrderNum + ". " + name
                            + "</td>" +
                            "<td ondblclick='editClick(this)'class='detail-form' id='detail-form-" + i + "' value='" + (ptDef[i].adjustedval.toFixed(2)) + "' >" +
                            "<span class='size-inf no-edit-form'  >" + ptDef[i].adjustedval.toFixed(2) + "</span>" +
                            "<div class='edit-input'>" + "</div>" +
                            "</td>" +
                            "</tr>" +
                            "<tr  id='" + "remark-" + i + "'>" + "</tr>";
                        $("#firBodySizeList").append(iconHtml);
                    }
                } else {
                    if (ptDef[i].adjustedval != null && ptDef[i].adjustedval != "") {
                        var iconUrl = ptDef[i].iconUrl;
                        var iconHtml =
                            "<tr  id='" + i + "'  class='measure-cell'>" +
                            "<td  onclick='iconToggle(this)' class='measure-icon'  >" +
                            "<img src=" + iconUrl + ">" +
                            "</td>" +
                            "<td onclick='iconToggle(this)'>" +
                            tableOrderNum + ". " + name
                            + "</td>" +
                            "<td ondblclick='editClick(this)'class='detail-form' id='detail-form-" + i + "' value='" + (ptDef[i].adjustedval.toFixed(2)) + "' >" +
                            "<span class='size-inf no-edit-form'  >" + ptDef[i].adjustedval.toFixed(2) + "</span>" +
                            "<div class='edit-input'>" + "</div>" +
                            "</td>" +
                            "</tr>" +
                            "<tr  id='" + "remark-" + i + "'>" + "</tr>";
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
        var srcTarget = "#remark-" + activeIcon;

        var currTarget = "#" + tempIdName;
        if (idName[1] != activeIcon) {
            if (activeIcon != "") {
                $(srcTarget).removeClass("micon-active");
                $(srcTarget).find(".desc-container").remove();
            }
            $(currTarget).addClass("micon-active");
            activeIcon = idName[1];
            if (theLanguage === "zh-cmn-Hans") {
                var secLine = "<p>" + ptDef[activeIcon].descCn + "</p>";
            } else if (theLanguage === "en") {
                var secLine = "<p>" + ptDef[activeIcon].descEn + "</p>";
            } else if (theLanguage === "ja") {
                var secLine = "<p>" + ptDef[activeIcon].descEn + "</p>";
            }

            $(currTarget).prepend("<td colspan='3' class='desc-container' onclick='descToggle(this)'><div class='desc-arrow desc-arrow-right'></div> " + "<div class='size-desc'>" + secLine + "</div></td>");

        } else {
            $(currTarget).find(".desc-container").remove();
            $(currTarget).removeClass("micon-active");
            activeIcon = "";
        }

    }

    function descToggle(e) {
        var sizeDescId = "#" + e.parentElement.id + " .desc-container .size-desc";
        var arrowId = "#" + e.parentElement.id + " .desc-container .desc-arrow";
        $(sizeDescId).toggle("fast", function () {
            if ($(sizeDescId).css("display") == "none") {
                $(arrowId).removeClass("desc-arrow-right");
                $(arrowId).addClass("desc-arrow-left");
            } else {
                $(arrowId).addClass("desc-arrow-right");
                $(arrowId).removeClass("desc-arrow-left");
            }
        });
    }

    function editClick(e) {
        if (!$(e).is('.input')) {
            var preval = Number($(e).text());
            $(e).addClass('input').html('<input type="number"  value="' + Number($(e).text()) + '" />')
                .find('input').focus().blur(function () {
                var tempid = e.id.split("-");
                tempid = tempid[2];
                ptDef[tempid].adjustedval = Number($(this).val());
                if (ptDef[tempid].adjustedval != preval) {
                    ptDef[tempid].masureStatus = 3;
                }

                $(this).parent().removeClass('input').html($(this).val() || preval || 0);
            });
        }
    }

    function toogle(th) {
        if (toogleFlag > 0) {
            return;
        }
        toogleFlag++;
        var ele = $(".table-sytle").find(".move");
        if (ele.attr("data-state") == "on") {
            ele.animate({left: "0"}, 300, function () {
                ele.attr("data-state", "off");
                toogleFlag++;
                if (toogleFlag == 3) {
                    toogleFlag = 0;
                }
            });
            for (var i in ptDef) {
                ptDef[i].adjustedval *= 0.3937008;  //换算成英尺
                currentUnit = unit[1];
                $("#detail-form-" + i).text(ptDef[i].adjustedval.toFixed(2));
            }
            $(".move").removeClass("on").addClass("off");
        }
        else if (ele.attr("data-state") == "off") {
            ele.animate({left: '30px'}, 300, function () {
                ele.attr("data-state", "on");
                toogleFlag++;
                if (toogleFlag == 3) {
                    toogleFlag = 0;
                }
            });
            for (var i in ptDef) {
                ptDef[i].adjustedval *= 2.54;//换算成厘米
                currentUnit = unit[0];
                $("#detail-form-" + i).text(ptDef[i].adjustedval.toFixed(2));
            }
            $(".move").removeClass("off").addClass("on");
        }
    }

//init unit's toogle to move on cm
    function initToogle() {
        var ele = $(".table-sytle").find(".move");
        if (ele.attr("data-state") == "off") {
            ele.animate({left: '30px'}, 0, function () {
                ele.attr("data-state", "on");
            });
            $(".move").removeClass("off").addClass("on");
        }
    }

//time Ascending
    function timeAscending(value1, value2) {
        if (value1.createdTime < value2.createdTime) {
            return -1;
        } else if (value1.createdTime > value2.createdTime) {
            return 1;
        } else {
            return 0;
        }
    };

//time Descending
    function timeDescending(value1, value2) {
        if (value1.createdTime < value2.createdTime) {
            return 1;
        } else if (value1.createdTime > value2.createdTime) {
            return -1;
        } else {
            return 0;
        }
    }





