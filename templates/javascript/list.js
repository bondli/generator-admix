/**
 * @jsdoc function
 * @name <%= appname %>.page:<%= pageName %>
 * @description
 * # <%= classedName %>
 * page of the <%= appname %>
 */
define(function(require, exports, module) {
    // 通过 require 引入依赖
    var console = require('../../bower_components/admix-ui/build/console');
    var base = require('../../bower_components/admix-ui/build/base');
    var nodata = require('../../bower_components/admix-ui/build/nodata');
    var loading = require('../../bower_components/admix-ui/build/loading');
    var toast = require('../../bower_components/admix-ui/build/toast');
    var lazyload = require('../../bower_components/admix-ui/build/lazyload');
    var actionsheet = require('../../bower_components/admix-ui/build/actionsheet');
    var monitor = require('../../bower_components/admix-ui/build/scrollmonitor');

    var apimap = require('../../mods/apimap');
    var tmpl = require('./tpls/index.jst');

    g_mend = new Date();
    console.log('startAt:'+g_start.getTime()+', jslibloadedAt:'+g_mstart.getTime()+', jsloadedAt:'+g_mend.getTime());

    var curType = '', //当前查询订单的类型
        totalItems = 0,
        curPage = 1,
        pageSize = 6; //默认一页的数据

    var ui = {
        $datalist : $('#datalist'),
        $queryTab : $('.bar-nav .nav-item'),
        $loadmore : $('#loadmore')
    };

    var app = {

        /**
         * 启动程序
         * @return {[type]} [description]
         */
        init : function () {
            if(typeof(window.renderByNode)==='undefined' || window.renderByNode===false) {
                loading.show();
                this.getData();
            }
            else {
                totalItems = parseInt($('#dataCount').val(), 10);
                curPage = 2;
                lazyload('.J_lazyloader', {attr: 'data-src'});
            }

            this.initEvent();

        },

        /**
         * 初始化页面点击事件
         * @return {[type]} [description]
         */
        initEvent : function () {

            window.__WPO.setConfig({
                sample: 1, // 全部上报
            });

            //自定义测速上报
            window.onload = function () {
                window.__WPO.speed(0, g_mstart.getTime() - g_start.getTime()); //样式，框架耗时
                window.__WPO.speed(1, g_mend.getTime() - g_mstart.getTime());  //模块加载耗时
                window.__WPO.speed(2, new Date().getTime() - g_mend.getTime());//页面执行耗时
            }

            var self = this;

            //删除优惠券
            $('body').on('tap', '.J_delete', function(){
                var id = $(this).attr('_val'),
                    type = $(this).attr('_type');

                actionsheet.show({
                    title: '你将删除改记录，删除后无法恢复',
                    list: [
                        {
                            "name" : "确认删除",
                            "callback" : function(){
                                self.deleteData(id, type);
                            }
                        },
                    ],
                    cancelWord: '取消'
                });
            });

            //编辑优惠券
            $('body').on('tap', '.J_edit', function(){
                var id = $(this).attr('_val'),
                    type = $(this).attr('_type');

                window.location.href = 'edit.html?id='+id+'&type='+type;
            });

            //点击tab切换数据
            self.switchTabEvent();

            //滚动加载
            self.scollPageEvent();

        },

        /**
         * 切换tab事件
         * @return {[type]} [description]
         */
        switchTabEvent : function () {
            var self = this;

            ui.$queryTab.tap(function(){
                var $me = $(this);

                if($me.hasClass('active')){
                    return;
                }

                //先清除原来的数据
                ui.$datalist.html('');

                loading.show();

                curType = $me.attr('_val');
                curPage = 1;

                $me.siblings().removeClass('active');
                $me.addClass('active');

                //重新打开 monitor
                monitor.reopen();
                ui.$loadmore.html('');

                self.getData();

            });

        },

        /**
         * 滚动页面事件
         * @return {[type]} [description]
         */
        scollPageEvent : function () {
            var self = this;

            monitor.init({
                'scrollToBottom': function(){

                    if(curPage > Math.ceil(totalItems/pageSize)){
                        monitor.stop();
                        if(totalItems){
                            ui.$loadmore.html('没有更多数据了');
                        }
                        return;
                    }

                    ui.$loadmore.html('');
                    loading.show({
                        renderTo: '#loadmore'
                    });

                    self.getData(function(){
                        monitor.after();
                        loading.hide();
                    });
                }
            });

        },

        /**
         * 删除数据
         * @param  {[type]} id [description]
         * @param  {[type]} type [description]
         * @return {[type]}    [description]
         */
        deleteData : function (id, type) {
            var self = this,
                apiInfo = apimap.deleteApi;

            apiInfo.data = {
                eticketId: id,
                eticketType: type
            };

            xmtop(apiInfo,
                function (resJson, retType) {
                    console.log(resJson);
                    self.afterDelete(id);
                    toast.show('操作成功，该记录已被删除!');
                },
                function (resJson, retType, errMsg) {
                    console.log(resJson);

                    toast.show(errMsg);
                }
            );

        },

        /**
         * 删除后的处理
         * @param  {[type]} id [description]
         * @return {[type]}    [description]
         */
        afterDelete : function (id) {
            $('#data-item-'+id).remove();
            //如果没有任何记录了需要把没有数据的提示显示出来
            if( $('#datalist ul').length === 0 ){
                nodata.show();
            }

        },

        /**
         * 数据渲染到页面上
         * @param  {[type]} datalist [description]
         * @return {[type]}          [description]
         */
        renderData : function (datalist) {
            var r = tmpl({list: datalist});
            ui.$datalist.append(r);
            lazyload('.J_lazyloader', {attr: 'data-src'});

            if(datalist.length == pageSize){ //可能还有下一页
                ui.$loadmore.html('上拉加载更多');
            }

        },

        /**
         * 加载失败信息到页面上
         * @param  {[type]} errorMsg [description]
         * @return {[type]}          [description]
         */
        renderError : function(errorMsg){
            toast.show(errorMsg);
            nodata.show(errorMsg);

        },

        /**
         * 拉取数据数据
         * @return {[type]} [description]
         */
        getData : function (callback) {
            var self = this,
                apiInfo = apimap.listApi;

            apiInfo.data = {
                'pageNo': curPage,
                'pageSize': pageSize,
                'status': curType
            };

            xmtop(apiInfo,
                function (resJson, retType) {
                    console.log(resJson);

                    loading.hide();

                    var retData = resJson ? resJson.data : {};

                    //返回的数据是ok的
                    if((retData.failure == 'false' || retData.failure == false) && retData.module){
                        var datalist = retData.module;

                        //获取总记录数
                        totalItems = retData.totalCount - 0;

                        if(totalItems && datalist.length){
                            self.renderData(datalist);
                            nodata.hide();
                        }
                        else{
                            nodata.show('还没有任何优惠券');
                        }

                        callback && callback();

                        //更新当前页码
                        curPage++;
                    }
                    else{
                        var msg = '后端服务异常，请稍后再试';
                        if(retData && retData.errorDesc){
                            msg = retData.errorDesc;
                        }
                        self.renderError(msg);
                    }
                },
                function (resJson, retType, errMsg) {
                    console.log(resJson);

                    loading.hide();

                    self.renderError(errMsg);
                }
            );

        }

    };

    app.init();

});