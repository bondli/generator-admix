# admix generator


> Yeoman generator for admix project - lets you quickly set up a project with sensible defaults and best practices.

**构建成功后的工程目录结构说明：**

```
|- project-name/                #项目目录
  |- app/
    |- bower_components         #外部组件
    |- mods                     #项目组件
    |- pages                    #页面JS
  |- htmls                      #页面文件
  |- htmls-dist                 #打包后的页面文件
  |- node_modules
  |- .bowerrc
  |- .editorconfig
  |- .gitattributes
  |- .gitignore
  |- .jshintrc
  |- bower.json
  |- Gruntfile.js
  |- package.json
  |- README.md

```

## Usage

Install `generator-admix`:
```
npm install -g generator-admix
```

Make a new directory, and `cd` into it:
```
mkdir my-new-project && cd $_
```

Run `yo admix`, optionally passing an app name:
```
yo admix [app-name]
```

`grunt build` must be run before anything else due to dependency population.

Run `grunt` for building and `grunt serve` for preview


## Generators

Available generators:

* [admix](#app) (aka [admix:app](#app))
* [admix:page](#page)
* [admix:mod](#mod)

**Note: Generators are to be run from the root directory of your app.**

