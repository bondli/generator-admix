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
    var dialog = require('../../bower_components/admix-ui/build/dialog');
    var tips = require('../../bower_components/admix-ui/build/tips');

    //统一的接口api管理
    var apimap = require('../../mods/apimap');
    var infoTmpl = require('./tpls/index.jst');

    g_mend = new Date();
    console.log('startAt:'+g_start.getTime()+', jslibloadedAt:'+g_mstart.getTime()+', jsloadedAt:'+g_mend.getTime());

    var ui = {
        $body : $('body')
    };

    var app = {

        /**
         * 启动程序
         * @return {[type]} [description]
         */
        init : function () {
            if(typeof(window.renderByNode)==='undefined' || window.renderByNode===false) {
                this.getData();
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
            $('body').on('tap', '.J_delete', function(){
                var id = $(this).attr('_val'),
                    type = $(this).attr('_type');

                dialog.confirm({'title':'确认删除该记录?','body':'删除后将无法恢复'}, function(){
                    self.deleteData(id, type);
                });
            });

            window.__WPO.setConfig({
                sample: 1 // 全部上报
            });

            //自定义测速上报
            window.onload = function () {
                window.__WPO.speed(0, g_mstart.getTime() - g_start.getTime()); //样式，框架耗时
                window.__WPO.speed(1, g_mend.getTime() - g_mstart.getTime());  //模块加载耗时
                window.__WPO.speed(2, new Date().getTime() - g_mend.getTime());//页面执行耗时
            }

        },

        /**
         * 获取ID
         * @return {[type]} [description]
         */
        getId : function () {
            return parseInt( base.getUrlParam('id'), 10 ) || null;
        },

        /**
         * 删除记录
         * @param  {[type]} id [记录ID]
         * @return {[type]}    [description]
         */
        deleteData : function (id) {
            var self = this;

            apimap.deleteApi.data = {'id': id};

            xmtop(apimap.deleteApi,
                function (resJson, retType) {
                    console.log(resJson);
                    self.afterDelete(id);
                    tips.show({
                        type : 'success',
                        title : '操作成功',
                        text : '该数据记录已被成功删除!'
                    });
                },
                function (resJson, retType, errMsg) {
                    console.log(resJson);
                    tips.show({
                        type : 'error',
                        title : '删除失败，请稍后再试',
                        text : '失败原因：' + errMsg
                    });
                }
            );

        },

        /**
         * 删除后的处理
         * @return {[type]}    [description]
         */
        afterDelete : function () {
            window.location.replace('list.html');
        },

        /**
         * 数据渲染到页面上
         * @param  {[type]} datainfo [数据记录对象]
         * @return {[type]}          [description]
         */
        renderData : function (datainfo) {
            var self = this;

            var r = infoTmpl({datainfo: datainfo});
            ui.$body.html(r);

        },

        /**
         * 加载失败信息到页面上
         * @param  {[type]} errorMsg [出错信息]
         * @return {[type]}          [description]
         */
        renderError : function(errorMsg){
            toast.show(errorMsg);
            nodata.show(errorMsg);

        },

        /**
         * 拉取数据
         * @return {[type]} [description]
         */
        getData : function () {
            loading.show();

            var self = this;

            apimap.detailApi.data = {
                'eticketId': self.getId(),
                'eticketType': 1
            };

            xmtop(apimap.detailApi,
                function (resJson, retType) {
                    console.log(resJson);

                    loading.hide();

                    var retData = resJson ? resJson.data : {};

                    //返回的数据是ok的
                    if(retData.failure == 'false' && retData.module){
                        var datainfo = retData.module;

                        if(datainfo){
                            self.renderData(datainfo);
                        }
                        else{
                            nodata.show('获取数据失败，可能是被删除了');
                        }
                    }
                    //错误的数据格式
                    else{
                        var msg = '返回的数据格式错误';
                        self.renderError(msg);
                    }
                },
                function (resJson, retType, errMsg) {
                    console.log(resJson);

                    loading.hide();

                    self.renderError('出错了：' + errMsg);
                }
            );

        }

    };

    app.init();

});