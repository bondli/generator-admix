## admix 移动端项目 ( zepto + seajs + F7 )

### 构建项目前提条件
```bash
sudo npm install -g yo
sudo npm install -g grunt-cli
sudo npm install -g bower
sudo npm install -g generator-admix
```

### 初始化项目后要做的事情
* bower install
* npm install (为了避免报错，请先修改.npm目录的权限：sudo chmod -R 777 /Users/用户名/.npm/)

### 开发流程

```bash
grunt
```

* 新增page：
```bash
yo admix:page mainpage
```

* 新增mods：
```bash
yo admix:mod user
```

### 构建
```bash
grunt build
```

### 安装ui组件
```bash
bower install git://github.com/bondli/admix-ui.git#daily/0.0.2
```

### 交互规范

* 1、前端校验错误统一是toast提示；
* 2、后端校验错误统一是modal.alert框提示，一般不会出现，除非提交时接口有定义校验出错；
* 3、后端成功是tips.show({type:’success’})，失败是tips.show({type:’error’})；
* 4、数据删除前统一给出modal.confirm()提示，确认后才删除；
* 5、列表页下拉触顶时出现搜索框，上拉时隐藏，ios没有搜索按钮，android是有的，提交搜索是到搜索页面；
* 6、搜索页面中默认就有搜索框，并且带过来搜索条件，提交时需要把location.replace掉；
* 7、页面无数据，或者查询失败，调用setNodata(true); 并且给错toast提示即可；
* 8、所有页面发接口请求必须有loading.show()；
* 9、提交数据保存的按钮一定要做防止快速双击处理，避免数据多次提交；
* 10、页面操过一屏的单个操作按钮是吸底的，一直要出现；
* 11、tab切换的都是吸顶，一直要出现；
