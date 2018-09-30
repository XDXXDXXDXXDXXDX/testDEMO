/**
 * @file tozDraw, the module of draw outline
 * @author wei jie huang
 * @copyright Shenzhen TOZI Tech Co.
 * @createDate 2018-7-25 14:41:00
 */
'use strict';
//这个为调整界面inner-measure.html里的module
var view = angular.module('adjustment', []);

//服务 负责保存数据
view.factory('dataSrv',["$rootScope",function () {
    return {
        //可修改
        imgCont:{ },//容器id号
        retrButton:{ },//回退事件按键id号
        // promptButton:"#prompt",//提示按钮 用于开启提示点
        mRatio:0.05,//点可移动范围半径占图片高度的比例
        closeRatio:0.95,//靠近完美点的比例 当等于或大于该比例时 直接变成完美色
        radiusRatio:0.015,//圆的半径占图片高度的比例
        lineWidth:2,//线的宽度
        enLargePLCirRadius:2,//绘制PL时圆的大小比轮廓点上圆大小的倍数
        mobileTouchRatio:1,//移动端离点距离和圆的大小的倍数，用于容许移动端手指点可移动点有一定偏差值
        enLargeMRadius:2,//移动端 手指离可移动点距离跟点的可移动范围的倍数比
        minDownIndex:100,//腰线PaintLine的点y在轮廓点上移动范围的最小下标
        maxUpIndex:250,//腰线PaintLine的点y在轮廓点上移动范围的最大上标
        minMPDownIndex:50,//在轮廓上移动点同时改变PL腰线上的轮廓数组最小下标 始终保持在轮廓线上
        maxMPUpIndex:250,//在轮廓上移动点同时改变PL腰线上的轮廓数组最大上标  始终保持在轮廓线上
        bottomNum:1.5,// 线段颜色变化函数 指数函数的底数 取值范围开集（0,2）
        staticCirCol:"#000FFF",//静止时可移动点的颜色 蓝色
        moveCirCol:"rgb(255,0,0)",//移动时可移动点的颜色 红色
        setOutTime:100, //绘制图片 因为图片读取load需要时间 设定延迟100毫秒,不应为0
        cusCirCol:"rgb(50,205,50)",//自定义可移动点颜色
        MaxRetrNum:20,//最大回退次数
        promptCol:"rgb(220,220,220)",//提示点用的颜色
        lineCap:"round",//画笔线段的结束线帽
        globalAlpha:0.4,//可移动点的透明度
        pageLimit:20,//左边列表限制个数
        defImgSrc:"../public/assets/imgs/def_icon.png",//教程模式下可移动点偏离时图标src
        targetImgSrc:"../public/assets/imgs/target_icon.png",//教程模式下可移动点完美点图标src

        //不可修改
        imgDir:["f","s","b"],//照片是正还是侧面照，f为正面，s为侧面
        LineType:["free","L","R"],//PaintLine线段类型
        sign:["sys","cus"],//标识 用于区分MP可移动点是系统自带(sys)还是用户自定义的(cus)
        MPIcon:["deflection","target"],//教程模式下可移动点的icon deflection是没有靠近完美点 target是靠近完美点
        MIN_SCALE:1,//滚轮滚动放大图片最小缩小倍数 最小缩小倍率最好不要做修改（警告）
        MAX_SCALE:5,//滚轮滚动放大图片最大放大倍数
        zoomIntensity:0.2,//随鼠标滚轮缩放的灵敏度
        drawDir:[0,1,2],//绘制图片时绘制轮廓方向，在正面照中0代表左边 1代表右边 2代表PL 侧面中0代表前面 1代表后面 2代表PL
        drawDirIndex:{//根据图片的imgdir和当前要绘制的线段在图片的位置L或R 方便查找线段绘制轮廓的方向
            'f':{
                'L':0,
                'R':1
            },
            's':{
                'L':1,
                'R':0
            },
            'b':{
                'L':0,
                'R':1
            },
        },
        isDraggingCir:[false,true],//是否拖动可移动点 true为正在拖动 false为停止拖动
        Flag:[false,true],//flag数组 false未上锁 true上锁
        APIFlag:false,//避免获取数据或上传数据时触发事件
        draggingCanvas:[false,true],//是否拖动图片 点击canvas时到释放鼠标前都为true 表示正在拖动图片
        isTutorial:[false,true],//是否开启教学模式 false为否 true为开启
        overMaxRetrNum:[false,true],//是否超过最大回退次数 否为false 是为true 用于调节超过20次 最大回退到20次前的情况 表明轮廓已被调节过
        adjustImgStatus:{},//判断轮廓是否被调节过 false为未调节 true为调节过
        zoomCauseDrag:[false,true],//图片放大导致图片左右边过中间线，允许图片被拖动 false表示不允许 true表示可拖动
        hoverOnPoint:[false,true],//鼠标是否停留在可移动点上 true为在可移动点的半径内 false为不在
        showPrompt:[false,true],//显示提示点 false为隐藏 true为显示
        outsideCir:[false,true],//手指移动时，判断是否为有移动到点的移动范围外 为false表示还未移动到范围外 为true表示已移动过范围外
        MAXNUM:99999,//最大值
        testNum:/^[0-9]*$/,//数字正则表达式 测试index是否为数字 是为轮廓上的点 否为PaintLine的点
        warngCol:"rgb(255,0,0)",//线段警告的颜色 红色
        perfCol:"rgb(255,255,0)",//线段切合的颜色 黄色
    };
}]);

