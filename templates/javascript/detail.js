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
    var stpl = require('../../bower_components/admix-ui/build/stpl/stpl');
    var modal = require('../../bower_components/admix-ui/build/modal/modal');
    var base = require('../../bower_components/admix-ui/build/base/base');
    var tips = require('../../bower_components/admix-ui/build/tips/tips');

    //统一的接口api管理
    var apimap = require('../../mods/apimap');

    console.log('startAt:'+g_start.getTime()+', jslibloadedAt:'+g_mstart.getTime()+', jsloadedAt:'+new Date().getTime());

    var ui = {
        $datainfo : $('#datainfo'),
        $actions : $('#actions'),
        $nodata : $('#nodata'),
        $datainfoTmpl : $('#datainfoTpl'),
        $actionsTmpl : $('#actionsTpl')
    };

    var app = {

        /**
         * 启动程序
         * @return {[type]} [description]
         */
        init : function () {
            this.getData();
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
                var id = $(this).attr('_val'),
                    type = $(this).attr('_type');
                modal.confirm({'title':'确认删除该记录?','body':'删除后将无法恢复'}, function(){
                    self.deleteData(id, type);
                });
            });

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
         * @return {[type]}    [description]
         */
        afterDelete : function () {
            window.location.replace('list.html');
        },

        /**
         * 设置无数据的显示
         * @param {Boolean} isNodata [description]
         */
        setNoData : function (isNodata) {
            if(isNodata){
                ui.$nodata.show();
            }
            else {
                ui.$nodata.hide();
            }

        },

        /**
         * 数据渲染到页面上
         * @param  {[type]} datainfo [数据记录对象]
         * @return {[type]}          [description]
         */
        renderData : function (datainfo) {
            var self = this,
                dataTmpl = ui.$datainfoTmpl.html(),
                oprTmpl = ui.$actionsTmpl.html();

            var r = stpl(dataTmpl, {datainfo: datainfo});
            ui.$datainfo.html(r);

            var s = stpl(oprTmpl, {datainfo: datainfo});
            ui.$actions.show().html(s);

        },

        /**
         * 加载失败信息到页面上
         * @param  {[type]} errorMsg [出错信息]
         * @return {[type]}          [description]
         */
        renderError : function(errorMsg){
            toast.show(errorMsg);
            this.setNoData(true);

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

            mtop.request(apimap.detailApi,
                function (resJson, retType) {
                    console.log(resJson);

                    loading.hide();

                    var retData = resJson ? resJson.data : {};

                    //返回的数据是ok的
                    if(retData.failure == 'false' && retData.module){
                        try{
                            var datainfo = retData.module;

                            if(datainfo){
                                self.renderData(datainfo);
                            }
                            else{
                                self.setNoData(true);
                            }
                        }
                        catch(e){
                            self.renderError('出错了：'+JSON.stringify(e));
                        }
                    }
                    //错误的数据格式
                    else{
                        var msg = '返回的数据格式错误';
                        self.renderError(msg);
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

                    self.renderError('出错了：'+JSON.stringify(e));
                }
            );

        }

    };

    app.init();

});