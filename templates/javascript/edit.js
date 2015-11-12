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
    var loading = require('../../bower_components/admix-ui/build/loading');
    var toast = require('../../bower_components/admix-ui/build/toast');
    var tips = require('../../bower_components/admix-ui/build/tips');
    var datetime = require('../../bower_components/admix-ui/build/datetime');
    var FormValid = require('../../bower_components/admix-ui/build/formvalid');
    var Picker = require('../../bower_components/admix-ui/build/picker');
    var Calendar = require('../../bower_components/admix-ui/build/calendar');

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

        $type : $('#type'),
        $price : $('#price'),

        $saveBtn : $('#save')
    };

    //表单验证处理
    var fv = new FormValid({
        handAllResult: function(errors){
            if(errors.length){
                toast.show(errors[0].msg);
            }
        },
        handFieldResult: function(elem, msg, isShow){
            //isShow && console.log(msg);
        }
    });

    //选类型
    var pickerType = new Picker({
        input: '#type',
        data: {
            1 : '兑换券',
            2 : '代金券',
            3 : '满折券',
            4 : '满减券'
        }
    });

    var app = {

        /**
         * 启动程序
         * @return {[type]} [description]
         */
        init : function () {

            if( this.getId() ){
                base.setDocTitle('修改');
                isEdit = true;

                if(typeof(window.renderByNode)==='undefined' || window.renderByNode===false) {
                    this.getData();
                }
                else {
                    //从页面JS中获取数据
                    if(datainfoByNode){
                        this.renderData(datainfoByNode);
                    }
                }
            }
            else {
                this.renderData({
                    title : '',
                    desc : '',
                    startTime : datetime.formatDate('yyyy-MM-dd HH:mm', next1hour),
                    endTime : datetime.formatDate('yyyy-MM-dd HH:mm', next7day)
                });

                base.setDocTitle('添加');
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

            window.__WPO.setConfig({
                sample: 1 // 全部上报
            });

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

            if(desc.length > 150){
                toast.show('描述不能大于150个字符');
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
                eticketType: $.trim( ui.$type.attr('_val') ),
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
            ui.$startTime.val( datetime.formatDate('yyyy-MM-dd HH:mm',base.strToDate(datainfo.startTime)) );
            ui.$endTime.val( datetime.formatDate('yyyy-MM-dd HH:mm',base.strToDate(datainfo.endTime)) );

            //设置默认选中的类型
            if(datainfo.type){
                pickerType.setValue(datainfo.type - 0);
            }

            //选时间
            var startTimePicker = new Calendar({
                input: '#startTime',
                type: 'datetime'
            });
            var endTimePicker = new Calendar({
                input: '#endTime',
                type: 'datetime'
            });

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

            loading.show();

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
                            self.renderError('出错了：返回的数据格式错误');
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
                function (resJson, retType, errMsg) {
                    console.log(resJson);

                    loading.hide();

                    self.setGetDataFailed();

                    self.renderError('出错了：'+errMsg);
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

            var b = fv.checkAll();
            if(!b){
                //toast.show('表单验证不通过');
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

            xmtop(apimap.updateApi,
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
                function (resJson, retType, errMsg) {
                    console.log(resJson);

                    loading.hide();
                    isSaving = false;

                    //清除返回事件
                    window.onbeforeunload  = null;

                    tips.show({
                        type: 'error',
                        title: '提交失败',
                        text: errMsg
                    });
                }
            );

        }

    };

    app.init();

});