//服务 提供执行函数
view.factory("drawSrv",['dataSrv',function (dataSrv) {
    return{
        //对指令的par进行初始化
        newPar:function(imgDir,DrawCanvas,ImgCanvas){
            //imgDir判断照片是正还是侧面照，f为正面，s为侧面
            //DrawCanvas为绘制轮廓的canvas的id
            //ImgCanvas为绘制图片的canvas的id
            var par={
                imgDir:imgDir,//imgDir判断照片是正还是侧面照，f为正面，s为侧面

                drawCanvasJqueryId:$("#"+DrawCanvas),//绘制轮廓的canvas的id

                canvasDraw:document.getElementById(DrawCanvas),//canvasDraw 是轮廓的画布
                ctxDraw :document.getElementById(DrawCanvas).getContext('2d'),

                canvasImg : document.getElementById(ImgCanvas),//canvasImg 为底层图片的画布
                ctxImg :document.getElementById(ImgCanvas).getContext('2d'),

                //存储特殊的参数
                infPar:{
                    showPrompt:dataSrv.showPrompt[0],//是否显示提示点
                    resizeTimer: null,  //窗口调整时 用于限制调整频率
                    eventFlag:false,//缩放或拖动过程中锁定函数
                    drawFlag:false,//绘制过程中不触发新事件
                },

                //容器参数
                contPar:{
                    width : 0,//正面照canvas容器宽度
                    height : 0, //正面照canvas容器高度
                    winScaling:1,  //随窗口大小缩放比例
                },

                //图片参数
                imgPar:{
                    img : new Image(),  //正面照
                    imgx:0, //图片在canvas当前位置x
                    imgy:0,//图片在canvas当前位置y
                    imgh : 0,//图片显示高度
                    imgw : 0,//图片显示宽度
                },

                //回退事件的参数
                retrPar:{
                    retrButton:'',//回退事件id号
                    MaxRetrNum:dataSrv.MaxRetrNum,//最大回退次数
                    retrArray:new Array(),//存储之前操作的点的起始位置 便于回退
                    overMaxRetrNum:false,//是否超过最大回退次数 否为false 是为true 用于调节超过20次 最大回退到20次前的情况 表明轮廓已被调节过
                },

                //绘制轮廓点的参数
                outlinePar:{
                    lineWidth:dataSrv.lineWidth, //线的宽度
                    circles:[],//保存画布上的特征点
                    radius:10, //圆的半径
                    originalCircles:[],//保存画布上的特征点,只赋值一次后面不变，为限制点的移动范围
                    distanceBound:100,//限制点的移动范围的距离 初始化为100 后面再次赋值变成图片高度的mRatio倍
                    PaintLines:new Array(),//保存画布上paintLines
                },

                //点击事件参数
                clickEvePar:{
                    previousSelectedCircle:[],  //上次点击选择的点
                    isDraggingCir : dataSrv.isDraggingCir[0],//允许圆被拖动
                    clickX:0,//取得画布鼠标点击点位置x
                    clickY:0,//取得画布鼠标点击点位置y
                },

                //移动点时的参数
                mSelPointPar:{
                    mSelectedCircleIndex:'',//被点击选择的圆的下标
                    mSelectedPointDownIndex:0,  //下标低于选中点的下标的点
                    mSelectedPointUpIndex:0,  //下标高于选中点的下标的点
                    mSelectedPointIndex:0, //被选中点的下标
                },

                //图片缩放的参数
                zoomImg:{
                    MIN_SCALE :dataSrv.MIN_SCALE, //最小缩放比例为1
                    MAX_SCALE : dataSrv.MAX_SCALE,//最大缩放比例为5
                    imgScaling : dataSrv.MIN_SCALE, //图片当前缩放比例
                    zoom :1, //每次滚动时缩放比例
                    bfScalingimgx:0, //图片在每一次缩放前起始位置x
                    bfScalingimgy:0,//图片在每一次缩放前起始位置y
                    zoomIntensity : dataSrv.zoomIntensity, //随鼠标滚轮缩放的灵敏度
                    offsetX : 0, //鼠标在canvas位置x
                    offsetY :0,//鼠标在canvas位置y
                },

                //拖动图片的参数
                dgImgPar:{
                    zoomCauseDrag:dataSrv.zoomCauseDrag[0],//图片放大导致图片左右边过中间线，允许图片被拖动 false表示不允许 true表示可拖动
                    draggingCanvas :dataSrv.draggingCanvas[0], //是否拖动图片
                    preimgx : 0,//图片在拖动时的起始位置x
                    preimgy : 0,//图片在拖动时的起始位置y
                    preOffsetx : 0,//图片拖动开始前鼠标点击的位置x
                    preOffsety : 0,//图片拖动开始前鼠标点击的位置y
                    draggingCanvasScale : 1,//当拖动图片时图片缩放比例
                },

                //增删可移动点
                addDelMPPar:{
                    hoverPointSign:'',//鼠标停留在可移动点是否为sys 或cus
                    delCirIndex:-1,//要删除的点的下标
                },

                //API参数 判断是否显示悬浮窗
                APIPar:{
                    hoverOnPoint : dataSrv.hoverOnPoint[0],//鼠标是否停留在可移动点上 true为在可移动点的半径内 false为不在
                    firstColorArray : new Array(),//轮廓线线段颜色 正面照 firstColorArray为左边线段
                    secondColorArray : new Array(),//轮廓线线段颜色 正面照 secondColorArray为右边线段
                    PaintLines_target: new Array(),//保存画布上正面照PL完美点 教程用
                    iconArray:new Array(),//保存可移动点的icon
                    PaintLines_iconArray:new Array(),//保存可移动点PL的icon
                },

                //移动端参量
                mobilePar:{
                    gestureScale:1,//移动端双指缩放比例
                    outsideCir:dataSrv.outsideCir[0],//手指移动时，判断是否为有移动到点的移动范围外 为false表示还未移动到范围外 为true表示已移动过范围外
                },
            };
            return par;
        },

        //预处理 为canvas绑定事件和启动教程模式的初始化
        pretreatment:function(Par){
            var _that=this;

            dataSrv.adjustImgStatus[Par.imgDir]=false; //轮廓未调整过

            Par.imgPar.img.src=dataSrv.data.url[Par.imgDir];//图片base64
            Par.retrPar.retrButton=dataSrv.retrButton[Par.imgDir];//回退事件id号
            Par.mobilePar.gestureScale=1;//移动端双指缩放比例
            Par.retrPar.retrArray = new Array();//存储之前操作的点的起始位置 便于回退
            Par.infPar.resizeTimer = null;  //窗口调整时 用于限制调整频率

            if(dataSrv.data.isTutorial===dataSrv.isTutorial[1]) {//开启教程模式
                _that.tutorialMode(Par);
            }

            _that.middleTier(Par);//中间层 绑定所有操作
        },

        //开启教程模式，对数据进行预处理
        tutorialMode:function(Par){
            var _that=this;
            var pts=dataSrv.data.pts[Par.imgDir];//轮廓数组
            var pts_tg=dataSrv.originalData.ptsTarget[Par.imgDir];//完美轮廓数组
            var tempHeight = $(dataSrv.imgCont[Par.imgDir]).height();//获取容器高度

            var pts_index= 0;//当前pts的二级下标 例如等于0时 获取pst[i][0] 和pts[i][1] 即x、y坐标； 等于2时则获取pst[i][2] 和pts[i][3]
            //根据 每一条线段两端点离完美点的距离之和的一半/可移动点的允许移动距离的值 的比例决定线段颜色
            for (var i = 0; i < pts.length - 1; i++) {
                var firDv = Math.sqrt(Math.pow((pts[i][pts_index] - pts_tg[i][pts_index]), 2) +
                    Math.pow((pts[i][pts_index + 1] - pts_tg[i][pts_index + 1]), 2));
                var secDv = Math.sqrt(Math.pow((pts[i + 1][pts_index] - pts_tg[i + 1][pts_index]), 2) +
                    Math.pow((pts[i + 1][pts_index + 1] - pts_tg[i + 1][pts_index + 1]), 2));
                Par.APIPar.firstColorArray.push({
                    index: i,
                    rgb: _that.dist2Rgb(1 - (firDv + secDv) / (2 * tempHeight * dataSrv.mRatio)),
                });
            };

            pts_index = 2;
            //根据 每一条线段两端点离完美点的距离之和的一半/可移动点的允许移动距离的值 的比例决定线段颜色
            for (var i = 0; i < pts.length - 1; i++) {
                var firDv = Math.sqrt(Math.pow((pts[i][pts_index] - pts_tg[i][pts_index]), 2) +
                    Math.pow((pts[i][pts_index + 1] - pts_tg[i][pts_index + 1]), 2));
                var secDv = Math.sqrt(Math.pow((pts[i + 1][pts_index] - pts_tg[i + 1][pts_index]), 2) +
                    Math.pow((pts[i + 1][pts_index + 1] - pts_tg[i + 1][pts_index + 1]), 2));
                Par.APIPar.secondColorArray.push({
                    index: i,
                    rgb: _that.dist2Rgb(1 - (firDv + secDv) / (2 * tempHeight * dataSrv.mRatio)),
                });
            };

            //教程模式下开启提示点
            $(dataSrv.promptButton).click(function () {
                if (Par.infPar.showPrompt === dataSrv.showPrompt[0]) {
                    Par.infPar.showPrompt = dataSrv.showPrompt[1];//开启显示提示点
                } else {
                    Par.infPar.showPrompt = dataSrv.showPrompt[0];//关闭显示提示点
                }
                _that.drawCirLine(Par);
            });
        },

        //中间层 绑定所有操作
        middleTier:function(Par){
            var _that=this;
            //点击回退按钮 回退
            $(Par.retrPar.retrButton).click(function () {
                _that.doRetroversion(Par);
            });

            //禁止文本选择
            Par.canvasDraw.onselectstart=function () {
                return false;
            };

            //双击可移动点 判断是否是sys还是cus 如果是cus则删除该点； 双击轮廓线附近，添加一个cus的可移动点
            Par.canvasDraw.ondblclick=function (e) {
                _that.addDelMP(e,Par);
            };

            $(window).bind('resize', function (){
                if (Par.infPar.resizeTimer) clearTimeout(Par.infPar.resizeTimer);
                Par.infPar.resizeTimer = setTimeout(function(){
                    if(Par.infPar.eventFlag===dataSrv.Flag[0]&&Par.infPar.drawFlag===dataSrv.Flag[0]&&dataSrv.APIFlag==dataSrv.Flag[0]){
                        _that.resizeInit(Par);
                        _that.draw(Par);
                    }
                } , 150);
            });

            //判断是为pc端还是移动端
            if(_that.isPc()){
                // pc端
                Par.canvasDraw.onmousedown = function(e){
                    // 判断是否点击到可移动点 如果是 则允许拖动可移动点
                    // 否则是允许拖动图片
                    _that.canvasClick(e,Par);
                };
                Par.canvasDraw.onmousemove = function (e){
                    // 判断是拖动可移动点还是拖动图片 再运行相应的操作
                    _that.dragging(e,Par);
                };
                Par.canvasDraw.onmouseup =function(e){
                    //停止拖动并绘制轮廓
                    _that.stopDragging(e,Par);
                } ;

                Par.canvasDraw.onmouseout = function (e){
                    //停止拖动并绘制轮廓
                    _that.stopDragging(e,Par);
                };

                Par.canvasDraw.onmousewheel =function(e){
                    // 滚轮滚动，对图片和轮廓进行缩放
                    _that.scaleImg(e,Par);
                };

                // 滚轮滚动，对图片和轮廓进行缩放 兼容火狐
                if(document.addEventListener){
                    Par.canvasDraw.addEventListener('DOMMouseScroll',function (e){
                        _that.scaleImg(e,Par);
                    },false)
                };
            }
            else{
                //移动端
                _that.setGesture(Par);
            }
        },

        //对数据进行初始化
        init:function (Par) {
            if(Par.infPar.eventFlag===dataSrv.Flag[0]&&Par.infPar.drawFlag===dataSrv.Flag[0]&&dataSrv.APIFlag==dataSrv.Flag[0]) {
                Par.infPar.eventFlag = dataSrv.Flag[1];//加锁
                //初始化可移动点
                var _that = this;
                var firMP=dataSrv.data.MP[Par.imgDir][0];//可移动点数组 正面为左边 侧面为正面
                var secMP=dataSrv.data.MP[Par.imgDir][1];//可移动点数组 正面为右边 侧面为背面
                var pts = dataSrv.data.pts[Par.imgDir]; //轮廓点数组
                var pts_orig; //轮廓点数组,初始值

                var imgWidth= dataSrv.data.imgSize[Par.imgDir][0];//图片宽度
                var imgHeight= dataSrv.data.imgSize[Par.imgDir][1];//图片高度
                if (dataSrv.data.isTutorial === dataSrv.isTutorial[1]) {//教程模式
                    pts_orig = dataSrv.originalData.ptsTarget[Par.imgDir];
                } else {
                    pts_orig = dataSrv.originalData.pts[Par.imgDir];;
                }

                //清理画布
                Par.ctxDraw.clearRect(0, 0, Par.canvasDraw.width, Par.canvasDraw.height);
                Par.ctxImg.clearRect(0, 0, Par.canvasImg.width, Par.canvasImg.height);

                Par.infPar = {
                    showPrompt: dataSrv.showPrompt[0],//是否显示提示点
                    resizeTimer: null,  //窗口调整时 用于限制调整频率
                    eventFlag: dataSrv.Flag[1],//缩放或拖动过程中锁定函数
                    drawFlag: false,//锁定绘制过程中不触发新事件
                };

                //点击事件参数
                Par.clickEvePar = {
                    previousSelectedCircle: [],  //上次点击选择的点
                    isDraggingCir: dataSrv.isDraggingCir[0],//允许圆被拖动
                    clickX: 0,//取得画布鼠标点击点位置x
                    clickY: 0,//取得画布鼠标点击点位置y
                };

                //移动点时的参数
                Par.mSelPointPar = {
                    mSelectedCircleIndex: '',//被点击选择的圆的下标
                    mSelectedPointDownIndex: 0,  //下标低于选中点的下标的点
                    mSelectedPointUpIndex: 0,  //下标高于选中点的下标的点
                    mSelectedPointIndex: 0, //被选中点的下标
                };

                //图片缩放的参数
                Par.zoomImg = {
                    MIN_SCALE: dataSrv.MIN_SCALE, //最小缩放比例为1
                    MAX_SCALE: dataSrv.MAX_SCALE,//最大缩放比例为5
                    imgScaling: dataSrv.MIN_SCALE, //图片当前缩放比例
                    zoom: 1, //每次滚动时缩放比例
                    bfScalingimgx: 0, //图片在每一次缩放前起始位置x
                    bfScalingimgy: 0,//图片在每一次缩放前起始位置y
                    zoomIntensity: dataSrv.zoomIntensity, //随鼠标滚轮缩放的灵敏度
                    offsetX: 0, //鼠标在canvas位置x
                    offsetY: 0,//鼠标在canvas位置y
                };

                //增删可移动点
                Par.addDelMPPar = {
                    hoverPointSign: '',//鼠标停留在可移动点是否为sys 或cus
                    delCirIndex: -1,//要删除的点的下标
                };

                //将图片和canvas大小匹配 width为imgf视图所分配的宽度，height为imgf视图所分配的高度
                Par.contPar={
                    width : $(dataSrv.imgCont[Par.imgDir]).width(),//正面照canvas容器宽度
                    height : $(dataSrv.imgCont[Par.imgDir]).height(), //正面照canvas容器高度
                    winScaling: $(dataSrv.imgCont[Par.imgDir]).height()/ imgHeight,  //winScaling 按比例缩放图片与imgf视图大小相匹配
                };

                //设置canvas容器大小
                Par.canvasDraw.width = Par.contPar.width;
                Par.canvasDraw.height = Par.contPar.height;
                Par.canvasImg.width = Par.contPar.width;
                Par.canvasImg.height = Par.contPar.height;

                //imgh imgw为按比例缩放的图片高度，宽度
                Par.imgPar.imgh = Par.contPar.height;
                Par.imgPar.imgw = imgWidth * Par.contPar.height / imgHeight;
                Par.imgPar.imgx = (Par.contPar.width - Par.imgPar.imgw) / 2; //图片在canvas起始位置x
                Par.imgPar.imgy = 0;//图片在canvas起始位置y

                //拖动图片的参数
                Par.dgImgPar = {
                    zoomCauseDrag: dataSrv.zoomCauseDrag[0],//图片放大导致图片左右边过中间线，允许图片被拖动 false表示不允许 true表示可拖动
                    draggingCanvas: dataSrv.draggingCanvas[0], //是否拖动图片
                    preimgx: Par.imgPar.imgx,//图片在拖动时的起始位置x
                    preimgy: Par.imgPar.imgy,//图片在拖动时的起始位置y
                    preOffsetx: 0,//图片拖动开始前鼠标点击的位置x
                    preOffsety: 0,//图片拖动开始前鼠标点击的位置y
                    draggingCanvasScale: dataSrv.MIN_SCALE,//当拖动图片时图片缩放比例
                };

                //移动点的参数
                Par.outlinePar = {
                    lineWidth: dataSrv.lineWidth, //线的宽度
                    circles: [],//保存画布上的特征点
                    radius: Par.contPar.height * dataSrv.radiusRatio, //圆的半径
                    originalCircles: [],//保存画布上的特征点,只赋值一次后面不变，为限制点的移动范围
                    distanceBound: Par.contPar.height * dataSrv.mRatio,//限制点的移动范围的距离 赋值变成图片高度的5%
                    PaintLines: new Array(),//保存画布上paintLines
                };
                //API参数 判断是否显示悬浮窗
                Par.APIPar={
                    hoverOnPoint : dataSrv.hoverOnPoint[0],//鼠标是否停留在可移动点上 true为在可移动点的半径内 false为不在
                    firstColorArray : new Array(),//轮廓线线段颜色 正面照 firstColorArray为左边线段
                    secondColorArray : new Array(),//轮廓线线段颜色 正面照 secondColorArray为右边线段
                    PaintLines_target: new Array(),//保存画布上正面照PL完美点 教程用
                    iconArray:new Array(),//保存可移动点的icon
                    PaintLines_iconArray:new Array(),//保存可移动点PL的icon
                };

                var sign;//判断是否为sys 还是自定义cus
                for (var i = 0; i < firMP.length; i++) {
                    var index = firMP[i].index;
                    if (firMP[i].sign === dataSrv.sign[0]) {
                        sign = dataSrv.sign[0];
                    } else {
                        sign = dataSrv.sign[1];
                    };
                    var circle =  _that.createcircle(pts[index][0] * Par.contPar.winScaling + Par.imgPar.imgx, pts[index][1] * Par.contPar.winScaling, sign);
                    var originalCircle =  _that.createcircle(pts_orig[index][0] * Par.contPar.winScaling + Par.imgPar.imgx, pts_orig[index][1] * Par.contPar.winScaling, sign);
                    Par.outlinePar.circles.push(circle);
                    Par.outlinePar.originalCircles.push(originalCircle);
                };
                for (var i = 0; i < secMP.length; i++) {
                    var index = secMP[i].index;
                    if (secMP[i].sign === dataSrv.sign[0]) {
                        sign = dataSrv.sign[0];
                    } else {
                        sign = dataSrv.sign[1];
                    };
                    var circle =  _that.createcircle(pts[index][2] * Par.contPar.winScaling + Par.imgPar.imgx, pts[index][3] * Par.contPar.winScaling, sign);
                    var originalCircle =  _that.createcircle(pts_orig[index][2] * Par.contPar.winScaling + Par.imgPar.imgx, pts_orig[index][3] * Par.contPar.winScaling, sign);
                    Par.outlinePar.circles.push(circle);
                    Par.outlinePar.originalCircles.push(originalCircle);
                };

                //获得paintLines 并存入Par.outlinePar.PaintLines中
                angular.forEach(dataSrv.data.PaintLines, function (value) {
                    if (value.ImgDir === Par.imgDir) {
                        if (value.LineType != dataSrv.LineType[0]) {//点类型不是free类型
                            var drawDir=dataSrv.drawDirIndex[Par.imgDir][value.LineType];//判断要绘制的方向是图片左还是右

                            if (value.LineType === dataSrv.LineType[1]) {
                                var pointOnLinex = _that.findPointOnOutline(value.StartPt.Y * Par.contPar.winScaling, drawDir, Par);
                                var StartPt =  _that.createcircle(pointOnLinex + Par.imgPar.imgx, value.StartPt.Y * Par.contPar.winScaling, dataSrv.sign[0]);
                                var EndPt =  _that.createcircle(Par.imgPar.imgx, value.EndPt.Y * Par.contPar.winScaling, dataSrv.sign[0]);
                            }
                            else if (value.LineType === dataSrv.LineType[2]) {
                                var pointOnLinex = _that.findPointOnOutline(value.StartPt.Y * Par.contPar.winScaling, drawDir, Par);
                                var StartPt =  _that.createcircle(pointOnLinex + Par.imgPar.imgx, value.StartPt.Y * Par.contPar.winScaling, dataSrv.sign[0]);
                                var EndPt =  _that.createcircle(imgWidth * Par.contPar.winScaling + Par.imgPar.imgx, value.EndPt.Y * Par.contPar.winScaling, dataSrv.sign[0]);
                            };

                            Par.outlinePar.PaintLines.push({
                                StartPt: StartPt,
                                EndPt: EndPt,
                                ImgDir: value.ImgDir,
                                LineName: value.LineName,
                                LineType: value.LineType,
                            });
                        } else if (value.LineType === dataSrv.LineType[0]) {//点类型是free类型
                            var StartPt =  _that.createcircle(value.StartPt.X * Par.contPar.winScaling + Par.imgPar.imgx, value.StartPt.Y * Par.contPar.winScaling, dataSrv.sign[0]);
                            var EndPt =  _that.createcircle(value.EndPt.X * Par.contPar.winScaling + Par.imgPar.imgx, value.EndPt.Y * Par.contPar.winScaling, dataSrv.sign[0]);
                            Par.outlinePar.PaintLines.push({
                                StartPt: StartPt,
                                EndPt: EndPt,
                                ImgDir: value.ImgDir,
                                LineName: value.LineName,
                                LineType: value.LineType,
                            });
                        }
                    }
                });

                //平移pts 使轮廓居中于div
                for (var i = 0; i < dataSrv.data.pts[Par.imgDir].length; i++) {
                    dataSrv.data.pts[Par.imgDir][i][0] += Par.imgPar.imgx / Par.contPar.winScaling;
                    dataSrv.data.pts[Par.imgDir][i][2] += Par.imgPar.imgx / Par.contPar.winScaling;
                }

                if (dataSrv.data.isTutorial === dataSrv.isTutorial[1]) {//教程模式
                    // 获取教程模式下PaintLines_target完美点，并存到Par.APIPar.PaintLines_target里
                    angular.forEach(dataSrv.data.PaintLines_target, function (value) {
                        if (value.ImgDir === Par.imgDir) {
                            if (value.LineType === dataSrv.LineType[0]) {
                                var StartPt =  _that.createcircle(value.StartPt.X, value.StartPt.Y, dataSrv.sign[0]);
                                var EndPt =  _that.createcircle(value.EndPt.X, value.EndPt.Y, dataSrv.sign[0]);
                            } else {
                                var StartPt =  _that.createcircle(imgWidth, value.EndPt.Y, dataSrv.sign[0]);
                                var EndPt =  _that.createcircle(imgWidth, value.EndPt.Y, dataSrv.sign[0]);
                            }

                            Par.APIPar.PaintLines_target.push({
                                StartPt: StartPt,
                                EndPt: EndPt,
                                ImgDir: value.ImgDir,
                                LineName: value.LineName,
                                LineType: value.LineType,
                                rgb: dataSrv.warngCol,
                            });
                        };
                    });
                    //设置PaintLines线段的颜色
                    angular.forEach(Par.outlinePar.PaintLines, function (line, index) {
                        angular.forEach(Par.APIPar.PaintLines_target, function (line_tg, index_tg) {
                            if (line.LineName === line_tg.LineName) {
                                var dgingPoTut = {
                                    dir: dataSrv.drawDir[2],
                                    index: line.LineName,
                                    x: line.EndPt.x,
                                    y: line.EndPt.y
                                };
                                _that.setRgb(dgingPoTut, Par.APIPar.PaintLines_target[index_tg], Par);
                            }
                            ;
                        });
                    });
                };

                Par.infPar.eventFlag = dataSrv.Flag[0];//解锁
            }
        },

        //窗口调整初始化 先将当前的轮廓点恢复到一比一比例保存再初始化和绘制
        resizeInit:function (Par) {
            if(Par.infPar.eventFlag===dataSrv.Flag[0]&&Par.infPar.drawFlag===dataSrv.Flag[0]&&dataSrv.APIFlag==dataSrv.Flag[0]) {
                Par.infPar.eventFlag=dataSrv.Flag[1];//加锁
                var _that=this;
                var tempProduct = Par.contPar.winScaling * Par.zoomImg.imgScaling;
                var pts = dataSrv.data.pts[Par.imgDir];

                //在init前将把当前的pts变回1:1的比例
                for (var i = 0; i < pts.length; i++) {
                    pts[i][0] = (pts[i][0] * Par.contPar.winScaling - Par.imgPar.imgx) / tempProduct;
                    pts[i][1] = (pts[i][1] * Par.contPar.winScaling - Par.imgPar.imgy) / tempProduct;
                    pts[i][2] = (pts[i][2] * Par.contPar.winScaling - Par.imgPar.imgx) / tempProduct;
                    pts[i][3] = (pts[i][3] * Par.contPar.winScaling - Par.imgPar.imgy) / tempProduct;
                };
                //在init前将当前的PaintLines变回1:1的比例
                angular.forEach(dataSrv.data.PaintLines, function (line, index) {
                    if (line.ImgDir === Par.imgDir) {
                        angular.forEach(Par.outlinePar.PaintLines, function (pLine, oLIndex) {
                            if (line.LineName === pLine.LineName) {
                                dataSrv.data.PaintLines[index].StartPt.X = (pLine.StartPt.x - Par.imgPar.imgx) / tempProduct;
                                dataSrv.data.PaintLines[index].StartPt.Y = (pLine.StartPt.y - Par.imgPar.imgy) / tempProduct;
                                dataSrv.data.PaintLines[index].EndPt.X = (pLine.EndPt.x - Par.imgPar.imgx) / tempProduct;
                                dataSrv.data.PaintLines[index].EndPt.Y = (pLine.EndPt.y - Par.imgPar.imgy) / tempProduct;
                            }
                        });
                    }
                });
                Par.infPar.eventFlag=dataSrv.Flag[0];//解锁
                _that.init(Par);
            }
        },

        //绘制入口
        draw:function (Par){
            var _that=this;
            //绘制图片
            _that.drawImage(Par);
            //绘制轮廓和可移动点
            _that.drawCirLine(Par);
        },

        //绘制图片
        drawImage:function(Par){
            var imgWidth=dataSrv.data.imgSize[Par.imgDir][0];
            var imgHeight=dataSrv.data.imgSize[Par.imgDir][1];

            //绘制图片 因为图片读取load需要时间 设定延迟
            setTimeout(function () {
                Par.ctxImg.drawImage(Par.imgPar.img,0,0,imgWidth,imgHeight,Par.imgPar.imgx,Par.imgPar.imgy,Par.imgPar.imgw,Par.imgPar.imgh);
            },dataSrv.setOutTime);
        },

        //绘制轮廓和可移动点
        drawCirLine:function(Par,dgingPoTut){
            //dgingPoTut 为教程模式下拖动的可移动点的数据
            // dgingPoTut={
            //    dir:number,在正面中 0代表左边 1代表右边 侧面中0前 1后 背面同正面
            //    index:number，该点在线段上的下标
            // }
            if(Par.infPar.drawFlag===dataSrv.Flag[0]){
                Par.infPar.drawFlag=dataSrv.Flag[1];//加锁

                var _that=this;

                //绘制线段
                _that.drawLines(Par,dgingPoTut);

                //绘制可移动点
                _that.drawCircles(Par);
                Par.infPar.drawFlag=dataSrv.Flag[0];
            }

        },

        //绘制可移动点
        drawCircles:function(Par){
            var _that=this;
            Par.ctxDraw.strokeStyle=dataSrv.staticCirCol;
            Par.ctxDraw.fillStyle=dataSrv.staticCirCol;
            Par.ctxDraw.globalAlpha=dataSrv.globalAlpha;
            //绘制可移动点
            if(Par.clickEvePar.isDraggingCir===dataSrv.isDraggingCir[1]){
                //拖动点时，仅绘制拖动点
                Par.ctxDraw.fillStyle=dataSrv.moveCirCol;//红色
                var testNum=dataSrv.testNum;//验证index是否为数字 否为PL上的点 是为轮廓上的点
                if(!testNum.test(Par.mSelPointPar.mSelectedCircleIndex)) {
                    angular.forEach(Par.outlinePar.PaintLines,function (line) {
                        var selCirIndex=Par.mSelPointPar.mSelectedCircleIndex.split("-");//为了区分点击PL里手臂线起始点还是终止点
                        if(selCirIndex[0]===line.LineName){
                            if(line.LineType!=dataSrv.LineType[0]){
                                Par.ctxDraw.beginPath();
                                Par.ctxDraw.arc(line.EndPt.x,line.EndPt.y,Par.outlinePar.radius*dataSrv.enLargePLCirRadius,0,Math.PI*2);
                                Par.ctxDraw.fill();
                            }else{
                                //要区分start还是end
                                if(selCirIndex[1]==="S"){
                                    Par.ctxDraw.beginPath();
                                    Par.ctxDraw.arc(line.StartPt.x,line.StartPt.y,Par.outlinePar.radius,0,Math.PI*2);
                                    Par.ctxDraw.fill();
                                }else if(selCirIndex[1]==="E"){
                                    Par.ctxDraw.beginPath();
                                    Par.ctxDraw.arc(line.EndPt.x,line.EndPt.y,Par.outlinePar.radius,0,Math.PI*2);
                                    Par.ctxDraw.fill();
                                }
                            }
                        }
                    });
                }
                else{
                    Par.ctxDraw.beginPath();
                    Par.ctxDraw.arc(Par.outlinePar.circles[Par.mSelPointPar.mSelectedCircleIndex].x,Par.outlinePar.circles[Par.mSelPointPar.mSelectedCircleIndex].y,Par.outlinePar.radius,0,Math.PI*2);
                    Par.ctxDraw.fill();
                };
                Par.ctxDraw.fillStyle=dataSrv.staticCirCol;
            }
            else{
                //没有拖动点时，绘制全部可移动点
                if(dataSrv.data.isTutorial===dataSrv.isTutorial[1]){//教程模式
                    _that.setMPIcon(Par);
                    Par.ctxDraw.globalAlpha =dataSrv.globalAlpha;
                    angular.forEach(Par.outlinePar.PaintLines,function (line) {
                        if(line.LineType!=dataSrv.LineType[0]){
                            angular.forEach(Par.APIPar.PaintLines_iconArray,function (line_icon) {
                                var lineName=line_icon.LineName.split("-");
                                if (lineName[0]===line.LineName){
                                    var tempRadius=Par.outlinePar.radius*dataSrv.enLargePLCirRadius;
                                    if(line_icon.icon===dataSrv.MPIcon[0]){
                                        Par.ctxDraw.drawImage(dataSrv.defImg,0,0,dataSrv.defImg.width,dataSrv.defImg.height,line.EndPt.x-tempRadius,line.EndPt.y-tempRadius,2*tempRadius,2*tempRadius);
                                    }else{
                                        Par.ctxDraw.drawImage(dataSrv.targetImg,0,0,dataSrv.targetImg.width,dataSrv.targetImg.height,line.EndPt.x-tempRadius,line.EndPt.y-tempRadius,2*tempRadius,2*tempRadius);
                                    }
                                }
                            });
                        }else if(line.LineType===dataSrv.LineType[0]){
                            angular.forEach(Par.APIPar.PaintLines_iconArray,function (line_icon) {
                                var lineName=line_icon.LineName.split("-");
                                if (lineName[0]===line.LineName){
                                    var tempRadius=Par.outlinePar.radius;
                                    if(lineName[1]==="S"){
                                        if(line_icon.icon===dataSrv.MPIcon[0]){
                                            Par.ctxDraw.drawImage(dataSrv.defImg,0,0,dataSrv.defImg.width,dataSrv.defImg.height,line.StartPt.x-tempRadius,line.StartPt.y-tempRadius,2*tempRadius,2*tempRadius);
                                        }
                                        else{
                                            Par.ctxDraw.drawImage(dataSrv.targetImg,0,0,dataSrv.targetImg.width,dataSrv.targetImg.height,line.StartPt.x-tempRadius,line.StartPt.y-tempRadius,2*tempRadius,2*tempRadius);
                                        }
                                    }
                                    else if(lineName[1]==="E"){
                                        if(line_icon.icon===dataSrv.MPIcon[0]){
                                            Par.ctxDraw.drawImage(dataSrv.defImg,0,0,dataSrv.defImg.width,dataSrv.defImg.height,line.EndPt.x-tempRadius,line.EndPt.y-tempRadius,2*tempRadius,2*tempRadius);
                                        }
                                        else{
                                            Par.ctxDraw.drawImage(dataSrv.targetImg,0,0,dataSrv.targetImg.width,dataSrv.targetImg.height,line.EndPt.x-tempRadius,line.EndPt.y-tempRadius,2*tempRadius,2*tempRadius);
                                        }
                                    }

                                }
                            });
                        };
                    });
                    for(var i=0;i<Par.outlinePar.circles.length;i++){
                        var circle = Par.outlinePar.circles[i];
                        if(Par.APIPar.iconArray[i]===dataSrv.MPIcon[0]){
                            Par.ctxDraw.drawImage(dataSrv.defImg,0,0,dataSrv.defImg.width,dataSrv.defImg.height,circle.x-Par.outlinePar.radius,circle.y-Par.outlinePar.radius,2*Par.outlinePar.radius,2*Par.outlinePar.radius);
                        }else{
                            Par.ctxDraw.drawImage(dataSrv.targetImg,0,0,dataSrv.targetImg.width,dataSrv.targetImg.height,circle.x-Par.outlinePar.radius,circle.y-Par.outlinePar.radius,2*Par.outlinePar.radius,2*Par.outlinePar.radius);
                        };
                    };
                }
                else{
                    angular.forEach(Par.outlinePar.PaintLines,function (line) {
                        if(line.LineType!=dataSrv.LineType[0]){
                            Par.ctxDraw.beginPath();
                            Par.ctxDraw.arc(line.EndPt.x,line.EndPt.y,Par.outlinePar.radius*dataSrv.enLargePLCirRadius,0,Math.PI*2);
                            Par.ctxDraw.fill();
                        }else if(line.LineType===dataSrv.LineType[0]){
                            Par.ctxDraw.beginPath();
                            Par.ctxDraw.arc(line.StartPt.x,line.StartPt.y,Par.outlinePar.radius,0,Math.PI*2);
                            Par.ctxDraw.fill();

                            Par.ctxDraw.beginPath();
                            Par.ctxDraw.arc(line.EndPt.x,line.EndPt.y,Par.outlinePar.radius,0,Math.PI*2);
                            Par.ctxDraw.fill();
                        };
                    });
                    for(var i=0;i<Par.outlinePar.circles.length;i++){
                        var circle = Par.outlinePar.circles[i];
                        if(circle.sign===dataSrv.sign[0]){
                            Par.ctxDraw.fillStyle=dataSrv.staticCirCol;
                        }else{
                            Par.ctxDraw.fillStyle=dataSrv.cusCirCol;
                        }
                        Par.ctxDraw.beginPath();
                        Par.ctxDraw.arc(circle.x,circle.y,Par.outlinePar.radius,0,Math.PI*2);
                        Par.ctxDraw.fill();
                    };
                }
            };

            //在教程模式下点击提示按钮 展示提示点
            if(dataSrv.data.isTutorial===dataSrv.isTutorial[1]) {
                if(Par.infPar.showPrompt===dataSrv.showPrompt[1]){
                    var firMP=dataSrv.data.MP[Par.imgDir][0];
                    var secMP=dataSrv.data.MP[Par.imgDir][1];
                    var pts=dataSrv.data.ptsTarget[Par.imgDir];
                    var tempProduct=Par.contPar.winScaling*Par.zoomImg.imgScaling;
                    Par.ctxDraw.fillStyle=dataSrv.promptCol;

                    angular.forEach(Par.APIPar.PaintLines_target,function (line) {
                        if(line.LineType!=dataSrv.LineType[0]){
                            Par.ctxDraw.beginPath();
                            if(line.LineType===dataSrv.LineType[1]){
                                Par.ctxDraw.arc(Par.imgPar.imgx,line.EndPt.y*tempProduct+Par.imgPar.imgy,Par.outlinePar.radius*dataSrv.enLargePLCirRadius,0,Math.PI*2);
                            }else  if(line.LineType===dataSrv.LineType[2]){
                                Par.ctxDraw.arc(Par.imgPar.imgx+Par.imgPar.imgw*Par.zoomImg.imgScaling,line.EndPt.y*tempProduct+Par.imgPar.imgy,Par.outlinePar.radius*dataSrv.enLargePLCirRadius,0,Math.PI*2);
                            }

                            Par.ctxDraw.fill();
                        }else if(line.LineType===dataSrv.LineType[0]){
                            Par.ctxDraw.beginPath();
                            Par.ctxDraw.arc(line.StartPt.x*tempProduct+Par.imgPar.imgx,line.StartPt.y*tempProduct+Par.imgPar.imgy,Par.outlinePar.radius,0,Math.PI*2);
                            Par.ctxDraw.fill();

                            Par.ctxDraw.beginPath();
                            Par.ctxDraw.arc(line.EndPt.x*tempProduct+Par.imgPar.imgx,line.EndPt.y*tempProduct+Par.imgPar.imgy,Par.outlinePar.radius,0,Math.PI*2);
                            Par.ctxDraw.fill();
                        };
                    });

                    for(var i=0;i<firMP.length;i++){
                        var index=firMP[i].index;
                        Par.ctxDraw.beginPath();
                        Par.ctxDraw.arc((pts[index][0])*tempProduct+Par.imgPar.imgx,(pts[index][1])*tempProduct+Par.imgPar.imgy,Par.outlinePar.radius,0,Math.PI*2);
                        Par.ctxDraw.fill();
                    };
                    for(var i=0;i<secMP.length;i++){
                        var index=secMP[i].index;
                        Par.ctxDraw.beginPath();
                        Par.ctxDraw.arc((pts[index][2])*tempProduct+Par.imgPar.imgx,(pts[index][3])*tempProduct+Par.imgPar.imgy,Par.outlinePar.radius,0,Math.PI*2);
                        Par.ctxDraw.fill();
                    };
                    Par.ctxDraw.fillStyle=dataSrv.staticCirCol;
                };
            };
        },

        //绘制全部线段
        drawLines:function(Par,dgingPoTut){
            var _that=this;
            Par.ctxDraw.clearRect(0,0,Par.canvasDraw.width,Par.canvasDraw.height);
            Par.ctxDraw.strokeStyle=dataSrv.perfCol;
            Par.ctxDraw.lineWidth=Par.outlinePar.lineWidth;
            Par.ctxDraw.globalAlpha=1;
            //绘制线段
            if(dataSrv.data.isTutorial===dataSrv.isTutorial[0]||!(dgingPoTut!=''&&dgingPoTut!=undefined&&dgingPoTut!=null)) {
                _that.drawLine(dataSrv.LineType[1],Par); //绘制图片左边线段
                _that.drawLine(dataSrv.LineType[2],Par); //绘制图片右边线段
            }
            else{//教学模式下，根据拖动点的拖动距离来改变该点附近的线段颜色
                if(dgingPoTut.dir===0){//移动的点在轮廓左边
                    _that.setRgb(dgingPoTut,Par.APIPar.firstColorArray,Par);//改变线段rgb颜色

                    _that.drawLine(dataSrv.LineType[1],Par);//绘制图片左边线段
                    _that.drawLine(dataSrv.LineType[2],Par); //绘制图片右边线段
                }
                else if(dgingPoTut.dir===1){//移动的点在轮廓右边
                    _that.setRgb(dgingPoTut,Par.APIPar.secondColorArray,Par);//改变线段rgb颜色

                    _that.drawLine(dataSrv.LineType[1],Par);//绘制图片左边线段
                    _that.drawLine(dataSrv.LineType[2],Par); //绘制图片右边线段
                }else{//移动的点在PL 腰线部分
                    _that.drawLine(dataSrv.LineType[1],Par); //绘制图片左边线段
                    _that.drawLine(dataSrv.LineType[2],Par); //绘制图片右边线段
                    var SelMPIndex=dgingPoTut.index.split("-");
                    angular.forEach(Par.APIPar.PaintLines_target,function (line,index) {
                        if(line.LineName===SelMPIndex[0]){
                            _that.setRgb(dgingPoTut,Par.APIPar.PaintLines_target[index],Par);
                        };
                    });
                };
            };

            Par.ctxDraw.strokeStyle=dataSrv.perfCol;
            Par.ctxDraw.lineCap=dataSrv.lineCap;
            //绘制腰线
            angular.forEach(Par.outlinePar.PaintLines,function (line) {
                if(dataSrv.data.isTutorial===dataSrv.isTutorial[0]){//标准模式
                    Par.ctxDraw.beginPath();
                    Par.ctxDraw.moveTo(line.StartPt.x, line.StartPt.y);
                    Par.ctxDraw.lineTo(line.EndPt.x, line.EndPt.y);
                    Par.ctxDraw.lineWidth = Par.outlinePar.lineWidth;
                    Par.ctxDraw.stroke();
                    Par.ctxDraw.closePath();
                }
                else if(dataSrv.data.isTutorial===dataSrv.isTutorial[1]){//开启教程模式
                    angular.forEach(Par.APIPar.PaintLines_target,function (line_tg) {
                        if(line.LineName===line_tg.LineName){
                            if(line_tg.rgb!=''){
                                Par.ctxDraw.strokeStyle=line_tg.rgb;
                                Par.ctxDraw.beginPath();
                                Par.ctxDraw.moveTo(line.StartPt.x, line.StartPt.y);
                                Par.ctxDraw.lineTo(line.EndPt.x, line.EndPt.y);
                                Par.ctxDraw.lineWidth = Par.outlinePar.lineWidth;
                                Par.ctxDraw.stroke();
                                Par.ctxDraw.closePath();
                            }

                        }
                    });
                }
            });

        },

        //绘制一条线段 LineType代表绘制的线段的类型 L代表绘制图片左边线段 R代表绘制图片右边线段
        drawLine:function(LineType,Par){
            var index=dataSrv.drawDirIndex[Par.imgDir][LineType]===dataSrv.drawDir[0]?0:2;//下标
            var colorArray=dataSrv.drawDirIndex[Par.imgDir][LineType]===dataSrv.drawDir[0]?dataSrv.data.COLOR[Par.imgDir][0]:dataSrv.data.COLOR[Par.imgDir][1];;//颜色数组
            var pts=dataSrv.data.pts[Par.imgDir];//轮廓点数组

            Par.ctxDraw.beginPath();
            Par.ctxDraw.moveTo(pts[0][index]*Par.contPar.winScaling,pts[0][index+1]*Par.contPar.winScaling);
            //在移动点后才能开启教程模式中的变颜色模式
            if(dataSrv.data.isTutorial===dataSrv.isTutorial[1]) {
                if(LineType===dataSrv.LineType[1]){
                    var tutorialColorArray=Par.APIPar.firstColorArray;
                }else  if(LineType===dataSrv.LineType[2]){
                    var tutorialColorArray=Par.APIPar.secondColorArray;
                };
                for(var i=1;i<pts.length;i++){
                    for(var j=0;j<tutorialColorArray.length;j++){
                        if((i===tutorialColorArray[j].index)||(i===1&&tutorialColorArray[j].index===(i-1))){
                            Par.ctxDraw.stroke();

                            Par.ctxDraw.strokeStyle=tutorialColorArray[j].rgb;//获取rgb
                            Par.ctxDraw.beginPath();
                            Par.ctxDraw.moveTo(pts[i-1][index]*Par.contPar.winScaling,pts[i-1][index+1]*Par.contPar.winScaling);
                        }
                    }
                    Par.ctxDraw.lineTo(pts[i][index]*Par.contPar.winScaling,pts[i][index+1]*Par.contPar.winScaling);
                }
            }else {
                for (var i = 1; i < pts.length; i++) {
                    for (var j = 0; j < colorArray.length; j++) {
                        if ((i === colorArray[j][0] && Par.ctxDraw.strokeStyle != dataSrv.warngCol) || (i === 1 && colorArray[j][0] === (i - 1))) {
                            Par.ctxDraw.stroke();

                            Par.ctxDraw.strokeStyle = dataSrv.warngCol;
                            Par.ctxDraw.beginPath();
                            Par.ctxDraw.moveTo(pts[i - 1][index] * Par.contPar.winScaling, pts[i - 1][index + 1] * Par.contPar.winScaling);
                        }
                        else if (i === colorArray[j][1] && Par.ctxDraw.strokeStyle != dataSrv.perfCol) {
                            Par.ctxDraw.stroke();

                            Par.ctxDraw.strokeStyle = dataSrv.perfCol;
                            Par.ctxDraw.beginPath();
                            Par.ctxDraw.moveTo(pts[i - 1][index] * Par.contPar.winScaling, pts[i - 1][index + 1] * Par.contPar.winScaling);
                        }
                    }

                    Par.ctxDraw.lineTo(pts[i][index] * Par.contPar.winScaling, pts[i][index + 1] * Par.contPar.winScaling);
                };
            }

            Par.ctxDraw.stroke();
        },

        //点击事件
        canvasClick:function (e,Par){
            var _that=this;
            var length=dataSrv.data.MP[Par.imgDir][0].length;//数组长度 正面照中长度为FL_MP长度 侧面照中为SF_MP长度 用于计算mSelectedCircleIndex-length得出真实的下标
            var imgName="img"+Par.imgDir;//是否为正面或侧面 正面为imgf 侧面为imgs 用于响应绑定的鼠标事件

            $("body").trigger(imgName+"_Click2Suspension_out");//触发_Click2Suspension的离开事件

            if(Par.infPar.eventFlag===dataSrv.Flag[0]&&Par.infPar.drawFlag===dataSrv.Flag[0]&&dataSrv.APIFlag==dataSrv.Flag[0]){
                Par.infPar.eventFlag=dataSrv.Flag[1];//锁定Flag 避免再触发鼠标滚轮缩放事件

                //取得画布鼠标点击点位置
                Par.clickEvePar.clickX =  e.offsetX? e.offsetX:e.touches[0].pageX-Par.drawCanvasJqueryId.offset().left;//e.touches[0].target.offsetLeft;
                Par.clickEvePar.clickY =  e.offsetY? e.offsetY:e.touches[0].pageY-Par.drawCanvasJqueryId.offset().top;//e.touches[0].target.offsetTop;

                //保存当前鼠标点击位置 便于后面计算拖动距离
                Par.dgImgPar.preOffsetx=Par.clickEvePar.clickX;
                Par.dgImgPar.preOffsety=Par.clickEvePar.clickY;
                //保存图片在拖动前的起始位置
                Par.dgImgPar.preimgx=Par.imgPar.imgx;
                Par.dgImgPar.preimgy=Par.imgPar.imgy;

                //判断点击是否在PaintLines的可移动点上
                angular.forEach(Par.outlinePar.PaintLines,function (point,index) {
                    //当LineType不为free类型时 则鼠标仅能点击PaintLines终止点
                    if(point.LineType!=dataSrv.LineType[0]){
                        //鼠标点击位置距离可移动点距离
                        var distPoint2Click=Math.sqrt(Math.pow(point.EndPt.x - Par.clickEvePar.clickX, 2)
                            + Math.pow(point.EndPt.y - Par.clickEvePar.clickY, 2));
                        //如果小于可移动点的半径则判断为鼠标点击了该点
                        if(distPoint2Click<Par.outlinePar.radius*dataSrv.enLargePLCirRadius*dataSrv.mobileTouchRatio){
                            // 清除之前选择的圆圈
                            if (Par.clickEvePar.previousSelectedCircle != null) {
                                Par.clickEvePar.previousSelectedCircle.isSelected = false;
                            }
                            Par.clickEvePar.previousSelectedCircle = Par.outlinePar.PaintLines[index].EndPt;
                            //选择新圆圈
                            Par.outlinePar.PaintLines[index].isSelected = true;
                            Par.mSelPointPar.mSelectedCircleIndex=Par.outlinePar.PaintLines[index].LineName;

                            //触发_Click2Suspension的进入事件
                            $("body").trigger(imgName+"_Click2Suspension_in", [{
                                dir:2,
                                index: Par.mSelPointPar.mSelectedCircleIndex,
                                x:point.EndPt.x,
                                y:point.EndPt.y
                            }] );

                            //存储当前操作的点的起始位置 便于回退
                            _that.pushRetroversion(Par);

                            // 使圆圈允许拖拽
                            Par.clickEvePar.isDraggingCir=dataSrv.isDraggingCir[1]; //创建新的回退点后才可以拖动点

                            //停止搜索
                            return;
                        }
                    }
                    else{
                        //当LineType为free类型时 则鼠标能点击PaintLines起始点和终止点
                        //鼠标点击位置距离PaintLines起始点距离
                        var distPoint2Click=Math.sqrt(Math.pow(point.StartPt.x - Par.clickEvePar.clickX, 2)
                            + Math.pow(point.StartPt.y - Par.clickEvePar.clickY, 2));
                        if(distPoint2Click<Par.outlinePar.radius*dataSrv.mobileTouchRatio){
                            // 清除之前选择的圆圈
                            if (Par.clickEvePar.previousSelectedCircle != null) {
                                Par.clickEvePar.previousSelectedCircle.isSelected = false;
                            }
                            Par.clickEvePar.previousSelectedCircle = Par.outlinePar.PaintLines[index].StartPt;
                            //选择新圆圈
                            Par.outlinePar.PaintLines[index].isSelected = true;
                            Par.mSelPointPar.mSelectedCircleIndex=Par.outlinePar.PaintLines[index].LineName+"-S";

                            //触发_Click2Suspension的进入事件
                            $("body").trigger(imgName+"_Click2Suspension_in", [{
                                dir:2,
                                index: Par.mSelPointPar.mSelectedCircleIndex,
                                x:point.StartPt.x,
                                y:point.StartPt.y
                            }] );

                            //存储当前操作的点的起始位置 便于回退
                            _that.pushRetroversion(Par);

                            // 使圆圈允许拖拽
                            Par.clickEvePar.isDraggingCir=dataSrv.isDraggingCir[1]; //创建新的回退点后才可以拖动点

                            //停止搜索
                            return;
                        }
                        //鼠标点击位置距离PaintLines终止点距离
                        var distPoint2Click=Math.sqrt(Math.pow(point.EndPt.x - Par.clickEvePar.clickX, 2)
                            + Math.pow(point.EndPt.y - Par.clickEvePar.clickY, 2));
                        if(distPoint2Click<Par.outlinePar.radius*dataSrv.mobileTouchRatio){
                            // 清除之前选择的圆圈
                            if (Par.clickEvePar.previousSelectedCircle != null) {
                                Par.clickEvePar.previousSelectedCircle.isSelected = false;
                            }
                            Par.clickEvePar.previousSelectedCircle = Par.outlinePar.PaintLines[index].EndPt;
                            //选择新圆圈
                            Par.outlinePar.PaintLines[index].isSelected = true;
                            Par.mSelPointPar.mSelectedCircleIndex=Par.outlinePar.PaintLines[index].LineName+"-E";

                            //触发_Click2Suspension的进入事件
                            $("body").trigger(imgName+"_Click2Suspension_in", [{
                                dir:2,
                                index: Par.mSelPointPar.mSelectedCircleIndex,
                                x:point.EndPt.x,
                                y:point.EndPt.y
                            }] );

                            //存储当前操作的点的起始位置 便于回退
                            _that.pushRetroversion(Par);

                            // 使圆圈允许拖拽
                            Par.clickEvePar.isDraggingCir=dataSrv.isDraggingCir[1]; //创建新的回退点后才可以拖动点

                            //停止搜索
                            return;
                        }
                    }
                });

                //判断点击是否在轮廓的可移动点上
                for(var i=0;i<Par.outlinePar.circles.length;i++) {
                    var circle = Par.outlinePar.circles[i];
                    //使用勾股定理计算这个点与圆心之间的距离
                    var distCir2Click = Math.sqrt(Math.pow(circle.x - Par.clickEvePar.clickX, 2)
                        + Math.pow(circle.y - Par.clickEvePar.clickY, 2));
                    // 判断这个点是否在圆圈中
                    if (distCir2Click <= Par.outlinePar.radius*dataSrv.mobileTouchRatio) {
                        // 清除之前选择的圆圈
                        if (Par.clickEvePar.previousSelectedCircle  != null) {
                            Par.clickEvePar.previousSelectedCircle.isSelected = false;
                        }
                        Par.clickEvePar.previousSelectedCircle = circle;

                        //选择新圆圈
                        circle.isSelected = true;
                        Par.mSelPointPar.mSelectedCircleIndex=i;
                        var tempCusCount=0;//对sign非sys进行统计
                        if(i<length) {
                            for(var j=0;j<i;j++){
                                if(Par.outlinePar.circles[j].sign===dataSrv.sign[1]){
                                    tempCusCount++;
                                };
                            };
                            //触发_Click2Suspension的进入事件
                            $("body").trigger(imgName+"_Click2Suspension_in", [{
                                dir:0,
                                index: Par.mSelPointPar.mSelectedCircleIndex-tempCusCount,
                                x:circle.x,
                                y:circle.y
                            }]);
                        }else{
                            for(var j=length;j<i;j++){
                                if(Par.outlinePar.circles[j].sign===dataSrv.sign[1]){
                                    tempCusCount++;
                                };
                            };
                            //触发_Click2Suspension的进入事件
                            $("body").trigger(imgName+"_Click2Suspension_in", [{
                                dir:1,
                                index: Par.mSelPointPar.mSelectedCircleIndex-length-tempCusCount,
                                x:circle.x,
                                y:circle.y
                            }]);
                        }

                        // 存储当前操作的点的起始位置 便于回退
                        _that.pushRetroversion(Par);
                        // // 使圆圈允许拖拽
                        Par.clickEvePar.isDraggingCir=dataSrv.isDraggingCir[1]; //创建新的回退点后才可以拖动点

                        //停止搜索
                        return;
                    }
                };

                Par.dgImgPar.draggingCanvas=dataSrv.draggingCanvas[1];  //没有点击到可移动点上 点击到画布 表示开始拖动图片
            }
        },

        //拖动图片或拖动可移动点
        dragging:function (e,Par) {
            var _that=this;
            var pts=dataSrv.data.pts[Par.imgDir];
            var realImgWidth=dataSrv.data.imgSize[Par.imgDir][0];//图片真实宽度
            var realImgHeight=dataSrv.data.imgSize[Par.imgDir][1];//图片真实高度
            var firMP=dataSrv.data.MP[Par.imgDir][0];
            var secMP=dataSrv.data.MP[Par.imgDir][1];

            _that.judgeOnPoint(e,Par);//判断鼠标是否在可移动点上 用于触发API绑定事件

            //拖动可移动点
            if (Par.clickEvePar.isDraggingCir === dataSrv.isDraggingCir[1]) {
                // 判断拖拽对象是否存在
                if (Par.clickEvePar.previousSelectedCircle != null) {
                    // 取得鼠标位置
                    var mouseX =e.offsetX? e.offsetX:e.touches[0].pageX-Par.drawCanvasJqueryId.offset().left;
                    var mouseY =e.offsetY? e.offsetY:e.touches[0].pageY-Par.drawCanvasJqueryId.offset().top;
                    var tempIndex=Par.mSelPointPar.mSelectedCircleIndex;
                    //testNum.test判断tempIndex是否为数字 如果不是则点击是PaintLine的点 是则是轮廓上的点
                    if(!dataSrv.testNum.test(tempIndex)){
                        for(var i=0;i< Par.outlinePar.PaintLines.length;i++){
                            var line=Par.outlinePar.PaintLines[i];
                            var selCirIndex=tempIndex.split("-");//为了区分点击PL里手臂线起始点还是终止点
                            if(line.LineName===selCirIndex[0]){
                                if(line.LineType!=dataSrv.LineType[0]){//点类型不是free
                                    var PtsIndex=dataSrv.drawDirIndex[Par.imgDir][line.LineType]===dataSrv.drawDir[0]?0:2;

                                    //限制paintline的终止点的移动范围 在轮廓线[minDownIndex,maxUpIndex]区间内自由移动
                                    if(mouseY>=pts[dataSrv.minDownIndex][PtsIndex+1]*Par.contPar.winScaling){//超过最小下标
                                        line.EndPt.y = pts[dataSrv.minDownIndex][PtsIndex+1]*Par.contPar.winScaling;
                                        line.StartPt.y=line.EndPt.y;
                                        line.StartPt.x=pts[dataSrv.minDownIndex][PtsIndex]*Par.contPar.winScaling;
                                    }
                                    else if(mouseY<=pts[dataSrv.maxUpIndex][PtsIndex+1]*Par.contPar.winScaling){//超过最大下标
                                        line.EndPt.y = pts[dataSrv.maxUpIndex][PtsIndex+1]*Par.contPar.winScaling;
                                        line.StartPt.y=line.EndPt.y;
                                        line.StartPt.x=pts[dataSrv.maxUpIndex][PtsIndex]*Par.contPar.winScaling;
                                    }
                                    else{
                                        line.EndPt.y = mouseY;
                                        line.StartPt.y = mouseY;
                                        // line.StartPt锁定在轮廓线上
                                        line.StartPt.x=_that.findPointOnOutline(mouseY,dataSrv.drawDirIndex[Par.imgDir][line.LineType],Par);
                                    }
                                }else if(line.LineType===dataSrv.LineType[0]){//点类型是free
                                    if(selCirIndex[1]==="S") {
                                        Par.clickEvePar.previousSelectedCircle.x = mouseX;
                                        Par.clickEvePar.previousSelectedCircle.y = mouseY;
                                        Par.outlinePar.PaintLines[i].StartPt.x = mouseX;
                                        Par.outlinePar.PaintLines[i].StartPt.y = mouseY;
                                    }else if(selCirIndex[1]==="E"){//点击的是终止点
                                        Par.clickEvePar.previousSelectedCircle.x = mouseX;
                                        Par.clickEvePar.previousSelectedCircle.y = mouseY;
                                        Par.outlinePar.PaintLines[i].EndPt.x=mouseX;
                                        Par.outlinePar.PaintLines[i].EndPt.y=mouseY;
                                    }
                                };
                            }
                        }
                    }
                    else{
                        //点击的是轮廓上的点
                        var transXFromOriginalCircle=mouseX-Par.outlinePar.originalCircles[tempIndex].x ;
                        var transYFromOriginalCircle=mouseY-Par.outlinePar.originalCircles[tempIndex].y  ;
                        //判断鼠标是否在可移动点的可移动范围内
                        if(Math.pow(transXFromOriginalCircle,2)+Math.pow(transYFromOriginalCircle,2)<Math.pow(Par.outlinePar.distanceBound,2)){
                            //鼠标在可移动范围内
                            var transX=mouseX-Par.outlinePar.circles[tempIndex].x ;
                            var transY=mouseY-Par.outlinePar.circles[tempIndex].y  ;

                            // 将圆圈移动到鼠标位置
                            Par.clickEvePar.previousSelectedCircle.x = mouseX;
                            Par.clickEvePar.previousSelectedCircle.y = mouseY;
                            Par.outlinePar.circles[tempIndex]=Par.clickEvePar.previousSelectedCircle;
                            _that.mSelectedPoint(transX,transY,tempIndex,Par);
                        }
                        else{
                            //鼠标不在可移动范围内
                            var oldX=Par.outlinePar.circles[tempIndex].x;
                            var oldY=Par.outlinePar.circles[tempIndex].y;
                            var tempRaduis=Math.sqrt(Math.pow(transXFromOriginalCircle,2)+Math.pow(transYFromOriginalCircle,2));
                            Par.clickEvePar.previousSelectedCircle.x=Par.outlinePar.originalCircles[tempIndex].x+(transXFromOriginalCircle/tempRaduis)*Par.outlinePar.distanceBound;
                            Par.clickEvePar.previousSelectedCircle.y=Par.outlinePar.originalCircles[tempIndex].y+(transYFromOriginalCircle/tempRaduis)*Par.outlinePar.distanceBound;
                            var transX=Par.clickEvePar.previousSelectedCircle.x-oldX;
                            var transY=Par.clickEvePar.previousSelectedCircle.y-oldY;

                            Par.outlinePar.circles[tempIndex]=Par.clickEvePar.previousSelectedCircle;
                            _that.mSelectedPoint(transX,transY,tempIndex,Par);
                        };


                        //移动可移动点时 调整可移动点所在线段的腰线的StartPt点位置
                        if(tempIndex<firMP.length){//paintLine在图片左边
                            if(firMP[tempIndex].index>=dataSrv.minMPDownIndex&&firMP[tempIndex].index<=dataSrv.maxMPUpIndex){
                                angular.forEach(Par.outlinePar.PaintLines,function (line,index) {
                                    if(dataSrv.drawDirIndex[Par.imgDir][line.LineType]===dataSrv.drawDir[0]){
                                        Par.outlinePar.PaintLines[index].StartPt.x=_that.findPointOnOutline(Par.outlinePar.PaintLines[index].StartPt.y,dataSrv.drawDirIndex[Par.imgDir][line.LineType],Par);
                                    }
                                });
                            };
                        }else{//paintLine在图片右边
                            var secTempIndex=tempIndex-firMP.length;
                            if(secMP[secTempIndex].index>=dataSrv.minMPDownIndex&&secMP[secTempIndex].index<=dataSrv.maxMPUpIndex){
                                angular.forEach(Par.outlinePar.PaintLines,function (line,index) {
                                    if(dataSrv.drawDirIndex[Par.imgDir][line.LineType]===dataSrv.drawDir[1]){
                                        Par.outlinePar.PaintLines[index].StartPt.x=_that.findPointOnOutline(Par.outlinePar.PaintLines[index].StartPt.y,dataSrv.drawDirIndex[Par.imgDir][line.LineType],Par);
                                    }
                                });
                            };
                        }
                    }
                    // 更新画布
                    _that.drawCirLine(Par);
                }
            }

            //拖动图片
            else  if(Par.dgImgPar.draggingCanvas===dataSrv.draggingCanvas[1]&&Par.zoomImg.imgScaling!=Par.zoomImg.MIN_SCALE) {
                Par.ctxDraw.clearRect(0,0,Par.canvasDraw.width,Par.canvasDraw.height);
                Par.ctxImg.clearRect(0,0,Par.canvasImg.width,Par.canvasImg.height);

                var mouseX =e.offsetX? e.offsetX:e.touches[0].pageX-Par.drawCanvasJqueryId.offset().left;
                var mouseY =e.offsetY? e.offsetY:e.touches[0].pageY-Par.drawCanvasJqueryId.offset().top;;

                var distanceFromPreOX=mouseX-Par.dgImgPar.preOffsetx;
                var distanceFromPreOY=mouseY-Par.dgImgPar.preOffsety;
                Par.dgImgPar.draggingCanvasScale=Par.zoomImg.imgScaling;
                Par.imgPar.imgx+=distanceFromPreOX;
                Par.imgPar.imgy+=distanceFromPreOY;

                //向上拖动图片不能超过缩放后图片的底部  向向下拖动同理不超过图片顶部 和向左向右拖动时图片左边向右方向不能过容器中间线 右边同理向左不能过中间线
                if((Par.imgPar.imgx>=(0.5*Par.canvasImg.width-Par.imgPar.imgw*Par.zoomImg.imgScaling))
                    &&(Math.abs(Par.imgPar.imgy)<=(Par.canvasImg.height*(Par.zoomImg.imgScaling-1)))
                    &&(Par.imgPar.imgx<=Par.canvasImg.width*0.5)&&(Par.imgPar.imgy<=0)){
                    Par.ctxImg.drawImage(Par.imgPar.img,0,0,realImgWidth,realImgHeight,Par.imgPar.imgx,Par.imgPar.imgy,Par.imgPar.imgw*Par.zoomImg.imgScaling,Par.imgPar.imgh*Par.zoomImg.imgScaling);
                    Par.dgImgPar.preOffsetx=mouseX;
                    Par.dgImgPar.preOffsety=mouseY;

                    if(Par.dgImgPar.zoomCauseDrag===dataSrv.zoomCauseDrag[1]){
                        Par.dgImgPar.zoomCauseDrag=dataSrv.zoomCauseDrag[0];
                    }
                }
                else if((Par.dgImgPar.zoomCauseDrag===dataSrv.zoomCauseDrag[1])
                    &&(Math.abs(Par.imgPar.imgy)<=(Par.canvasImg.height*(Par.zoomImg.imgScaling-1)))
                    &&(Par.imgPar.imgy<=0)){
                    Par.ctxImg.drawImage(Par.imgPar.img,0,0,realImgWidth,realImgHeight,Par.imgPar.imgx,Par.imgPar.imgy,Par.imgPar.imgw*Par.zoomImg.imgScaling,Par.imgPar.imgh*Par.zoomImg.imgScaling);
                    Par.dgImgPar.preOffsetx=mouseX;
                    Par.dgImgPar.preOffsety=mouseY;
                }
                else{
                    Par.imgPar.imgx-=distanceFromPreOX;
                    Par.imgPar.imgy-=distanceFromPreOY;
                    Par.ctxImg.drawImage(Par.imgPar.img,0,0,realImgWidth,realImgHeight,Par.imgPar.imgx,Par.imgPar.imgy,Par.imgPar.imgw*Par.zoomImg.imgScaling,Par.imgPar.imgh*Par.zoomImg.imgScaling);
                }
            }
        },

        //停止拖动或出canvas范围时
        stopDragging:function (e,Par) {
            var _that=this;
            var pts=dataSrv.data.pts[Par.imgDir];
            var imgName="img"+Par.imgDir;//判断是否为正面 侧面 正面为imgf 侧面imgs 用于响应绑定鼠标事件
            var length=dataSrv.data.MP[Par.imgDir][0].length;//数组长度 正面照中长度为FL_MP长度 侧面照中为SF_MP长度 用于计算mSelectedCircleIndex-length得出真实的下标

            if(Par.dgImgPar.draggingCanvas===dataSrv.draggingCanvas[1]){
                //拖动图片结束

                //图片当前的坐标和上一次移动或缩放的偏移量
                var distImgx2PreImgx=Par.imgPar.imgx-Par.dgImgPar.preimgx;
                var distImgy2PreImgy=Par.imgPar.imgy-Par.dgImgPar.preimgy;

                //根据图片当前的坐标和上一次移动或缩放的偏移量 对pts和circles、paintLine进行偏移
                for(var i=0;i<Par.outlinePar.circles.length;i++){
                    Par.outlinePar.circles[i].x+=distImgx2PreImgx;
                    Par.outlinePar.circles[i].y+=distImgy2PreImgy;
                    Par.outlinePar.originalCircles[i].x+=distImgx2PreImgx;
                    Par.outlinePar.originalCircles[i].y+=distImgy2PreImgy;
                };
                for(var i=0;i<pts.length;i++){
                    pts[i][0]+=distImgx2PreImgx/Par.contPar.winScaling;
                    pts[i][1]+=distImgy2PreImgy/Par.contPar.winScaling;
                    pts[i][2]+=distImgx2PreImgx/Par.contPar.winScaling;
                    pts[i][3]+=distImgy2PreImgy/Par.contPar.winScaling;
                };
                angular.forEach(Par.outlinePar.PaintLines,function (line,index) {
                    Par.outlinePar.PaintLines[index].StartPt.x+=distImgx2PreImgx;
                    Par.outlinePar.PaintLines[index].StartPt.y+=distImgy2PreImgy;

                    Par.outlinePar.PaintLines[index].EndPt.x+=distImgx2PreImgx;
                    Par.outlinePar.PaintLines[index].EndPt.y+=distImgy2PreImgy;
                });
                Par.dgImgPar.draggingCanvas=dataSrv.draggingCanvas[0]; //拖动图片结束
                _that.drawCirLine(Par);
                Par.infPar.eventFlag=dataSrv.Flag[0];
            };

            if(Par.clickEvePar.isDraggingCir===dataSrv.isDraggingCir[1]){
                var dgingPoTut;//教程模式下的当前拖动点
                if(Par.retrPar.retrArray.length!=0){
                    if(e.offsetX===Par.clickEvePar.clickX &&e.offsetY===Par.clickEvePar.clickY){
                        //点击可移动点 如果没有移动则不将其加入回退点
                        Par.retrPar.retrArray.pop();
                    }
                    else{
                        //拖动了可移动点 将对回退点的数据更新 保存为一比一时的轮廓点
                        var tempUploadRetr=_that.uploadRetrPoint( Par.retrPar.retrArray.pop(),Par);
                        Par.retrPar.retrArray.push(tempUploadRetr);
                        var testNum=dataSrv.testNum;
                        var tempIndex=Par.mSelPointPar.mSelectedCircleIndex;
                        if(!testNum.test(tempIndex)){
                            var tempSelMPIndex=tempIndex.split("-");
                            angular.forEach(Par.outlinePar.PaintLines,function (line) {
                                if(tempSelMPIndex[0]===line.LineName){
                                    dgingPoTut={
                                        dir:2,
                                        index: tempIndex,
                                        x:(line.EndPt.x-Par.imgPar.imgx)/(Par.contPar.winScaling*Par.zoomImg.imgScaling),
                                        y:(line.EndPt.y-Par.imgPar.imgy)/(Par.contPar.winScaling*Par.zoomImg.imgScaling),
                                    };
                                    //鼠标释放触发 _Mouseup2ChgColor事件
                                    $("body").trigger(imgName+"_Mouseup2ChgColor", [dgingPoTut]);
                                }
                            });
                        }else{
                            var tempProduct=(Par.contPar.winScaling*Par.zoomImg.imgScaling); //窗口调整的比例和缩放比例乘积
                            var tempX=(Par.outlinePar.circles[tempIndex].x-Par.imgPar.imgx)/tempProduct;
                            var tempY=(Par.outlinePar.circles[tempIndex].y-Par.imgPar.imgy)/tempProduct;

                            if(tempIndex<length) {
                                dgingPoTut={
                                    dir:0,
                                    index: tempIndex,
                                    x:tempX,
                                    y:tempY
                                };
                                //鼠标释放触发 _Mouseup2ChgColor事件
                                $("body").trigger(imgName+"_Mouseup2ChgColor", [dgingPoTut]);
                            }else{
                                dgingPoTut={
                                    dir:1,
                                    index:tempIndex-length,
                                    x:tempX,
                                    y:tempY
                                };
                                //鼠标释放触发 _Mouseup2ChgColor事件
                                $("body").trigger(imgName+"_Mouseup2ChgColor", [dgingPoTut]);
                            }
                        }
                    }
                };

                Par.clickEvePar.isDraggingCir = dataSrv.isDraggingCir[0];

                if(dataSrv.data.isTutorial===dataSrv.isTutorial[1]){//教程模式
                    _that.drawCirLine(Par,dgingPoTut);
                }else{
                    _that.drawCirLine(Par);
                }
                Par.infPar.eventFlag=dataSrv.Flag[0];
            }
        },

        //滚轮缩放图片
        scaleImg:function (event,Par) {
            var _that=this;
            if(Par.infPar.eventFlag===dataSrv.Flag[0]&&Par.infPar.drawFlag===dataSrv.Flag[0]&&dataSrv.APIFlag==dataSrv.Flag[0]){
                Par.infPar.eventFlag=dataSrv.Flag[1];//锁定 避免触发点击事件

                var pts=dataSrv.data.pts[Par.imgDir];
                var realImgWidth=dataSrv.data.imgSize[Par.imgDir][0];//图片真实宽度
                var realImgHeight=dataSrv.data.imgSize[Par.imgDir][1];//图片真实高度

                if(Par.zoomImg.imgScaling===1){
                    Par.zoomImg.offsetX = event.offsetX; //鼠标在canvas位置x
                    Par.zoomImg.offsetY = event.offsetY;//鼠标在canvas位置y
                    Par.dgImgPar.draggingCanvasScale=1;//当拖动图片时图片缩放比例
                }

                //获得滚轮滚动的数值 delta为1时 表示滚轮上滚 放大图片 为-1是反之
                var delta = 0;
                if (!event) event = window.event;

                if (event.wheelDelta) {
                    delta = event.wheelDelta/120;
                    if (window.opera) delta = -delta;
                } else if (event.detail) {
                    delta = -event.detail/3;
                };

                Par.zoomImg.zoom = Math.exp(delta*Par.zoomImg.zoomIntensity);

                if(Par.zoomImg.imgScaling *Par.zoomImg.zoom<Par.zoomImg.MIN_SCALE&&Par.imgPar.imgy!=0){
                    //如果缩小比值小于最小缩小值且图片没有回归原位 则这次缩小图片缩回原位
                    Par.zoomImg.zoom=1/Par.zoomImg.imgScaling;
                    Par.outlinePar.distanceBound*=Par.zoomImg.zoom; //放大特征点的移动范围
                    Par.ctxImg.clearRect(0,0,Par.canvasDraw.width,Par.canvasDraw.height);
                    if(Par.zoomImg.zoom<=1){
                        // 图片在拖动后往回缩小时 图片位置向原点（0,0）靠近
                        Par.zoomImg.bfScalingimgx=Par.imgPar.imgx;
                        Par.zoomImg.bfScalingimgy=Par.imgPar.imgy;
                        Par.imgPar.imgx=(Par.contPar.width-Par.imgPar.imgw)/2; //图片在canvas起始位置x
                        Par.imgPar.imgy=0;//图片在canvas起始位置y

                        for(var i=0;i<Par.outlinePar.circles.length;i++){
                            Par.outlinePar.circles[i].x=(Par.imgPar.imgx+(Par.outlinePar.circles[i].x-Par.zoomImg.bfScalingimgx)*Par.zoomImg.zoom);
                            Par.outlinePar.circles[i].y=(Par.imgPar.imgy+(Par.outlinePar.circles[i].y-Par.zoomImg.bfScalingimgy)*Par.zoomImg.zoom);
                            Par.outlinePar.originalCircles[i].x=(Par.imgPar.imgx+(Par.outlinePar.originalCircles[i].x-Par.zoomImg.bfScalingimgx)*Par.zoomImg.zoom);
                            Par.outlinePar.originalCircles[i].y=(Par.imgPar.imgy+(Par.outlinePar.originalCircles[i].y-Par.zoomImg.bfScalingimgy)*Par.zoomImg.zoom);
                        }

                        for(var i=0;i<pts.length;i++){
                            pts[i][0]=(Par.imgPar.imgx+(pts[i][0]*Par.contPar.winScaling-Par.zoomImg.bfScalingimgx)*Par.zoomImg.zoom)/Par.contPar.winScaling;
                            pts[i][1]=(Par.imgPar.imgy+(pts[i][1]*Par.contPar.winScaling-Par.zoomImg.bfScalingimgy)*Par.zoomImg.zoom)/Par.contPar.winScaling;
                            pts[i][2]=(Par.imgPar.imgx+(pts[i][2]*Par.contPar.winScaling-Par.zoomImg.bfScalingimgx)*Par.zoomImg.zoom)/Par.contPar.winScaling;
                            pts[i][3]=(Par.imgPar.imgy+(pts[i][3]*Par.contPar.winScaling-Par.zoomImg.bfScalingimgy)*Par.zoomImg.zoom)/Par.contPar.winScaling;
                        }

                        angular.forEach(Par.outlinePar.PaintLines,function (line,index) {
                            Par.outlinePar.PaintLines[index].StartPt.x=(Par.imgPar.imgx+(Par.outlinePar.PaintLines[index].StartPt.x-Par.zoomImg.bfScalingimgx)*Par.zoomImg.zoom);
                            Par.outlinePar.PaintLines[index].StartPt.y=(Par.imgPar.imgy+(Par.outlinePar.PaintLines[index].StartPt.y-Par.zoomImg.bfScalingimgy)*Par.zoomImg.zoom);
                            Par.outlinePar.PaintLines[index].EndPt.x=(Par.imgPar.imgx+(Par.outlinePar.PaintLines[index].EndPt.x-Par.zoomImg.bfScalingimgx)*Par.zoomImg.zoom);
                            Par.outlinePar.PaintLines[index].EndPt.y=(Par.imgPar.imgy+(Par.outlinePar.PaintLines[index].EndPt.y-Par.zoomImg.bfScalingimgy)*Par.zoomImg.zoom);
                        });
                    }

                    Par.ctxImg.drawImage(Par.imgPar.img,0,0,realImgWidth,realImgHeight,Par.imgPar.imgx,Par.imgPar.imgy,Par.imgPar.imgw,Par.imgPar.imgh);
                    Par.zoomImg.imgScaling =Par.zoomImg.MIN_SCALE;
                    _that.drawCirLine(Par);
                }
                else if(Par.zoomImg.imgScaling *Par.zoomImg.zoom>=Par.zoomImg.MIN_SCALE&&Par.zoomImg.imgScaling*Par.zoomImg.zoom<=Par.zoomImg.MAX_SCALE){
                    //在缩放范围内 图片任意缩放
                    Par.outlinePar.distanceBound*=Par.zoomImg.zoom; //放大特征点的移动范围
                    Par.ctxImg.clearRect(0,0,Par.canvasDraw.width,Par.canvasDraw.height);
                    if(Par.zoomImg.zoom<1){
                        // //图片在拖动后往回缩小时 图片位置向原点（0,0）靠近
                        var tempsacle=(Par.zoomImg.imgScaling-Par.zoomImg.imgScaling*Par.zoomImg.zoom)/(Par.zoomImg.imgScaling-1);
                        Par.zoomImg.bfScalingimgx=Par.imgPar.imgx;
                        Par.zoomImg.bfScalingimgy=Par.imgPar.imgy;
                        Par.imgPar.imgx+=((Par.canvasDraw.width-Par.imgPar.imgw)/2-Par.imgPar.imgx)*tempsacle;
                        Par.imgPar.imgy+=(-Par.imgPar.imgy)*tempsacle;

                        for(var i=0;i<Par.outlinePar.circles.length;i++){
                            Par.outlinePar.circles[i].x=(Par.imgPar.imgx+(Par.outlinePar.circles[i].x-Par.zoomImg.bfScalingimgx)*Par.zoomImg.zoom);
                            Par.outlinePar.circles[i].y=(Par.imgPar.imgy+(Par.outlinePar.circles[i].y-Par.zoomImg.bfScalingimgy)*Par.zoomImg.zoom);
                            Par.outlinePar.originalCircles[i].x=(Par.imgPar.imgx+(Par.outlinePar.originalCircles[i].x-Par.zoomImg.bfScalingimgx)*Par.zoomImg.zoom);
                            Par.outlinePar.originalCircles[i].y=(Par.imgPar.imgy+(Par.outlinePar.originalCircles[i].y-Par.zoomImg.bfScalingimgy)*Par.zoomImg.zoom);
                        }

                        for(var i=0;i<pts.length;i++){
                            pts[i][0]=(Par.imgPar.imgx+(pts[i][0]*Par.contPar.winScaling-Par.zoomImg.bfScalingimgx)*Par.zoomImg.zoom)/Par.contPar.winScaling;
                            pts[i][1]=(Par.imgPar.imgy+(pts[i][1]*Par.contPar.winScaling-Par.zoomImg.bfScalingimgy)*Par.zoomImg.zoom)/Par.contPar.winScaling;
                            pts[i][2]=(Par.imgPar.imgx+(pts[i][2]*Par.contPar.winScaling-Par.zoomImg.bfScalingimgx)*Par.zoomImg.zoom)/Par.contPar.winScaling;
                            pts[i][3]=(Par.imgPar.imgy+(pts[i][3]*Par.contPar.winScaling-Par.zoomImg.bfScalingimgy)*Par.zoomImg.zoom)/Par.contPar.winScaling;
                        }

                        angular.forEach(Par.outlinePar.PaintLines,function (line,index) {
                            Par.outlinePar.PaintLines[index].StartPt.x=(Par.imgPar.imgx+(Par.outlinePar.PaintLines[index].StartPt.x-Par.zoomImg.bfScalingimgx)*Par.zoomImg.zoom);
                            Par.outlinePar.PaintLines[index].StartPt.y=(Par.imgPar.imgy+(Par.outlinePar.PaintLines[index].StartPt.y-Par.zoomImg.bfScalingimgy)*Par.zoomImg.zoom);
                            Par.outlinePar.PaintLines[index].EndPt.x=(Par.imgPar.imgx+(Par.outlinePar.PaintLines[index].EndPt.x-Par.zoomImg.bfScalingimgx)*Par.zoomImg.zoom);
                            Par.outlinePar.PaintLines[index].EndPt.y=(Par.imgPar.imgy+(Par.outlinePar.PaintLines[index].EndPt.y-Par.zoomImg.bfScalingimgy)*Par.zoomImg.zoom);
                        });
                    }
                    else {
                        //放大
                        Par.imgPar.imgx-=(Par.zoomImg.offsetX-Par.imgPar.imgx)*(Par.zoomImg.zoom-1);
                        Par.imgPar.imgy-=(Par.zoomImg.offsetY-Par.imgPar.imgy)*(Par.zoomImg.zoom-1);

                        //更新数据
                        for(var i=0;i<Par.outlinePar.circles.length;i++){
                            Par.outlinePar.circles[i].x-=(Par.zoomImg.offsetX-Par.outlinePar.circles[i].x)*(Par.zoomImg.zoom-1);
                            Par.outlinePar.circles[i].y-=(Par.zoomImg.offsetY-Par.outlinePar.circles[i].y)*(Par.zoomImg.zoom-1);
                            Par.outlinePar.originalCircles[i].x-=(Par.zoomImg.offsetX-Par.outlinePar.originalCircles[i].x)*(Par.zoomImg.zoom-1);
                            Par.outlinePar.originalCircles[i].y-=(Par.zoomImg.offsetY-Par.outlinePar.originalCircles[i].y)*(Par.zoomImg.zoom-1);
                        };
                        for(var i=0;i<pts.length;i++){
                            pts[i][0]-=((Par.zoomImg.offsetX-pts[i][0]*Par.contPar.winScaling)*(Par.zoomImg.zoom-1))/Par.contPar.winScaling;
                            pts[i][1]-=((Par.zoomImg.offsetY-pts[i][1]*Par.contPar.winScaling)*(Par.zoomImg.zoom-1))/Par.contPar.winScaling;
                            pts[i][2]-=((Par.zoomImg.offsetX-pts[i][2]*Par.contPar.winScaling)*(Par.zoomImg.zoom-1))/Par.contPar.winScaling;
                            pts[i][3]-=((Par.zoomImg.offsetY-pts[i][3]*Par.contPar.winScaling)*(Par.zoomImg.zoom-1))/Par.contPar.winScaling;
                        };
                        angular.forEach(Par.outlinePar.PaintLines,function (line,index) {
                            Par.outlinePar.PaintLines[index].StartPt.x-=(Par.zoomImg.offsetX-Par.outlinePar.PaintLines[index].StartPt.x)*(Par.zoomImg.zoom-1);
                            Par.outlinePar.PaintLines[index].StartPt.y-=(Par.zoomImg.offsetY-Par.outlinePar.PaintLines[index].StartPt.y)*(Par.zoomImg.zoom-1);
                            Par.outlinePar.PaintLines[index].EndPt.x-=(Par.zoomImg.offsetX- Par.outlinePar.PaintLines[index].EndPt.x)*(Par.zoomImg.zoom-1);
                            Par.outlinePar.PaintLines[index].EndPt.y-=(Par.zoomImg.offsetY-Par.outlinePar.PaintLines[index].EndPt.y)*(Par.zoomImg.zoom-1);
                        });

                        if(!((Par.imgPar.imgx>=(0.5*Par.canvasImg.width-Par.imgPar.imgw*Par.zoomImg.imgScaling))
                            &&(Par.imgPar.imgx<=Par.canvasImg.width*0.5))){
                            Par.dgImgPar.zoomCauseDrag=dataSrv.zoomCauseDrag[1];//超过容器中间线，允许拖动
                        };
                    };
                    Par.ctxImg.drawImage(Par.imgPar.img,0,0,realImgWidth,realImgHeight,Par.imgPar.imgx,Par.imgPar.imgy,Par.imgPar.imgw*Par.zoomImg.imgScaling*Par.zoomImg.zoom,Par.imgPar.imgh*Par.zoomImg.imgScaling*Par.zoomImg.zoom);
                    Par.zoomImg.imgScaling*= Par.zoomImg.zoom;
                    _that.drawCirLine(Par);
                }
                Par.infPar.eventFlag=dataSrv.Flag[0];//解锁
            }
        },

        //添加新的可移动点
        addDelMP:function(e,Par){
            if(Par.infPar.eventFlag===dataSrv.Flag[0]&&Par.infPar.drawFlag===dataSrv.Flag[0]&&dataSrv.APIFlag==dataSrv.Flag[0]){
                Par.infPar.eventFlag=dataSrv.Flag[1];

                var _that=this;
                var firMP=dataSrv.data.MP[Par.imgDir][0];
                var secMP=dataSrv.data.MP[Par.imgDir][1];
                var pts=dataSrv.data.pts[Par.imgDir];
                var pts_orig=dataSrv.originalData.pts[Par.imgDir];

                _that.judgeOnPoint(e,Par);//判断鼠标是否在可移动点上 用于触发API绑定事件

                //在自定义的可移动点上双击 删除该点
                if(Par.addDelMPPar.hoverPointSign===dataSrv.sign[1]){
                    //存储当前操作的点的起始位置 便于回退
                    _that.pushRetroversion(Par);
                    var tempUploadRetr= _that.uploadRetrPoint(Par.retrPar.retrArray.pop(),Par);
                    Par.retrPar.retrArray.push(tempUploadRetr);

                    Par.outlinePar.circles.splice(Par.addDelMPPar.delCirIndex,1);
                    Par.outlinePar.originalCircles.splice(Par.addDelMPPar.delCirIndex,1);
                    if(Par.addDelMPPar.delCirIndex<firMP.length){
                        firMP.splice(Par.addDelMPPar.delCirIndex,1);
                    }else{
                        secMP.splice(Par.addDelMPPar.delCirIndex-firMP.length,1);
                    }
                    _that.drawCirLine(Par);
                    Par.infPar.eventFlag=dataSrv.Flag[0];
                    return;
                };

                //不在可移动点上 增加可移动点
                if(Par.APIPar.hoverOnPoint===dataSrv.hoverOnPoint[0]){
                    //取得画布鼠标点击点位置
                    var clickX =  e.offsetX?e.offsetX:e.touches[0].pageX-Par.drawCanvasJqueryId.offset().left;
                    var clickY =  e.offsetY?e.offsetY:e.touches[0].pageY-Par.drawCanvasJqueryId.offset().top;
                    var cloestPtOnOutline= _that.findClosestPoint(Par,clickX,clickY);
                    if((Math.pow(cloestPtOnOutline.dVx, 2) + Math.pow(cloestPtOnOutline.dVy, 2))<=Math.pow(Par.outlinePar.radius, 2)){
                        //存储当前操作的点的起始位置 便于回退
                        _that.pushRetroversion(Par);
                        var tempUploadRetr= _that.uploadRetrPoint(Par.retrPar.retrArray.pop(),Par);
                        Par.retrPar.retrArray.push(tempUploadRetr);

                        if(cloestPtOnOutline.drawDir===dataSrv.drawDir[0]){
                            firMP.push({
                                index:cloestPtOnOutline.index,
                                sign:dataSrv.sign[1]
                            });
                            firMP.sort(_that.compare);
                        }
                        else if(cloestPtOnOutline.drawDir===dataSrv.drawDir[1]){
                            secMP.push({
                                index:cloestPtOnOutline.index,
                                sign:dataSrv.sign[1]
                            });
                            secMP.sort(_that.compare);
                        };
                        Par.outlinePar.circles=new Array();
                        Par.outlinePar.originalCircles=new Array();
                        for(var i=0;i<firMP.length;i++){
                            var index=firMP[i].index;
                            var circle= _that.createcircle(pts[index][0]*Par.contPar.winScaling,pts[index][1]*Par.contPar.winScaling,firMP[i].sign);
                            var originalCircle= _that.createcircle((pts_orig[index][0]*Par.contPar.winScaling*Par.zoomImg.imgScaling+Par.imgPar.imgx),(pts_orig[index][1]*Par.contPar.winScaling*Par.zoomImg.imgScaling+Par.imgPar.imgy),firMP[i].sign);
                            Par.outlinePar.circles.push(circle);
                            Par.outlinePar.originalCircles.push(originalCircle);
                        };
                        for(var i=0;i<secMP.length;i++){
                            var index=secMP[i].index;
                            var circle= _that.createcircle(pts[index][2]*Par.contPar.winScaling,pts[index][3]*Par.contPar.winScaling,secMP[i].sign);
                            var originalCircle= _that.createcircle((pts_orig[index][2]*Par.contPar.winScaling*Par.zoomImg.imgScaling+Par.imgPar.imgx),(pts_orig[index][3]*Par.contPar.winScaling*Par.zoomImg.imgScaling+Par.imgPar.imgy),secMP[i].sign);
                            Par.outlinePar.circles.push(circle);
                            Par.outlinePar.originalCircles.push(originalCircle);
                        };
                        _that.drawCirLine(Par);
                    };
                }

                Par.infPar.eventFlag=dataSrv.Flag[0];
            }
        },

        //-------------回退事件函数--------------------start-------------

        //保存鼠标点击可移动点时所有轮廓点的位置
        pushRetroversion:function (Par) {
            var _that=this;
            if(Par.clickEvePar.isDraggingCir===dataSrv.isDraggingCir[0]){
                var Retroversion=_that.keepRetrPoint(Par,_that);
                if(Par.retrPar.retrArray.length!=Par.retrPar.MaxRetrNum){
                    Par.retrPar.retrArray.push(Retroversion)
                }
                else{
                    //超出长度20 则弹出首头 将向新数据压入尾部
                    Par.retrPar.retrArray.shift();
                    Par.retrPar.retrArray.push(Retroversion);
                    Par.retrPar.overMaxRetrNum=dataSrv.overMaxRetrNum[1];
                }
            };
        },

        //创建新的回退点
        keepRetrPoint:function (Par) {
            var _that=this;
            var firMP= _that.cloneObj(dataSrv.data.MP[Par.imgDir][0]);
            var secMP= _that.cloneObj(dataSrv.data.MP[Par.imgDir][1]);
            var pts=_that.cloneObj(dataSrv.data.pts[Par.imgDir]);
            var circles=_that.cloneObj(Par.outlinePar.circles);
            var originalCircles=_that.cloneObj(Par.outlinePar.originalCircles);
            var PaintLines=_that.cloneObj(Par.outlinePar.PaintLines);

            var firstColorArray=_that.cloneObj(Par.APIPar.firstColorArray);
            var secondColorArray=_that.cloneObj(Par.APIPar.secondColorArray);
            var PaintLines_target=_that.cloneObj(Par.APIPar.PaintLines_target);

            var newRetrData={
                pts:pts,
                firMP:firMP,
                secMP:secMP,
                circles:circles,
                originalCircles:originalCircles,
                PaintLines:PaintLines,
                firstColorArray:firstColorArray,
                secondColorArray:secondColorArray,
                PaintLines_target:PaintLines_target,
            }
            return newRetrData;
        },

        //在鼠标松开时 判断是否移动了 如果移动了 则保存一等一比例的轮廓点数据 如果为移动则不保存
        uploadRetrPoint:function (Retr,Par) {
            dataSrv.adjustImgStatus[Par.imgDir]=true; //已调整过
            var _that=this;
            $(Par.retrPar.retrButton).removeAttr("disabled"); //移除disabled属性
            var tempProduct=Par.contPar.winScaling*Par.zoomImg.imgScaling; //窗口调整的比例和缩放比例乘积

            var firMP= _that.cloneObj(Retr.firMP);
            var secMP= _that.cloneObj(Retr.secMP);

            var circles=_that.cloneObj(Retr.circles);
            for(var i=0;i<circles.length;i++){
                circles[i].x=(circles[i].x-Par.imgPar.imgx)/tempProduct;
                circles[i].y=(circles[i].y-Par.imgPar.imgy)/tempProduct;
            };
            var originalCircles=_that.cloneObj(Retr.originalCircles);
            for(var i=0;i<circles.length;i++){
                originalCircles[i].x=(originalCircles[i].x-Par.imgPar.imgx)/tempProduct;
                originalCircles[i].y=(originalCircles[i].y-Par.imgPar.imgy)/tempProduct;
            };

            var pts = new Array();         //先声明一维
            for(var i=0;i<Retr.pts.length;i++){ //一维长度为300
                pts[i]=new Array(4);    //在声明二维
                pts[i][0]=(Retr.pts[i][0]*Par.contPar.winScaling-Par.imgPar.imgx)/tempProduct;
                pts[i][1]=(Retr.pts[i][1]*Par.contPar.winScaling-Par.imgPar.imgy)/tempProduct;
                pts[i][2]=(Retr.pts[i][2]*Par.contPar.winScaling-Par.imgPar.imgx)/tempProduct;
                pts[i][3]=(Retr.pts[i][3]*Par.contPar.winScaling-Par.imgPar.imgy)/tempProduct;
            };

            var PaintLines=_that.cloneObj(Retr.PaintLines);
            for(var i=0;i<PaintLines.length;i++){
                PaintLines[i].StartPt.x=(PaintLines[i].StartPt.x-Par.imgPar.imgx)/tempProduct;
                PaintLines[i].StartPt.y=(PaintLines[i].StartPt.y-Par.imgPar.imgy)/tempProduct;

                PaintLines[i].EndPt.x=(PaintLines[i].EndPt.x-Par.imgPar.imgx)/tempProduct;
                PaintLines[i].EndPt.y=(PaintLines[i].EndPt.y-Par.imgPar.imgy)/tempProduct;
            };

            var firstColorArray=_that.cloneObj(Retr.firstColorArray);
            var secondColorArray=_that.cloneObj(Retr.secondColorArray);
            var PaintLines_target=_that.cloneObj(Retr.PaintLines_target);

            var newRetrData={
                firMP:firMP,
                secMP:secMP,
                circles:circles,
                originalCircles:originalCircles,
                pts:pts,
                PaintLines:PaintLines,
                firstColorArray:firstColorArray,
                secondColorArray:secondColorArray,
                PaintLines_target:PaintLines_target,
            };
            return newRetrData;
        },

        //轮廓回退到上一次操作前 保存的数据的比例是一比一 要进行缩放和移动操作 使与当前图片相匹配
        doRetroversion:function (Par) {
            var _that=this;
            if(Par.retrPar.retrArray.length===0){
                return;
            }
            else{
                var pts=dataSrv.data.pts[Par.imgDir];

                if(Par.infPar.eventFlag===dataSrv.Flag[0]&&Par.infPar.drawFlag===dataSrv.Flag[0]&&dataSrv.APIFlag==dataSrv.Flag[0]){
                    Par.infPar.eventFlag=dataSrv.Flag[1]; //锁定 避免回退过程中 有调点等操作
                    var tempRetr=Par.retrPar.retrArray.pop();
                    var tempProduct=Par.contPar.winScaling*Par.zoomImg.imgScaling; //窗口调整的比例和缩放比例乘积

                    dataSrv.data.MP[Par.imgDir][0]= _that.cloneObj(tempRetr.firMP);
                    dataSrv.data.MP[Par.imgDir][1]= _that.cloneObj(tempRetr.secMP);

                    Par.outlinePar.circles=_that.cloneObj(tempRetr.circles);
                    for(var i=0;i<Par.outlinePar.circles.length;i++){
                        Par.outlinePar.circles[i].x = Par.outlinePar.circles[i].x * tempProduct + Par.imgPar.imgx;
                        Par.outlinePar.circles[i].y = Par.outlinePar.circles[i].y * tempProduct + Par.imgPar.imgy;
                    };
                    Par.outlinePar.originalCircles=_that.cloneObj(tempRetr.originalCircles);
                    for(var i=0;i<Par.outlinePar.circles.length;i++){
                        Par.outlinePar.originalCircles[i].x = Par.outlinePar.originalCircles[i].x * tempProduct + Par.imgPar.imgx;
                        Par.outlinePar.originalCircles[i].y = Par.outlinePar.originalCircles[i].y * tempProduct + Par.imgPar.imgy;
                    };

                    for(var i=0;i<pts.length;i++){
                        pts[i][0]=tempRetr.pts[i][0]*Par.zoomImg.imgScaling+ Par.imgPar.imgx/Par.contPar.winScaling;
                        pts[i][1]=tempRetr.pts[i][1]*Par.zoomImg.imgScaling+ Par.imgPar.imgy/Par.contPar.winScaling;
                        pts[i][2]=tempRetr.pts[i][2]*Par.zoomImg.imgScaling+ Par.imgPar.imgx/Par.contPar.winScaling;
                        pts[i][3]=tempRetr.pts[i][3]*Par.zoomImg.imgScaling+ Par.imgPar.imgy/Par.contPar.winScaling;
                    };

                    Par.outlinePar.PaintLines=_that.cloneObj(tempRetr.PaintLines);
                    for(var i=0;i<Par.outlinePar.PaintLines.length;i++){
                        Par.outlinePar.PaintLines[i].StartPt.x=Par.outlinePar.PaintLines[i].StartPt.x*tempProduct+Par.imgPar.imgx;
                        Par.outlinePar.PaintLines[i].StartPt.y=Par.outlinePar.PaintLines[i].StartPt.y*tempProduct+Par.imgPar.imgy;
                        Par.outlinePar.PaintLines[i].EndPt.x=Par.outlinePar.PaintLines[i].EndPt.x*tempProduct+Par.imgPar.imgx;
                        Par.outlinePar.PaintLines[i].EndPt.y=Par.outlinePar.PaintLines[i].EndPt.y*tempProduct+Par.imgPar.imgy;
                    };

                    Par.APIPar.firstColorArray=_that.cloneObj(tempRetr.firstColorArray);
                    Par.APIPar.secondColorArray=_that.cloneObj(tempRetr.secondColorArray);
                    Par.APIPar.PaintLines_target=_that.cloneObj(tempRetr.PaintLines_target);

                    if(Par.retrPar.retrArray.length===0){
                        if(Par.retrPar.overMaxRetrNum===dataSrv.overMaxRetrNum[0]){ //调节未超过最大次数
                            dataSrv.adjustImgStatus[Par.imgDir]=false;
                        }else{//已调节超过最大次数 且回退到最大次数前的
                            dataSrv.adjustImgStatus[Par.imgDir]=true;
                        }

                        $(Par.retrPar.retrButton).attr('disabled',"true");//添加disabled属性
                    }
                    Par.infPar.eventFlag=dataSrv.Flag[0];
                }
            }
            _that.drawCirLine(Par); //重新绘制
        },

        //-------------回退事件函数-------------------end--------------

        //创建移动点
        createcircle:function(x,y,sign){
            var circle={
                x:x,
                y:y,
                isSelected:false,
                sign:sign,
            }
            return circle;
        },

        //拖动可移动点时,对轮廓点进行更新 transX为鼠标移动距离x,transY为鼠标移动距离y,mSelectedCircleIndex为选中的可移动点的下标
        mSelectedPoint:function (transX,transY,mSelectedCircleIndex,Par) {
            var pts=dataSrv.data.pts[Par.imgDir];
            var firMP=dataSrv.data.MP[Par.imgDir][0];
            var secMP=dataSrv.data.MP[Par.imgDir][1];
            var index;
            var mSelectedPointDownIndex;
            var mSelectedPointUpIndex;
            var mSelectedPointIndex;
            if(mSelectedCircleIndex<firMP.length) {
                index=0;
                mSelectedPointDownIndex=mSelectedCircleIndex>0?firMP[mSelectedCircleIndex-1].index:0;
                mSelectedPointUpIndex=mSelectedCircleIndex<firMP.length-1?firMP[mSelectedCircleIndex+1].index:pts.length;
                mSelectedPointIndex=firMP[mSelectedCircleIndex].index;
            }
            else {
                index=2;
                var mSelectedRightIndex= mSelectedCircleIndex-firMP.length;
                mSelectedPointDownIndex=mSelectedRightIndex>0?secMP[mSelectedRightIndex-1].index:0;
                mSelectedPointUpIndex=mSelectedRightIndex<secMP.length-1?secMP[mSelectedRightIndex+1].index:pts.length;
                mSelectedPointIndex=secMP[mSelectedRightIndex].index;
            };

            for(var i=parseInt(mSelectedPointDownIndex);i<parseInt(mSelectedPointUpIndex);i++) {
                if(i<mSelectedPointIndex) {
                    var changeX = (transX / ((mSelectedPointIndex - mSelectedPointDownIndex) / 2) * (((mSelectedPointIndex - mSelectedPointDownIndex) / 2) - (mSelectedPointIndex - i) / 2))/Par.contPar.winScaling;
                    var changeY = (transY / ((mSelectedPointIndex - mSelectedPointDownIndex) / 2) * (((mSelectedPointIndex - mSelectedPointDownIndex) / 2) - (mSelectedPointIndex - i) / 2))/Par.contPar.winScaling;

                    pts[i][index]=parseFloat(pts[i][index])+parseFloat(changeX);
                    pts[i][index+1]=parseFloat(pts[i][index+1])+parseFloat(changeY);
                }
                else if(i===mSelectedPointIndex){
                    pts[i][index]=parseFloat(pts[i][index])+parseFloat(transX)/Par.contPar.winScaling;
                    pts[i][index+1]=parseFloat(pts[i][index+1])+parseFloat(transY)/Par.contPar.winScaling;
                }
                else{
                    var changeX = (transX / ((mSelectedPointUpIndex-mSelectedPointIndex) / 2) * (((mSelectedPointUpIndex-mSelectedPointIndex) / 2) - (i-mSelectedPointIndex) / 2)/Par.contPar.winScaling);
                    var changeY = (transY / ((mSelectedPointUpIndex-mSelectedPointIndex) / 2) * (((mSelectedPointUpIndex-mSelectedPointIndex) / 2) - (i-mSelectedPointIndex) / 2))/Par.contPar.winScaling;

                    pts[i][index]=parseFloat(pts[i][index])+parseFloat(changeX);
                    pts[i][index+1]=parseFloat(pts[i][index+1])+parseFloat(changeY);
                }
            }
        },

        //判断鼠标是否在可移动点上 用于触发API绑定事件
        judgeOnPoint:function(e,Par){
            var imgName="img"+Par.imgDir;
            var length=dataSrv.data.MP[Par.imgDir][0].length;

            var hoverOnPaintLine=false; //鼠标是否在腰线的终止点上 true为在 false为不在
            var hoverOnCirclesPoint=false; //鼠标是否在身体轮廓上的可移动点上 true为在 false为不在

            //取得画布鼠标当前的坐标
            var clickX = e.offsetX? e.offsetX:e.touches[0].pageX-Par.drawCanvasJqueryId.offset().left;
            var clickY = e.offsetY? e.offsetY:e.touches[0].pageY-Par.drawCanvasJqueryId.offset().top;

            //判断鼠标是否在可移动点上
            for(var i=0;i<Par.outlinePar.PaintLines.length;i++){
                var templine=Par.outlinePar.PaintLines[i];
                if(templine.LineType!=dataSrv.LineType[0]){
                    var distEndPt2Click=Math.sqrt(Math.pow(templine.EndPt.x - clickX, 2)
                        + Math.pow(templine.EndPt.y - clickY, 2));
                    if(distEndPt2Click<Par.outlinePar.radius*dataSrv.enLargePLCirRadius){
                        hoverOnPaintLine=true;
                        if(Par.APIPar.hoverOnPoint===dataSrv.hoverOnPoint[0]){
                            Par.APIPar.hoverOnPoint=dataSrv.hoverOnPoint[1];//鼠标在可移动点的半径内
                            Par.addDelMPPar.hoverPointSign=dataSrv.sign[0]; //系统sys可移动点

                            $("body").trigger(imgName+"_Hover2Suspension_in", [{
                                dir:2,
                                index:templine.LineName,
                                x:templine.EndPt.x,
                                y:templine.EndPt.y
                            }] );
                            //停止搜索
                            return;
                        }
                    }
                }else if(templine.LineType===dataSrv.LineType[0]){
                    var distPoint2Click=Math.sqrt(Math.pow(templine.StartPt.x - clickX, 2)
                        + Math.pow(templine.StartPt.y - clickY, 2));
                    if(distPoint2Click<Par.outlinePar.radius){
                        hoverOnPaintLine=true;
                        if(Par.APIPar.hoverOnPoint===dataSrv.hoverOnPoint[0]){
                            Par.APIPar.hoverOnPoint=dataSrv.hoverOnPoint[1];//鼠标在可移动点的半径内
                            Par.addDelMPPar.hoverPointSign=dataSrv.sign[0]; //系统sys可移动点
                            $("body").trigger(imgName+"_Hover2Suspension_in", [{
                                dir:2,
                                index:templine.LineName+"-S",
                                x:templine.StartPt.x,
                                y:templine.StartPt.y
                            }
                            ] );
                            //停止搜索
                            return;
                        }
                    }
                    var distPoint2Click=Math.sqrt(Math.pow(templine.EndPt.x - clickX, 2)
                        + Math.pow(templine.EndPt.y - clickY, 2));
                    if(distPoint2Click<Par.outlinePar.radius){
                        hoverOnPaintLine=true;
                        if(Par.APIPar.hoverOnPoint===dataSrv.hoverOnPoint[0]){
                            Par.APIPar.hoverOnPoint=dataSrv.hoverOnPoint[1];//鼠标在可移动点的半径内
                            Par.addDelMPPar.hoverPointSign=dataSrv.sign[0]; //系统sys可移动点
                            $("body").trigger(imgName+"_Hover2Suspension_in", [{
                                dir:2,
                                index:templine.LineName+"-E",
                                x:templine.EndPt.x,
                                y:templine.EndPt.y
                            }
                            ] );
                            //停止搜索
                            return;
                        }
                    }
                }
            };

            for(var i=0;i<Par.outlinePar.circles.length; i++) {
                var circle = Par.outlinePar.circles[i];
                //使用勾股定理计算这个点与圆心之间的距离
                var distanceFromCenter = Math.sqrt(Math.pow(circle.x - clickX, 2)
                    + Math.pow(circle.y - clickY, 2))
                // 判断这个点是否在圆圈中
                if (distanceFromCenter <= Par.outlinePar.radius) {
                    hoverOnCirclesPoint=true;
                    if(Par.APIPar.hoverOnPoint===dataSrv.hoverOnPoint[0]){
                        Par.APIPar.hoverOnPoint=dataSrv.hoverOnPoint[1];//鼠标在可移动点的半径内

                        if(circle.sign===dataSrv.sign[0]){
                            Par.addDelMPPar.hoverPointSign=dataSrv.sign[0]; //系统sys可移动点
                        }else{
                            Par.addDelMPPar={
                                hoverPointSign:dataSrv.sign[1],//自定义cus可移动点
                                delCirIndex:i,//要删除的点的下标
                            };
                        };

                        if(circle.sign===dataSrv.sign[0]){
                            var tempCusCount=0;//对sign非sys的点统计
                            if(i<length){
                                for(var j=0;j<i;j++){
                                    if(Par.outlinePar.circles[j].sign===dataSrv.sign[1]){
                                        tempCusCount++;
                                    };
                                };
                                $("body").trigger(imgName+"_Hover2Suspension_in", [{
                                    dir:0,
                                    index:i-tempCusCount,
                                    x:circle.x,
                                    y:circle.y
                                }
                                ] );
                            }else{
                                for(var j=length;j<i;j++){
                                    if(Par.outlinePar.circles[j].sign===dataSrv.sign[1]){
                                        tempCusCount++;
                                    };
                                };

                                $("body").trigger(imgName+"_Hover2Suspension_in", [{
                                    dir:1,
                                    index:i-length-tempCusCount,
                                    x:circle.x,
                                    y:circle.y
                                }] );
                            }
                        }
                        //停止搜索
                        return;
                    }
                }
            };

            //鼠标当前不在腰线的可移动点上 也不在身体轮廓上的可移动点上
            if(hoverOnPaintLine===false&&hoverOnCirclesPoint===false){
                // 如果之前是在可移动点上的 则触发_Hover2Suspension的离开事件
                if(Par.APIPar.hoverOnPoint===dataSrv.hoverOnPoint[1]){
                    $("body").trigger(imgName+"_Hover2Suspension_out");
                }

                Par.APIPar.hoverOnPoint=dataSrv.hoverOnPoint[0];//鼠标不在可移动点的半径内
                Par.addDelMPPar.hoverPointSign=dataSrv.sign[0]; //系统sys可移动点
            };

        },

        //根据y在找跟paintLine同一侧的轮廓线上的点的x 使将腰线的起始点对应到轮廓上
        findPointOnOutline:function (y,drawDir,Par) {
            var minDistance=dataSrv.MAXNUM;
            var selectX=-1;//选中的x的坐标
            var distance=0;
            var pts=dataSrv.data.pts[Par.imgDir];
            var index=(drawDir===dataSrv.drawDir[0])?0:2;//pts下标 如果draw为0 则index=0 反之index=2

            //在轮廓[minDownIndex,maxUpIndex]间寻找对应y值最近的点
            for(var i=dataSrv.minDownIndex;i<dataSrv.maxUpIndex;i++){
                distance=Math.abs(y-parseFloat(pts[i][index+1]*Par.contPar.winScaling));
                if(distance<10&&distance<minDistance){
                    minDistance=distance;
                    selectX=parseFloat(pts[i][index]*Par.contPar.winScaling);
                }
            }

            return selectX;
        },

        //根据鼠标双击的坐标 在轮廓线查找最接近点 并返回该点的绘制方向，下标和坐标
        findClosestPoint:function(Par,x,y){
            var pts=dataSrv.data.pts[Par.imgDir];
            var firDVArr = [];//轮廓点y与传参y差值数组 正面为左边轮廓 侧面为正面轮廓
            var secDVArr = [];//轮廓点y与传参y差值数组 正面为右边轮廓 侧面为侧面轮廓
            //先根据y找到最接近y的点
            for(var i=0;i<pts.length;i++){
                firDVArr.push(Math.abs(pts[i][1]*Par.contPar.winScaling - y));
                secDVArr.push(Math.abs(pts[i][3]*Par.contPar.winScaling- y));
            };
            // 求最小值的索引
            var firIndex = firDVArr.indexOf(Math.min.apply(null, firDVArr));
            var secIndex = secDVArr.indexOf(Math.min.apply(null, secDVArr));

            //比较找到的点的x的值 返回最小的那个
            var firDVx=Math.abs(pts[firIndex][0]*Par.contPar.winScaling-x);
            var secDVx=Math.abs(pts[secIndex][2]*Par.contPar.winScaling-x);
            if(firDVx<secDVx){
                var point= {
                    drawDir:dataSrv.drawDir[0],
                    index:firIndex,
                    dVx:firDVx,
                    dVy:firDVArr[firIndex],
                };
            }else{
                var point=  {
                    drawDir:dataSrv.drawDir[1],
                    index:secIndex,
                    dVx:secDVx,
                    dVy:secDVArr[secIndex],
                };
            };
            return point;
        },

        //克隆对象
        cloneObj : function(obj){
            var str, newobj = obj.constructor === Array ? [] : {};
            if(typeof obj !== 'object'){
                return;
            } else if(window.JSON){
                str = JSON.stringify(obj), //系列化对象
                    newobj = JSON.parse(str); //还原
            } else {
                for(var i in obj){
                    newobj[i] = typeof obj[i] == 'object' ?
                        this.cloneObj(obj[i]) : obj[i];
                }
            }
            return newobj;
        },

        //排序
        compare : function(value1,value2){
            if (value1.index < value2.index) {
                return -1;
            } else if (value1.index > value2.index) {
                return 1;
            }else{
                return 0;
            }
        },

        //设置rgb
        setRgb:function(dgingPoTut,colorArray,Par){
            var _that=this;
            var pts=_that.cloneObj(dataSrv.data.pts[Par.imgDir]);
            var pts_tg=dataSrv.originalData.ptsTarget[Par.imgDir];
            var tempProduct=Par.contPar.winScaling*Par.zoomImg.imgScaling;

            for(var i=0;i<pts.length;i++){ //一维长度为300
                pts[i][0]=(pts[i][0]*Par.contPar.winScaling-Par.imgPar.imgx)/tempProduct;
                pts[i][1]=(pts[i][1]*Par.contPar.winScaling-Par.imgPar.imgy)/tempProduct;
                pts[i][2]=(pts[i][2]*Par.contPar.winScaling-Par.imgPar.imgx)/tempProduct;
                pts[i][3]=(pts[i][3]*Par.contPar.winScaling-Par.imgPar.imgy)/tempProduct;
            };

            if(dgingPoTut.dir!=dataSrv.drawDir[2]){
                //鼠标拖动的可移动点不是paintLine的点 是轮廓上的点
                if(dgingPoTut.dir===dataSrv.drawDir[0]){
                    //鼠标拖动的可移动点在正面中是左 侧面中是前 背同正
                    Par.APIPar.firstColorArray=new Array();
                    for(var i=0;i<pts.length-1;i++){
                        var firDv=Math.sqrt( Math.pow((pts[i][0]-pts_tg[i][0]),2)+
                            Math.pow(( pts[i][1]-pts_tg[i][1]),2));
                        var secDv=Math.sqrt( Math.pow((pts[i+1][0]-pts_tg[i+1][0]),2)+
                            Math.pow(( pts[i+1][1]-pts_tg[i+1][1]),2));
                        Par.APIPar.firstColorArray.push({
                            index:i,
                            rgb:_that.dist2Rgb(1-(firDv+secDv)/(2*Par.outlinePar.distanceBound)),
                        });
                    };
                }else if(dgingPoTut.dir===dataSrv.drawDir[1]){
                    //鼠标拖动的可移动点在正面中是右边 侧面中是背面 背同正
                    Par.APIPar.secondColorArray=new Array();
                    for(var i=0;i<pts.length-1;i++){
                        var firDv=Math.sqrt( Math.pow((pts[i][2]-pts_tg[i][2]),2)+
                            Math.pow(( pts[i][3]-pts_tg[i][3]),2));
                        var secDv=Math.sqrt( Math.pow((pts[i+1][2]-pts_tg[i+1][2]),2)+
                            Math.pow(( pts[i+1][3]-pts_tg[i+1][3]),2));
                        Par.APIPar.secondColorArray.push({
                            index:i,
                            rgb:_that.dist2Rgb(1-(firDv+secDv)/(2*Par.outlinePar.distanceBound)),
                        });
                    };
                }
            }
            else{
                if(colorArray.LineType!=dataSrv.LineType[0]){
                    var distanceFromTarget=Math.abs(colorArray.EndPt.y-dgingPoTut.y);
                    distanceFromTarget=distanceFromTarget*Par.contPar.winScaling*Par.zoomImg.imgScaling;
                    colorArray.rgb=_that.dist2Rgb(1-distanceFromTarget/Par.outlinePar.distanceBound);
                }else{
                    var tempProduct=(Par.contPar.winScaling*Par.zoomImg.imgScaling);
                    var tempSPx;
                    var tempSPy;
                    var tempEPx;
                    var tempEPy;
                    for(var i=0;i<Par.outlinePar.PaintLines.length;i++){
                        if(Par.outlinePar.PaintLines[i].LineName===colorArray.LineName){
                            tempSPx=(Par.outlinePar.PaintLines[i].StartPt.x-Par.imgPar.imgx)/tempProduct;
                            tempSPy=(Par.outlinePar.PaintLines[i].StartPt.y-Par.imgPar.imgy)/tempProduct;

                            tempEPx=(Par.outlinePar.PaintLines[i].EndPt.x-Par.imgPar.imgx)/tempProduct;
                            tempEPy=(Par.outlinePar.PaintLines[i].EndPt.y-Par.imgPar.imgy)/tempProduct;
                        };
                    }
                    var distSP2TgPoint=Math.sqrt( Math.pow((colorArray.StartPt.x-tempSPx),2)+
                        Math.pow((colorArray.StartPt.y-tempSPy),2));
                    var distEP2TgPoint=Math.sqrt( Math.pow((colorArray.EndPt.x-tempEPx),2)+
                        Math.pow((colorArray.EndPt.y-tempEPy),2));
                    var Dist=(distSP2TgPoint+distEP2TgPoint)*Par.contPar.winScaling*Par.zoomImg.imgScaling*0.5;

                    colorArray.rgb=_that.dist2Rgb((1-Dist/Par.outlinePar.distanceBound));
                };
                return;
            };
        },

        //根据点靠近完美点的比例计算返回rgb
        dist2Rgb:function(ratio){
            var _that=this;
            if(ratio<=0){
                var rgbV2=0;
            }
            else if(ratio>dataSrv.closeRatio){
                var rgbV2=255;
            }else{
                var rgbV2=parseInt(255*_that.colMathFun(ratio));
            };

            return "rgb(255,"+rgbV2+",0)";
        },

        //线段颜色变化函数 指数函数
        colMathFun:function (ratio) {
            return Math.pow(dataSrv.bottomNum,ratio)-1;
        },

        //设置可移动点的图标
        setMPIcon:function(Par){
            var firMP=dataSrv.data.MP[Par.imgDir][0];
            var secMP=dataSrv.data.MP[Par.imgDir][1];
            var pts=dataSrv.data.pts[Par.imgDir];
            var pts_tg=dataSrv.originalData.ptsTarget[Par.imgDir];
            var tempProduct=Par.contPar.winScaling*Par.zoomImg.imgScaling;
            Par.APIPar.iconArray=new Array();
            //可移动点的内部icon图标设定
            for (var i = 0; i < firMP.length; i++) {
                var index = firMP[i].index;
                var pts_x=(pts[index][0]*Par.contPar.winScaling-Par.imgPar.imgx)/tempProduct;
                var pts_y=(pts[index][1]*Par.contPar.winScaling-Par.imgPar.imgy)/tempProduct;
                var firDv = Math.sqrt(Math.pow((pts_x - pts_tg[index][0]), 2) +
                    Math.pow((pts_y - pts_tg[index][1]), 2));
                var tempRatio = 1 - (firDv / (Par.contPar.height*dataSrv.mRatio));
                if (tempRatio > dataSrv.closeRatio) {
                    Par.APIPar.iconArray.push(dataSrv.MPIcon[1]);
                } else {
                    Par.APIPar.iconArray.push(dataSrv.MPIcon[0]);
                }
            };
            for (var i = 0; i < secMP.length; i++) {
                var index = secMP[i].index;
                var pts_x=(pts[index][2]*Par.contPar.winScaling-Par.imgPar.imgx)/tempProduct;
                var pts_y=(pts[index][3]*Par.contPar.winScaling-Par.imgPar.imgy)/tempProduct;
                var secDv = Math.sqrt(Math.pow((pts_x - pts_tg[index][2]), 2) +
                    Math.pow((pts_y - pts_tg[index][3]), 2));
                var tempRatio = 1 - (secDv /(Par.contPar.height*dataSrv.mRatio) );
                if (tempRatio > dataSrv.closeRatio) {
                    Par.APIPar.iconArray.push(dataSrv.MPIcon[1]);
                } else {
                    Par.APIPar.iconArray.push(dataSrv.MPIcon[0]);
                }
            };

            Par.APIPar.PaintLines_iconArray=new Array;
            angular.forEach(Par.outlinePar.PaintLines,function (line) {
                if(line.LineType!=dataSrv.LineType[0]){
                    angular.forEach(Par.APIPar.PaintLines_target,function (line_tg) {
                        if(line.LineName===line_tg.LineName){
                            var tempProduct=(Par.contPar.winScaling*Par.zoomImg.imgScaling);
                            var tempEPy=(line.EndPt.y-Par.imgPar.imgy)/tempProduct;
                            var distanceFromTarget=Math.abs(tempEPy-line_tg.EndPt.y);
                            // distanceFromTarget=distanceFromTarget*Par.contPar.winScaling*Par.zoomImg.imgScaling;
                            if((1-distanceFromTarget/(Par.contPar.height*dataSrv.mRatio))>dataSrv.closeRatio){
                                Par.APIPar.PaintLines_iconArray.push({
                                    LineName:line.LineName,
                                    icon:dataSrv.MPIcon[1]
                                });
                            }else{
                                Par.APIPar.PaintLines_iconArray.push({
                                    LineName:line.LineName,
                                    icon:dataSrv.MPIcon[0]
                                });
                            }
                        };
                    });
                }else{
                    var tempProduct=(Par.contPar.winScaling*Par.zoomImg.imgScaling);
                    var tempSPx;
                    var tempSPy;
                    var tempEPx;
                    var tempEPy;
                    angular.forEach(Par.APIPar.PaintLines_target,function (line_tg) {
                        if(line.LineName===line_tg.LineName){
                            tempSPx=(line.StartPt.x-Par.imgPar.imgx)/tempProduct;
                            tempSPy=(line.StartPt.y-Par.imgPar.imgy)/tempProduct;

                            tempEPx=(line.EndPt.x-Par.imgPar.imgx)/tempProduct;
                            tempEPy=(line.EndPt.y-Par.imgPar.imgy)/tempProduct;

                            var distSP2TgPoint=Math.sqrt( Math.pow((line_tg.StartPt.x-tempSPx),2)+
                                Math.pow((line_tg.StartPt.y-tempSPy),2));
                            var distEP2TgPoint=Math.sqrt( Math.pow((line_tg.EndPt.x-tempEPx),2)+
                                Math.pow((line_tg.EndPt.y-tempEPy),2));
                            if((1-distSP2TgPoint/(Par.contPar.height*dataSrv.mRatio))>dataSrv.closeRatio){
                                Par.APIPar.PaintLines_iconArray.push({
                                    LineName:line.LineName+"-S",
                                    icon:dataSrv.MPIcon[1],
                                });
                            }else{
                                Par.APIPar.PaintLines_iconArray.push({
                                    LineName:line.LineName+"-S",
                                    icon:dataSrv.MPIcon[0],
                                });
                            }

                            if((1-distEP2TgPoint/(Par.contPar.height*dataSrv.mRatio))>dataSrv.closeRatio){
                                Par.APIPar.PaintLines_iconArray.push({
                                    LineName:line.LineName+"-E",
                                    icon:dataSrv.MPIcon[1],
                                });
                            }else{
                                Par.APIPar.PaintLines_iconArray.push({
                                    LineName:line.LineName+"-E",
                                    icon:dataSrv.MPIcon[0],
                                });
                            }
                        };
                    });
                }
            });
        },

        //可移动端操作
        setGesture:function(Par){
            dataSrv.mobileTouchRatio=2;
            var _that=this;
            var istouch=false;
            var start;
            Par.drawCanvasJqueryId.unbind();
            Par.drawCanvasJqueryId.bind('touchstart', function(e){
                // 手指点击
                if(e.touches.length>=2){
                    //判断是否有两个手指在屏幕上
                    istouch=true;
                    start=e.touches;  //得到第一组两个点
                }else if(e.touches.length===1){
                    //只有一个手指在屏幕上
                    _that.canvasClick(e,Par);
                };
            })
                .bind('touchmove', function(e){
                    if(e.touches.length>=2&&istouch){
                        // 两个手指在屏幕上 且拖动 执行缩放事件
                        if (Par.clickEvePar.isDraggingCir === dataSrv.isDraggingCir[0]) {
                            _that.stopDragging(event,Par);
                            Par.infPar.eventFlag=dataSrv.Flag[1];//锁定 避免触发点击事件
                            var now=e.touches;  //得到第二组两个点
                            var scale=_that.getDistance(now[0],now[1])/_that.getDistance(start[0],start[1]); //得到缩放比例，getDistance是勾股定理的一个方法

                            e.offsetX=(start[0].pageX+start[1].pageX)/2-Par.drawCanvasJqueryId.offset().left;//获得双指之间在屏幕上的中间坐标x
                            e.offsetY=(start[0].pageY+start[1].pageY)/2-Par.drawCanvasJqueryId.offset().top;//获得双指之间在屏幕上的中间坐标y
                            e.zoom=scale/Par.mobilePar.gestureScale;//这次的放大比例
                            if(e.zoom>1){
                                e.wheelDelta=120;
                            }else if(e.zoom<1){
                                e.wheelDelta=-120;
                            }else{
                                e.wheelDelta=0;
                            }
                            Par.infPar.eventFlag=dataSrv.Flag[0];
                            _that.scaleImg(e,Par);
                            Par.mobilePar.gestureScale=scale;
                        }
                    }
                    else if(e.touches.length===1){
                        //拖动图片或可移动点
                        _that.mobileDragging(e,Par);
                    }
                })
                .bind('touchend', function(e){
                    if(istouch){
                        istouch=false;
                    };
                    Par.mobilePar.outsideCir=dataSrv.outsideCir[0];
                    // 停止拖动并绘制轮廓
                    _that.stopDragging(event,Par);
                });
        },

        //获取双指间的距离
        getDistance:function(p1, p2) {
            var x = p2.pageX - p1.pageX,
                y = p2.pageY - p1.pageY;
            return Math.sqrt((x * x) + (y * y));
        },

        //移动端手指拖动可移动点
        mobileDragging:function(e,Par){
            var _that=this;

            if (Par.clickEvePar.isDraggingCir === dataSrv.isDraggingCir[1]) {
                // 判断拖拽对象是否存在
                if (Par.clickEvePar.previousSelectedCircle != null) {
                    var testNum=dataSrv.testNum;//验证index是否为数字 否为PL上的点 是为轮廓上的点
                    if(testNum.test(Par.mSelPointPar.mSelectedCircleIndex)){
                        var offsetX =  e.offsetX? e.offsetX:e.touches[0].pageX-Par.drawCanvasJqueryId.offset().left;
                        var offsetY =  e.offsetY? e.offsetY:e.touches[0].pageY-Par.drawCanvasJqueryId.offset().top;
                        var tempRadius=Par.contPar.height*dataSrv.mRatio*dataSrv.enLargeMRadius;
                        var transXFromOriginalCircle=offsetX-Par.outlinePar.originalCircles[Par.mSelPointPar.mSelectedCircleIndex].x;
                        var transYFromOriginalCircle=offsetY-Par.outlinePar.originalCircles[Par.mSelPointPar.mSelectedCircleIndex].y;
                        var tempDistance=Math.sqrt(Math.pow(transXFromOriginalCircle,2)+Math.pow(transYFromOriginalCircle,2));
                        if(tempDistance>tempRadius) {
                            // var offsetXDv=(tempDistance-Par.contPar.height*dataSrv.mRatio*dataSrv.enLargeMRadius)*(transXFromOriginalCircle/tempDistance);
                            // var offsetYDv=(tempDistance-Par.contPar.height*dataSrv.mRatio*dataSrv.enLargeMRadius)*(transYFromOriginalCircle/tempDistance);

                            // e.offsetX=Par.outlinePar.originalCircles[Par.mSelPointPar.mSelectedCircleIndex].x+offsetXDv;
                            // e.offsetY=Par.outlinePar.originalCircles[Par.mSelPointPar.mSelectedCircleIndex].y+offsetYDv;
                            Par.mobilePar.outsideCir=dataSrv.outsideCir[1];
                        }
                        if( Par.mobilePar.outsideCir===dataSrv.outsideCir[1]){
                            e.offsetX=offsetX-tempRadius;
                            e.offsetY=offsetY;
                            _that.dragging(e,Par);
                        }
                    }else{
                        _that.dragging(e,Par);
                    }
                }
            }
            else{
                _that.dragging(e,Par);
            }
        },

        //判断是否为pc端 是返回true 否返回false
        isPc:function() {
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
        },
    };
}]);

