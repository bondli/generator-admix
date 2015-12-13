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

    var g_mend = new Date();
    console.log('startAt:'+g_start.getTime()+', jslibloadedAt:'+g_mstart.getTime()+', jsloadedAt:'+g_mend.getTime());

    var app = {

        /**
         * 启动程序
         * @return {[type]} [description]
         */
        init : function () {
            if(typeof(window.renderByNode)==='undefined' || window.renderByNode===false) {
                //loading.show();
                //this.getData();
            }

            this.initEvent();

        },

        /**
         * 初始化页面点击事件
         * @return {[type]} [description]
         */
        initEvent : function () {

            window.__WPO.setConfig({
                sample: 1 // 全部上报
            });

            //自定义测速上报
            window.onload = function () {
                window.__WPO.speed(0, g_mstart.getTime() - g_start.getTime()); //样式，框架耗时
                window.__WPO.speed(1, g_mend.getTime() - g_mstart.getTime());  //模块加载耗时
                window.__WPO.speed(2, new Date().getTime() - g_mend.getTime());//页面执行耗时
            };

        }

    };

    app.init();

});
