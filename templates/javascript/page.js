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

    console.log('startAt:'+g_start.getTime()+', jslibloadedAt:'+g_mstart.getTime()+', jsloadedAt:'+new Date().getTime());

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
                sample: 1, // 全部上报
            });

        }

    };

    app.init();

});