//SwitchView为视图的切换功能，包括切换调整和展示视图，点击导栏航,拖拉导航栏
view.controller('SwitchViewCtrl',['$scope','dataSrv',function ($scope,dataSrv) {
    //--------------API接口--------------------------

    //获得轮廓点和图片
    $scope.getData=function (data) {
        //      data数据结构： {
        //         dir:['f','s','b'],//图片的方向 f正面 s侧面 b背面
        //         pts:{
        //             'f':pts_f,//正面的pts点 pts_f[300][4] 二级数组 [0][1] 代表左边x、y
        //             //[2][3]代表右边x、y
        //             's':pts_s,//同上，但[0][1]代表前面xy [2][3]代表后面xy
        //             'b':pts_b//同正面
        //         },
        //         //ptsTarget:{//这是教程模式下完美点的pts
        //         // 'f':pts_f,//正面的pts点 pts_f[300][4] 二级数组 [0][1] 代表左边x、y
        //         //[2][3]代表右边x、y
        //         //  's':pts_s,//同上，但[0][1]代表前面xy [2][3]代表后面xy
        //         //  'b':pts_b//同正面
        //         // },
        //
        //         url:{
        //             'f': ‘’,//获得图片base64,
        //             's':’’,//获得图片base64,
        //             'b' :’’//获得图片base64
        //            },
        //        MP:{
        //             'f':[FL_MP,FR_MP],//可移动点的下标数组[2][n] 正面[0]代表左边
        //                                 //[1]代表右边
        //             's':[SF_MP,SB_MP],//同上，[0]代表前 [1]代表后
        //             'b':[BL_MP,BR_MP]//同正面
        //             },
        //       COLOR:{
        //             'f':[FLCOLOR,FRCOLOR],//颜色，数组[2][n][2]第一个2代表[0]是左线
        //             // 段 [1]代表右边 n代表有多少段红色线段
        //             //第二的2代表的是[0]是红色线段的起点下标
        //             //[1]是红色线段的终点下标
        //             's':[SFCOLOR,SBCOLOR],//同上
        //             'b':[BLCOLOR,BRCOLOR],//同正面
        //             },
        //       imgSize:{
        //             'f':imgfSize,//数组[2] [0]代表图片原始的宽度 [1]代表高度
        //             's':imgsSize,//同上
        //             'b':imgbSize,//同上
        //               },
        //
        //         PaintLines:JSON.parse(jsonptsInfo.paintLines), //得到PaintLines
        //         isTutorial:spPar.isTutorial,//是否为教程模式如果是，为true 不是为false
        //         promptButton:spPar.promptButton,//教程模式提示按钮id用于开启提示点
        //         id:Number(res.data.id),//当前调点对象的id
        //         PaintKeyPts:PaintKeyPts,//数组 保存可移动点所在位置、名称和下标
        // };

        dataSrv.APIFlag=dataSrv.Flag[1]; //锁定,避免获取数据或上传数据时触发

        dataSrv.currentId=data.id; //当前对象的id

        dataSrv.data=cloneObj(data);//克隆数据
        pretrData(dataSrv.data); //对可移动点进行预处理 用于后期区分可移动点类型是系统还是自定义

        dataSrv.originalData=cloneObj(dataSrv.data);

        if (data.isTutorial===dataSrv.isTutorial[1]){//教程模式开启
            //教程模式下的可移动点的图标
            dataSrv.defImg=new Image();
            dataSrv.defImg.src=dataSrv.defImgSrc;
            dataSrv.targetImg=new Image();
            dataSrv.targetImg.src=dataSrv.targetImgSrc;

            //提示按钮 用于开启提示点
            dataSrv.promptButton=data.promptButton;
            $(dataSrv.promptButton).unbind();
        };

        //先解绑回退事件，避免重复绑定回退事件
        if(dataSrv.retrButton&&dataSrv.retrButton!=''){
            for(var i in dataSrv.retrButton){
                $(dataSrv.retrButton[i]).unbind();
            };
        }
        $(window).unbind('resize'); //解绑窗口调整事件
        setTimeout(function () {
            dataSrv.APIFlag=dataSrv.Flag[0]; //解锁,避免获取数据或上传数据时触发事件
            $scope.$broadcast('get_data', 'success');//广播数据已接收可开始绘制
        },dataSrv.setOutTime);
    };

    //postAdjustRes用于上传调点结果
    $scope.postAdjustRes=function () {

        dataSrv.APIFlag=dataSrv.Flag[1]; //锁定,避免获取数据或上传数据时触发事件
        //判断轮廓是否被调整过
        var ptsStatus=4;//未调整状态
        for(var i in dataSrv.adjustImgStatus){
            if(dataSrv.adjustImgStatus[i]===true){
                ptsStatus=3;//已调整状态
            }
        };

        var pts_f =getNewPts(dataSrv.data,dataSrv.imgf_par,'f');
        var pts_s =getNewPts(dataSrv.data,dataSrv.imgs_par,'s');
        var pts_b =getNewPts(dataSrv.data,dataSrv.imgb_par,'b');

        var tempPaintLines=[];
        getPaintLines(tempPaintLines,dataSrv.imgs_par);
        getPaintLines(tempPaintLines,dataSrv.imgf_par);

        if(pts_b!=''){
            getPaintLines(tempPaintLines,dataSrv.imgb_par);
            var reqData={
                'id':Number(dataSrv.currentId),
                'pts_f':pts_f,
                'pts_s':pts_s,
                'pts_b':pts_b,
                "paintLines": JSON.stringify(tempPaintLines),
                'ptsStatus': ptsStatus,
            };
        }else{
            var reqData={
                'id':Number(dataSrv.currentId),
                'pts_f':pts_f,
                'pts_s':pts_s,
                "paintLines": JSON.stringify(tempPaintLines),
                'ptsStatus': ptsStatus,
            };
        };

        dataSrv.APIFlag=dataSrv.Flag[0]; //解锁,避免获取数据或上传数据时触发事件

        return reqData;
    };

    //bindFun用于绑定事件
    $scope.bindFun=function(evName,firfun,secfun){
        //evName事件名 firfun为定义的进入事件，secfun为离开事件
        if(evName===''||evName===null||evName===undefined){
            return;
        };
        var tempEvName=evName.split("_");
        if(tempEvName[1]==="Hover2Suspension"){
            $("body").bind(evName+"_in", firfun);
            $("body").bind(evName+"_out", secfun);
        }else if(tempEvName[1]==='Click2Suspension'){
            $("body").bind(evName+"_in", firfun);
            $("body").bind(evName+"_out", secfun);
        }else {
            $("body").bind(evName, firfun);
        }
    };

    //unbindFun用于解绑事件
    $scope.unbindFun=function(evName){
        if(evName===''||evName===null||evName===undefined){
            return;
        }
        var tempEvName=evName.split("_");
        if(tempEvName[1]==="Hover2Suspension"){
            $("body").unbind(evName+"_in");
            $("body").unbind(evName+"_out");
        }else if(tempEvName[1]==="Click2Suspension"){
            $("body").unbind(evName+"_in");
            $("body").unbind(evName+"_out");
        }else {
            $("body").unbind(evName);
        }
    };

    //对可移动点进行预处理 用于后期区分可移动点类型是系统还是自定义
    function pretrData(data) {
        for(var i=0; i< data.dir.length;i++){
            var dir=data.dir[i];
            for(var j=0;j<data.MP[dir][0].length;j++){
                data.MP[dir][0][j]={
                    index:data.MP[dir][0][j],
                    sign:dataSrv.sign[0]
                };
            };
            for(var j=0;j<data.MP[dir][1].length;j++){
                data.MP[dir][1][j]={
                    index:data.MP[dir][1][j],
                    sign:dataSrv.sign[0]
                };
            }
        }
    };

    //获取pts
    function getNewPts(data,img_par,imgDir) {
        if((!data.pts[imgDir])||data.pts[imgDir]===''){
            return '';
        };
        var img_tempProduct=img_par.contPar.winScaling*img_par.zoomImg.imgScaling; //窗口调整的比例和缩放比例乘积
        var tempPts = new Array();         //先声明一维
        var pts=data.pts[imgDir];
        for(var i=0;i<pts.length;i++){ //一维长度为300
            tempPts[i]=new Array(4);    //在声明二维
            tempPts[i][0]=(pts[i][0]*img_par.contPar.winScaling-img_par.imgPar.imgx)/img_tempProduct;
            tempPts[i][1]=(pts[i][1]*img_par.contPar.winScaling-img_par.imgPar.imgy)/img_tempProduct;
            tempPts[i][2]=(pts[i][2]*img_par.contPar.winScaling-img_par.imgPar.imgx)/img_tempProduct;
            tempPts[i][3]=(pts[i][3]*img_par.contPar.winScaling-img_par.imgPar.imgy)/img_tempProduct;
        };
        var pts_array=[];
        for(var i=0;i<pts.length;i++){
            pts_array.push(tempPts[i][0]+':'+tempPts[i][1]+':'+tempPts[i][2]+':'+tempPts[i][3]);
        };
        return  pts_array.join(",");
    }

    //获取paintLines
    function getPaintLines(tempPaintLines,img_par) {
        if((!img_par.outlinePar.PaintLines)||img_par.outlinePar.PaintLines===''){
            return '';
        }
        var img_tempProduct=img_par.contPar.winScaling*img_par.zoomImg.imgScaling; //窗口调整的比例和缩放比例乘积
        for(var i=0;i<img_par.outlinePar.PaintLines.length;i++){
            var line=img_par.outlinePar.PaintLines[i];
            var StartPtX=parseFloat((line.StartPt.x-img_par.imgPar.imgx)/img_tempProduct);
            var StartPtY=parseFloat((line.StartPt.y-img_par.imgPar.imgy)/img_tempProduct);
            var EndPtX=parseFloat((line.EndPt.x-img_par.imgPar.imgx)/img_tempProduct);
            var EndPtY=parseFloat((line.EndPt.y-img_par.imgPar.imgy)/img_tempProduct);
            tempPaintLines.push({
                "LineName": line.LineName,
                "ImgDir": line.ImgDir,
                "EndPt": {"Y": EndPtY, "X": EndPtX},
                "LineType": line.LineType,
                "StartPt": {"Y": StartPtY, "X": StartPtX}
            });
        };
    }

    //克隆对象
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
}]);

