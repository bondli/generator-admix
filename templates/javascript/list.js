/**
 * @jsdoc function
 * @name <%= appname %>.page:<%= pageName %>
 * @description
 * # <%= classedName %>
 * page of the <%= appname %>
 */
define(function(require, exports, module) {
    // 通过 require 引入依赖
    var console = require('../../bower_components/admix-ui/build/console/console');
    var mtop = require('../../bower_components/admix-ui/build/mtop/mtop');
    var login = require('../../bower_components/admix-ui/build/login/login');
    var loading = require('../../bower_components/admix-ui/build/loading/loading');
    var toast = require('../../bower_components/admix-ui/build/toast/toast');
    var lazyload = require('../../bower_components/admix-ui/build/lazyload/lazyload');
    var modal = require('../../bower_components/admix-ui/build/modal/modal');
    var monitor = require('../../bower_components/admix-ui/build/scrollmonitor/scrollmonitor');

    //统一的接口api管理
    var apimap = require('../../mods/apimap');
    var listTmpl = require('./tpls/index.jst');

    console.log('startAt:'+g_start.getTime()+', jslibloadedAt:'+g_mstart.getTime()+', jsloadedAt:'+new Date().getTime());

    var totalItems = 0,
        curPage = 1,
        pageSize = 6; //默认一页的数据

    var ui = {
        $datalist : $('#datalist'),
        $loadmore : $('#loadmore'),
        $nodata : $('#nodata'),
        $listTmpl : $('#listTpl')
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
            else{
                totalItems = parseInt($('#dataCount').val(), 10);
                curPage = 2; //因为直出的时候已经把第一页加载好了，所以这里是2
                lazyload('.lazyloader', {attr: 'data-src'});
            }

            this.initEvent();

        },

        /**
         * 初始化页面点击事件
         * @return {[type]} [description]
         */
        initEvent : function () {
            var self = this;
            //删除
            $('body').on('tap', '.delete', function(){
                var id = $(this).attr('_val');
                modal.confirm({'title':'确认删除该记录?','body':'删除后将无法恢复'}, function(){
                    self.deleteData(id);
                });
            });

            //编辑
            $('body').on('tap', '.edit', function(){
                var id = $(this).attr('_val');
                window.location.href = 'edit.html?id='+id;
            });

            //滚动监控
            monitor.init({
                'scrollToBottom': function(){

                    if(curPage > Math.ceil(totalItems/pageSize)){
                        monitor.stop();
                        if(totalItems > 0){
                            ui.$loadmore.html('没有更多数据了');
                        }
                        return;
                    }

                    loading.show({
                        renderTo: '#loadmore'
                    });

                    self.getData(function(){
                        monitor.after();
                        loading.hide();
                    });
                }
            });

            window.onload = function(){
                window.JSTracker && JSTracker.config('sampling', 1);
                window.JSTracker && JSTracker.config('debug', true);
            }

        },

        /**
         * 删除
         * @param  {[type]} id [记录ID]
         * @return {[type]}    [description]
         */
        deleteData : function (id) {
            var self = this;

            apimap.deleteApi.data = {'id': id};

            mtop.request(apimap.deleteApi,
                function (resJson, retType) {
                    console.log(resJson);
                    self.afterDelete(id);
                    tips.show({
                        type : 'success',
                        title : '操作成功',
                        text : '该数据记录已被成功删除!'
                    });
                },
                function (resJson, retType) {
                    console.log(resJson);
                    tips.show({
                        type : 'error',
                        title : '删除失败，请稍后再试',
                        text : '失败原因：'+JSON.stringify(resJson)
                    });
                }
            );

        },

        /**
         * 删除后的处理
         * @param  {[type]} id [记录ID]
         * @return {[type]}    [description]
         */
        afterDelete : function (id) {
            $('#data-item-'+id).remove();
            //如果没有任何记录了需要把没有数据的提示显示出来
            if( ui.$datalist.find('li').length === 0 ){
                this.setNoData(true);
            }

        },

        /**
         * 设置无数据的显示
         * @param {Boolean} isNodata [description]
         */
        setNoData : function (isNodata, msg) {
            if(isNodata){
                ui.$nodata.show();
                if(msg){
                    ui.$nodata.find('div').text(msg);
                }
            }
            else {
                ui.$nodata.hide();
            }

        },

        /**
         * 数据渲染到页面上
         * @param  {[type]} datalist [查询到的数据列表]
         * @return {[type]}          [description]
         */
        renderData : function (datalist) {
            var r = listTmpl({list: datalist});
            ui.$datalist.append(r);

            lazyload('.lazyloader', {attr: 'data-src'});

        },

        /**
         * 加载失败信息到页面上
         * @param  {[type]} errorMsg [错误信息]
         * @return {[type]}          [description]
         */
        renderError : function(errorMsg){
            toast.show(errorMsg);
            this.setNoData(true, errorMsg);

        },

        /**
         * 拉取数据列表
         * @param  {Function} callback [成功后的处理函数]
         * @return {[type]}            [description]
         */
        getData : function (callback) {
            var self = this;

            apimap.listApi.data = {
                'pageNo': curPage,
                'pageSize': pageSize
            };

            mtop.request(apimap.listApi,
                function (resJson, retType) {
                    console.log(resJson);

                    loading.hide();

                    var retData = resJson ? resJson.data : {};

                    //返回的数据是ok的
                    if(retData.failure == 'false' && retData.module && retData.module.length){
                        var datalist = retData.module;

                        //获取总记录数
                        totalItems = retData.totalCount - 0;

                        if(totalItems && datalist.length){
                            self.renderData(datalist);
                            self.setNoData(false);
                        }
                        else{
                            self.setNoData(true, '还没有任何数据');
                        }

                        callback && callback();

                        //更新当前页码
                        curPage++;
                    }
                    //错误的数据格式
                    else{
                        var msg = '返回的数据格式错误';
                        if(retData && retData.message){
                            msg = retData.message;
                        }
                        if(curPage === 1){
                            self.renderError(msg);
                        }
                        else{
                            toast.show(msg);
                        }
                    }
                },
                function (resJson, retType) {
                    console.log(resJson);

                    loading.hide();

                    if(retType === 1 || retType === 2){
                        toast.show('session失效，请重新登录');
                        login.goLogin();
                        return;
                    }

                    var err = resJson.ret || ['null::后端返回错误'];
                    var errMsg = err[0].split('::');
                    var msg = errMsg[1];

                    if(resJson.data && resJson.data.errorDesc){
                        msg = resJson.data.errorDesc;
                    }

                    self.renderError(msg);
                }
            );

        }

    };

    app.init();

});