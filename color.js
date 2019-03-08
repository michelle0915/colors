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
app.get('/', function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
});

app.get('/css/color.css', function(req, res) {
    fs.readFile('./css/color.css', 'utf-8', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.write(data);
        res.end();
    });
});

app.get('/js/color.js', function(req, res) {
    fs.readFile('./js/color.js', 'utf-8', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.write(data);
        res.end();
    });
});

var colors = {
    0: "red",
    1: "green",
    2: "blue",
};

// POST by Ajax
app.post('/query', function(req, res) {
    console.log(req.body.command);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    var rgb = req.body.rgb.map(x => parseInt(x));

    var result = colors[maxAt(rgb)];

    // response
    res.send(JSON.stringify({
        result: result
    }));
});

app.post('/train', function(req, res) {
    console.log(req.body.command);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    var rgb = req.body.rgb.map(x => parseInt(x));
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
    if (arr === undefined || arr.length === 0) return; 

    var maxidx = 0;
    var maxvalue = arr[0];
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > maxvalue) {
            maxidx = i;
            maxvalue = arr[i];
        }
    }
    
    return maxidx;
}