//指令 tozDrawImgf负责绘制正面照
view.directive("tozDrawImgf",["dataSrv","drawSrv",function (dataSrv,drawSrv) {
    return{
        restrict:'A',
        replace:true,
        scope:{},
        template: ' <div><canvas id="imgfDrawCanvas" style="display:block; position:absolute; z-index: 1"></canvas> ' +
        '<canvas id="imgfImgCanvas" style="display:block; position: absolute;z-index: 0"></canvas></div>',
        controller:["$scope",'$element','$attrs',function($scope,$element,$attrs) {
            $scope.imgf_par=drawSrv.newPar(dataSrv.imgDir[0],'imgfDrawCanvas','imgfImgCanvas');
            dataSrv.imgCont[$scope.imgf_par.imgDir]='#'+$element.attr('id');
            dataSrv.retrButton[$scope.imgf_par.imgDir]=$element.attr('retract');
            dataSrv.imgf_par=$scope.imgf_par; //用于上传时恢复一比一比例的轮廓
        }],
        link:function ($scope) {
            //广播接收事件，用于接收身体轮廓点的数据
            $scope.$on('get_data', function (event, args) {
                //预处理 为canvas绑定事件和启动教程模式的初始化
                drawSrv.pretreatment($scope.imgf_par);

                //对数据进行初始化
                drawSrv.init($scope.imgf_par);

                //绘制入口
                drawSrv.draw($scope.imgf_par);
            });
        }
    }
}]);

