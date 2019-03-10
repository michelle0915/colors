const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

//server setting and run
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
 
app.listen(80);
console.log("server runnnig");

// Page Request
function requestPage(app, urlpath, filepath) {
    var contentTypeMap = {
        html: 'text/html',
        css: 'text/css',
        js: 'text/javascript',
    }

    // ファイルの拡張子
    var ext = filepath.match(/\.[^.]+$/)[0].slice(1);
    var contentType = contentTypeMap[ext] || 'text/plain';

    app.get(urlpath, function(req, res) {
        fs.readFile(filepath, 'utf-8', function(err, data) {
            res.writeHead(200, {'Content-Type': contentType});
            res.write(data);
            res.end();
        });
    });
}
requestPage(app, '/', './index.html');
requestPage(app, '/css/colorai_client.css', './css/colorai_client.css');
requestPage(app, '/js/colorai_client.js', './js/colorai_client.js');
requestPage(app, '/colorai_dl.js', './colorai_dl.js');


var colors = {
    0: "red",
    1: "green",
    2: "blue",
};

// POST by Ajax
app.post('/query', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    console.log(req.body);
    var rgb = req.body.rgb;
    var result = colors[maxAt(rgb)];

    // response
    res.send(JSON.stringify({
        result: result
    }));
});

app.post('/train', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    console.log(req.body);
    var rgb = req.body.rgb;
    var label = req.body.label;

//    var result = colors[maxAt(rgb)];

    console.log("=======train=======");
    console.log(rgb);
    console.log(label);
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
