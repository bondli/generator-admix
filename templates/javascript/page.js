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

            window.onload = function(){
                window.JSTracker && JSTracker.config('sampling', 1);
                window.JSTracker && JSTracker.config('debug', true);
            }
            
        }

    };

    app.init();

});
