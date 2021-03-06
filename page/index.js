'use strict';
var path = require('path');
var util = require('util');
var ScriptBase = require('../script-base.js');
var utils = require('../util.js');

var Generator = module.exports = function Generator() {
  ScriptBase.apply(this, arguments);
  this.name = (this.name).replace('.html','');
  this.pageName = (this.name).toLowerCase();
};

util.inherits(Generator, ScriptBase);

Generator.prototype.createPageFiles = function createPageFiles() {

  this.name = (this.name).replace('.html','');

  var htmlFile = 'page.html',
    jsFile = 'page.js',
    scssFile = 'page.scss',

    tmpName = (this.name).toLowerCase();

  if(tmpName.indexOf('list') > -1){ //list
    htmlFile = 'list.html';
    jsFile = 'list.js';
    scssFile = 'list.scss';
  }
  else if(tmpName.indexOf('detail') > -1){ //detail
    htmlFile = 'detail.html';
    jsFile = 'detail.js';
    scssFile = 'detail.scss';
  }
  else if(tmpName.indexOf('edit') > -1){ //edit
    htmlFile = 'edit.html';
    jsFile = 'edit.js';
    scssFile = 'edit.scss';
  }


  this.htmlTemplate(
    htmlFile,
    path.join(this.name + '.html')
  );

  this.appTemplate(
    jsFile,
    path.join('pages', this.name, 'index.js')
  );

  this.appTemplate(
    scssFile,
    path.join('pages', this.name, 'index.scss')
  );

  //增加模版文件
  if(tmpName.indexOf('list') > -1){ //list
    this.appTemplate(
      'list.jst.html',
      path.join('pages', this.name, 'tpls', 'index.jst.html')
    );
  }
  else if(tmpName.indexOf('detail') > -1){ //detail
    this.appTemplate(
      'detail.jst.html',
      path.join('pages', this.name, 'tpls', 'index.jst.html')
    );
  }
  else {
    this.appTemplate(
      'empty.jst.html',
      path.join('pages', this.name, 'tpls', 'index.jst.html')
    );
  }
};

