
//自定义弹框
var toz_Toast=function(setting){
    this.settings={};
    // this.init(setting);
    // var rnd = Math.random().toString().replace('.', '');
    // this.id = 'Toast_' + rnd;
    // duration=isNaN(duration)?3000:duration;
    // var m = document.createElement('div');
    // m.innerHTML = msg;
    // m.style.cssText="width: 60%;min-width: 150px;opacity: 0.7;height: 30px;color: rgb(255, 255, 255);line-height: 30px;text-align: center;border-radius: 5px;position: fixed;top: 40%;left: 20%;z-index: 999999;background: rgb(0, 0, 0);font-size: 12px;";
    // document.body.appendChild(m);
    // setTimeout(function() {
    //     var d = 0.5;
    //     m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
    //     m.style.opacity = '0';
    //     setTimeout(function() { document.body.removeChild(m) }, d * 1000);
    // }, duration);
}

toz_Toast.prototype = {
    init: function(settings){
        var id='tozT_'+this.genID(2);
        if($(".toz-cover-layer").length>0){
            $(".toz-cover-layer").remove();
        }

        this.settings[id] = $.extend({
            title:"",
            icon:"loading",
            content:"",
            duration:3000,
            mask:false,
            success:new Function("return"),
            fail:new Function("return"),
            complete:new Function("return"),
        }, settings);

        if(this.settings[id].icon=="loading"){
            var html=
                '<div  class="toz-cover-layer toz-first-opacity" id="'+id+'" >'+
                    '<div class="toz-mask" style="display: none"></div>'+
                    '<div class="toz-cover-content">'+
                        '<div class="toz-loader">'+
                           '<div class="toz-dot"></div>'+
                           '<div class="toz-dot"></div>'+
                           '<div class="toz-dot"></div>'+
                           '<div class="toz-dot"></div>'+
                        '<div class="toz-dot"></div>'+
                      '</div>'+
                      '<div class="toz-cover-text">'+
                         ' <p>'+ this.settings[id].content+'</p>'+
                      '</div>'+
                    '</div>'+
                '</div>';
        }
        else if(this.settings[id].icon=="success"){
            var html=
                '<div  class="toz-cover-layer toz-second-opacity" id="'+id+'" >'+
                    '<div class="toz-mask" style="display: none"></div>'+
                    '<div class="toz-cover-content">'+
                       '<div class="toz-alert toz-showSweetAlert" data-animation="pop"  style="display: block;">'+
                           '<div class="sa-icon sa-success animate" style="display: block;">'+
                                '<span class="sa-line sa-tip animateSuccessTip"></span>'+
                                '<span class="sa-line sa-long animateSuccessLong"></span>'+
                                '<div class="sa-placeholder"></div>'+
                                '<div class="sa-fix"></div>'+
                           '</div>'+
                           '<div class="toz-title-text">'+
                              ' <h2>'+ this.settings[id].title+'</h2>'+
                           '</div>'+
                           '<div class="toz-content-text">'+
                              ' <p>'+ this.settings[id].content+'</p>'+
                           '</div>'+
                       '</div>'+
                  '</div>'+
                '</div>';
        }
        else if(this.settings[id].icon=="failure"){
            var html=
                '<div  class="toz-cover-layer toz-second-opacity" id="'+id+'" >'+
                    '<div class="toz-mask" style="display: none"></div>'+
                    '<div class="toz-cover-content">'+
                        '<div class="toz-alert toz-showSweetAlert" data-animation="pop"   style="display: block;">'+
                             '<div class="sa-icon sa-error animateErrorIcon" style="display: block;">'+
                                 '<span class="sa-x-mark animateXMark">'+
                                    '<span class="sa-line sa-left"></span>'+
                                    '<span class="sa-line sa-right"></span>'+
                                 '</span>'+
                            '</div>'+
                            '<div class="toz-title-text">'+
                            ' <h2>'+ this.settings[id].title+'</h2>'+
                            '</div>'+
                            '<div class="toz-content-text">'+
                               ' <p>'+ this.settings[id].content+'</p>'+
                            '</div>'+
                        '</div>'+
                     '</div>'+
                '</div>';
        }
        else if(this.settings[id].icon=="warning"){
            var html=
                '<div  class="toz-cover-layer toz-second-opacity" id="'+id+'">'+
                     '<div class="toz-mask" style="display: none"></div>'+
                     '<div class="toz-cover-content">'+
                          '<div class="toz-alert toz-showSweetAlert" data-animation="pop" style="display: block;">'+
                          '<div class="sa-icon sa-warning pulseWarning" style="display: block;">'+
                               '<span class="sa-body pulseWarningIns"></span>'+
                               '<span class="sa-dot pulseWarningIns"></span>'+
                          '</div>'+
                          '<div class="toz-title-text">'+
                              '<h2>'+ this.settings[id].title+'</h2>'+
                          '</div>'+
                          '<div class="toz-content-text">'+
                             '<p>'+ this.settings[id].content+'</p>'+
                         '</div>'+
                       '</div>'+
                     '</div>'+
                '</div>';
        }
        else if(this.settings[id].icon=="article"){
            var html=
                '<div  class="toz-cover-layer toz-second-opacity"  id="'+id+'">'+
                    '<div class="toz-mask" style="display: none"></div>'+
                    '<div  class="toz-cover-content ">'+
                         '<div class="toz-article">'+
                             '<div class="toz-title-text toz-article-title">'+
                                 '<strong><span class="toz-article-content-title">'+this.settings[id].title+'</span></strong>'+
                             '</div>'+
                             '<div class="toz-article-content">'+
                                ' <iframe class="toz-article-content-iframe" align="center"  src='+this.settings[id].content+' ></iframe>'+
                             '</div>'+
                         '</div>'+
                  ' </div>'+
                '</div>';
        }

        $("body").append(html);

        if(this.settings[id].mask==true){
            $(".toz-mask").show();
        }else{
            $(".toz-mask").hide();
        }

        if(this.settings[id].duration!=-1){
            this.timeOut(this.settings[id].duration,id);
        };

        this.bindEvent(id);
        return id;
    },
    bindEvent:function (id) {
       var that=this;
        $(".toz-cover-content").unbind();
        $(".toz-cover-content").click(function () {
            that.hideToast(id);
        });
    },
    timeOut:function (duration,id) {
        var that=this;
        setTimeout(function() {
            that.hideToast(id);
            }, duration);
    },
    hideToast:function (id) {
        var that=this;
        var d = 0.5;
        if(typeof (id)!="undefined"&&id!=null&&id!=''){
            $("#"+id).css({
                webkitTransition : '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in',
                opacity :'0',
            });

            setTimeout(function() {
                $("#"+id).remove();
                delete that.settings[id];
            }, d * 1000);
        }else{
            $(".toz-cover-layer").css({
                webkitTransition : '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in',
                opacity :'0',
            });

            setTimeout(function() {
                $(".toz-cover-layer").remove();
                that.settings={};
            }, d * 1000);
        }
        // this.settings[id].success();
    },
    genID:function(length){
        return Number(Math.random().toString().substr(3,length) + Date.now()).toString(36);
    },
};
var toz_Toast=new toz_Toast();
