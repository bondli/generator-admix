'use strict';
var path = require('path');
var util = require('util');
var ScriptBase = require('../script-base.js');
var utils = require('../util.js');

var Generator = module.exports = function Generator() {
  ScriptBase.apply(this, arguments);
  this.pageName = (this.classedName).toLowerCase();
};

util.inherits(Generator, ScriptBase);

Generator.prototype.createPageFiles = function createPageFiles() {
  this.htmlTemplate(
    'page.html',
    path.join(this.name + '.html')
  );

  this.appTemplate(
    'page.js',
    path.join('pages', this.name, 'index.js')
  );

  this.appTemplate(
    'page.less',
    path.join('pages', this.name, 'index.less')
  );
};

