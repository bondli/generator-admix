## admix 移动端项目 ( zepto + seajs + F7 )

### 构建项目前提条件
```bash
sudo npm install -g yo
sudo npm install -g grunt-cli
sudo npm install -g bower
```

### 初始化项目后要做的事情
* bower install
* npm install (为了避免报错，请先修改.npm目录的权限：sudo chmod -R 777 /Users/用户名/.npm/)

### 开发流程

```bash
grunt serve
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
bower install git://github.com/bondli/admix-ui.git#daily/0.0.1
```