//指令 tozDrawImgs负责绘制侧面照
view.directive("tozDrawImgs",["dataSrv","drawSrv",function (dataSrv,drawSrv) {
    return {
        restrict: 'A',
        replace: true,
        scope:{},
        template: ' <div><canvas id="imgsDrawCanvas" style="display:block; position:absolute; z-index: 1"></canvas> ' +
        '<canvas id="imgsImgCanvas" style="display:block; position: absolute;z-index: 0"></canvas></div>',
        controller:["$scope",'$element','$attrs',function($scope,$element,$attrs) {
            $scope.imgs_par= drawSrv.newPar(dataSrv.imgDir[1],'imgsDrawCanvas','imgsImgCanvas');;
            dataSrv.imgCont[$scope.imgs_par.imgDir]='#'+$element.attr('id');
            dataSrv.retrButton[$scope.imgs_par.imgDir]=$element.attr('retract');
            dataSrv.imgs_par=$scope.imgs_par; //用于上传时恢复一比一比例的轮廓
        }],
        link: function ($scope) {
            //广播接收事件，用于接收身体轮廓点的数据
            $scope.$on('get_data', function (event,args) {
                //预处理 为canvas绑定事件和启动教程模式的初始化
                drawSrv.pretreatment($scope.imgs_par);

                //对数据进行初始化
                drawSrv.init($scope.imgs_par);

                //绘制入口
                drawSrv.draw($scope.imgs_par);
            });
        }
    }
}]);

