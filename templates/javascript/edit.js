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
    var base = require('../../bower_components/admix-ui/build/base/base');
    var tips = require('../../bower_components/admix-ui/build/tips/tips');
    var datetime = require('../../bower_components/admix-ui/build/base/datetime');

    //统一的接口api管理
    var apimap = require('../../mods/apimap');

    console.log('startAt:'+g_start.getTime()+', jslibloadedAt:'+g_mstart.getTime()+', jsloadedAt:'+new Date().getTime());

    var isEdit = false,   //是否是修改
        isSaving = false, //是否正在提交保存
        now = new Date(),
        next1hour = new Date(now.getTime()+1*3600*1000),
        next7day = new Date(now.getTime()+7*86400*1000);

    var ui = {
        $title : $('#title'),
        $desc : $('#desc'),

        $startTime : $('#startTime'),
        $endTime : $('#endTime'),

        $saveBtn : $('#save')
    };

    var app = {

        /**
         * 启动程序
         * @return {[type]} [description]
         */
        init : function () {
            loading.show();

            if( this.getId() ){
                base.setDocTitle('修改');
                isEdit = true;

                if(typeof(window.renderByNode)==='undefined' || window.renderByNode===false) {
                    this.getData();
                }
                else{
                    loading.hide();
                }
            }
            else {
                ui.$startTime.val( datetime.formatDate('yyyy-MM-ddTHH:mm', next1hour) );
                ui.$endTime.val( datetime.formatDate('yyyy-MM-ddTHH:mm', next7day) );

                //设置字段的显示和隐藏
                this.setFields();

                base.setDocTitle('添加');

                loading.hide();
            }

            this.initEvent();

        },

        /**
         * 初始化事件
         * @return {[type]} [description]
         */
        initEvent : function () {
            var self = this;

            //点击提交按钮
            ui.$saveBtn.tap(function(){
                self.saveData();
            });

            //离开前的提示功能
            window.onbeforeunload = function(){
                return self.hasData() ? '信息未保存，确认放弃保存？' : undefined;
            };

            window.onload = function(){
                window.JSTracker && JSTracker.config('sampling', 1);
                window.JSTracker && JSTracker.config('debug', true);
            }

        },

        /**
         * 字段显示控制
         */
        setFields : function () {

        },

        /**
         * 是否填写了数据
         * @return {Boolean} [description]
         */
        hasData : function () {
            var hasData = ui.$title.val() || ui.$desc.val();
            return hasData && !isEdit;

        },

        /**
         * 检查数据的合法性
         * @return {[type]} [description]
         */
        checkData : function () {
            var title = $.trim( ui.$title.val() ),
                desc = $.trim( ui.$desc.val() ),

                startTime = $.trim( ui.$startTime.val() ),
                endTime = $.trim( ui.$endTime.val() );

            if(startTime){
                startTime = startTime.replace('T',' ');
                //兼容三星的问题
                startTime = startTime.replace('z','')+ ':00';
            }
            if(endTime){
                endTime = endTime.replace('T',' ');
                //兼容三星的问题
                endTime = endTime.replace('z','')+ ':00';
            }

            if(title == ''){
                toast.show('标题不能为空');
                return false;
            }

            if(title.length > 15){
                toast.show('标题不能大于15个字符');
                return false;
            }

            if(desc == ''){
                toast.show('描述不能为空');
                return false;
            }

            if(desc.length > 150){
                toast.show('描述不能大于150个字符');
                return false;
            }

            if(startTime == ''){
                toast.show('开始时间为空或填写不正确');
                return false;
            }

            if(endTime == ''){
                toast.show('结束时间为空或填写不正确');
                return false;
            }

            //优惠券生效时间大于当前时间
            if(base.strToDate(startTime) <= new Date().getTime()){
                toast.show('开始时间不能小于当前时间');
                return false;
            }

            if( base.strToDate(startTime) >= base.strToDate(endTime) ){
                toast.show('结束时间不能小于开始时间');
                return false;
            }

            return {
                title : title,
                desc: desc,
                validityBegin: startTime,
                validityEnd: endTime
            };

        },

        /**
         * 获取ID
         * @return {[type]} [description]
         */
        getId : function () {
            return parseInt( base.getUrlParam('id'), 10 ) || null;
        },

        /**
         * 数据渲染到页面上
         * @param  {[type]} datainfo [数据记录对象]
         * @return {[type]}          [description]
         */
        renderData : function (datainfo) {
            ui.$title.val( datainfo.title );
            ui.$desc.val( datainfo.desc );
            ui.$startTime.val( datetime.formatDate('yyyy-MM-ddTHH:mm',base.strToDate(datainfo.startTime)) );
            ui.$endTime.val( datetime.formatDate('yyyy-MM-ddTHH:mm',base.strToDate(datainfo.endTime)) );

            this.setFields();

        },

        /**
         * 加载失败信息到页面上
         * @param  {[type]} errorMsg [出错信息]
         * @return {[type]}          [description]
         */
        renderError : function(errorMsg){
            toast.show(errorMsg);
        },

        /**
         * 拉取数据
         * @return {[type]} [description]
         */
        getData : function () {
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
                                self.setGetDataFailed();
                            }
                        }
                        catch(e){
                            self.renderError('出错了：'+JSON.stringify(e));
                            self.setGetDataFailed();
                        }
                    }
                    //错误的数据格式
                    else{
                        var msg = '返回的数据格式错误';
                        self.renderError(msg);
                        self.setGetDataFailed();
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

                    self.setGetDataFailed();

                    self.renderError('出错了：'+JSON.stringify(e));
                }
            );

        },

        /**
         * 编辑状态下拉取数据失败
         * @param {Boolean} isFailed [description]
         */
        setGetDataFailed : function () {
            this.getDataFailed = true;
        },

        /**
         * 保存数据
         * @return {[type]} [description]
         */
        saveData : function () {
            var self = this;

            //判断拉取数据时是否失败了，如果失败了是不能提交的
            if(isEdit && self.getDataFailed) {
                toast.show('获取数据失败了，无法提交修改');
                return;
            }

            var result = self.checkData();
            //console.log(result);

            if(!result) { return; }

            if(isSaving) { return; }

            isSaving = true;
            loading.show();

            apimap.updateApi.data = result;

            if(isEdit){
                apimap.updateApi.data.eticketId = self.getId();
                apimap.updateApi.data.eticketType = 1;
            }

            mtop.request(apimap.updateApi,
                function (resJson, retType) {
                    console.log(resJson);

                    loading.hide();
                    isSaving = false;

                    //清除返回事件
                    window.onbeforeunload  = null;

                    var retData = resJson ? resJson.data : {};

                    //返回的数据是ok的
                    if(retData.failure === 'false'){
                        tips.show({
                            type: 'success',
                            title: '提交成功',
                            text: '你的信息已成功提交',
                            callback: function(){
                                window.location.href = 'list.html';
                            }
                        });
                    }
                    //错误的数据格式
                    else{
                        var msg = retData.errorDesc || '后台返回错误';
                        tips.show({
                            type: 'error',
                            title: '提交失败',
                            text: msg
                        });
                    }
                },
                function (resJson, retType) {
                    console.log(resJson);

                    loading.hide();
                    isSaving = false;

                    if(retType === 1 || retType === 2){
                        toast.show('session失效，请重新登录');
                        login.goLogin();
                        return;
                    }

                    var msg = '后台返回错误';
                    if(resJson.data && resJson.data.errorDesc){
                        msg = resJson.data.errorDesc;
                    }

                    //清除返回事件
                    window.onbeforeunload  = null;

                    tips.show({
                        type: 'error',
                        title: '提交失败',
                        text: msg
                    });
                }
            );
        }

    };

    app.init();

});