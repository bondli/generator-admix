'use strict';
var path = require('path');
var util = require('util');
var ScriptBase = require('../script-base.js');
var angularUtils = require('../util.js');

var Generator = module.exports = function Generator() {
  ScriptBase.apply(this, arguments);
};

util.inherits(Generator, ScriptBase);

Generator.prototype.createModFiles = function createModFiles() {
  if(arguments.length === 2){
    //在页面中创建模块
    var pageName = arguments[1];
    this.appTemplate(
      'mod.js',
      path.join('pages', pageName + '/mods', this.name + '.js')
    );
    return;
  }
  //在项目中创建模块
  this.appTemplate(
    'mod.js',
    path.join('mods', this.name + '.js')
  );
};