//指令 tozDrawImgs负责绘制侧面照
view.directive("tozDrawImgb",["dataSrv","drawSrv",function (dataSrv,drawSrv) {
    return {
        restrict: 'A',
        replace: true,
        scope:{},
        template: ' <div><canvas id="imgbDrawCanvas" style="display:block; position:absolute; z-index: 1"></canvas> ' +
        '<canvas id="imgbImgCanvas" style="display:block; position: absolute;z-index: 0"></canvas></div>',
        controller:["$scope",'$element','$attrs',function($scope,$element,$attrs) {
            $scope.imgb_par=drawSrv.newPar(dataSrv.imgDir[2],'imgbDrawCanvas','imgbImgCanvas');;
            dataSrv.imgCont[$scope.imgb_par.imgDir]='#'+$element.attr('id');
            dataSrv.retrButton[$scope.imgb_par.imgDir]=$element.attr('retract');
            dataSrv.imgb_par=$scope.imgb_par; //用于上传时恢复一比一比例的轮廓
        }],
        link: function ($scope) {
            //广播接收事件，用于接收身体轮廓点的数据
            $scope.$on('get_data', function (event,args) {
                if(dataSrv.data.url[$scope.imgb_par.imgDir]!=''){
                    //预处理 为canvas绑定事件和启动教程模式的初始化
                    drawSrv.pretreatment($scope.imgb_par);

                    //对数据进行初始化
                    drawSrv.init($scope.imgb_par);

                    //绘制入口
                    drawSrv.draw($scope.imgb_par);
                }
            });
        }
    }
}]);