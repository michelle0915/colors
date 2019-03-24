const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const colorai_dl = require('./colorai_dl.js');
require('date-utils');

// ニューラルネットの作成・ロード
var network = colorai_dl.NeuralNet();
loadSetting(network);
var timestamp = new Date().toFormat('YYYYMMDDHH24MISS'); // 設定ファイルバックアップ作成に使用

// server setting and run
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.listen(80);
console.log("server runnnig");

// リクエストを受け付けるページの登録
function requestPage(app, urlpath, filepath) {
    var contentTypeMap = {
        html: 'text/html',
        css: 'text/css',
        js: 'text/javascript',
        gif: 'image/gif',
    }

    // ファイルの拡張子からContent-Typeを指定
    var ext = filepath.match(/\.[^.]+$/)[0].slice(1);
    var contentType = contentTypeMap[ext] || 'text/plain';

    app.get(urlpath, function(req, res) {

        var handler = function(err, data) {
            res.writeHead(200, {'Content-Type': contentType});
            res.write(data);
            res.end();
        };
        if (contentType === 'image/gif') {
            fs.readFile(filepath, handler);
        } else {
            fs.readFile(filepath, 'utf-8', handler);
        }
    });
}
requestPage(app, '/', './index.html');
requestPage(app, '/css/colorai_client.css', './css/colorai_client.css');
requestPage(app, '/js/colorai_client.js', './js/colorai_client.js');
requestPage(app, '/waiting.gif', './waiting.gif');

requestPage(app, '/manager', './manager.html');
requestPage(app, '/css/colorai_manager.css', './css/colorai_manager.css');
requestPage(app, '/js/colorai_manager.js', './js/colorai_manager.js');

// インデックスと色の対応
var colors = {
    0: "white",
    1: "black",
    2: "red",
    3: "yellow",
    4: "green",
    5: "blue",
    6: "purple",
};

// POST by Ajax
// 推論
app.post('/query', function(req, res) {

//    console.log(req.body);
    var rgb = req.body.rgb;

    // RGB値をそれぞれ0~1の値に正規化
    var x = rgb.map(x => x / 255);
    var y = network.predict(x);
//    console.log(y);
    var result = colors[maxAt(y)];

    // response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        result: result
    }));
});

// 学習
app.post('/train', function(req, res) {

//    console.log(req.body);
    var rgb = req.body.rgb;
    var label = req.body.label;

    // rgbをそれぞれ0~1の値に正規化
    var x = rgb.map(x => x / 255);
    var t = [];
    // labelをone-hot表現に変換
    for (var i = 0; i < Object.keys(colors).length; i++) {
        t[i] = (i === label) ? 1 : 0;
    }
    console.log('========train start========');
    network.train(x, t);
//    heavy();
    console.log('========train finish========');

    // response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        success: true
    }));
});

// ニューラルネットパラメータ要求
app.post('/params', function(req, res) {

    var params = network.export();
    console.log(params);

    // response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        params: params
    }));
});

// 保存
app.post('/save', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    backupSetting(timestamp);
    timestamp = new Date().toFormat('YYYYMMDDHH24MISS');
    fs.writeFileSync('./save.json', JSON.stringify(network.export(), null, '    '));

    // response
    res.send(JSON.stringify({
        success: true
    }));
});

// 配列の中から最大値を持つ要素のインデックスを返す
function maxAt(arr) {
    return arr.reduce(function(maxidx, val, index, arr) {
        return (arr[maxidx] < val) ? index : maxidx;
    }, 0);
}

// ニューラルネットワークの初期設定値の読み込み
function loadSetting(network) {
    var settings;
    try {
        settings = JSON.parse(fs.readFileSync('./save.json', 'utf-8'));
    } catch (err) {
        console.log("Setting file not found.");
    }
    network.init(settings);
}

// 設定ファイルバックアップ
function backupSetting(timestamp) {
    try {
        fs.renameSync('./save.json', './save_' + timestamp + '.json');
    } catch (err) {
        console.log("Setting file not found.");
    }
}

function heavy() {
    for (var i = 0; i < 3000000000; i++) {i=i;}
}
