$(function() {

    // ノード設定
    var nodes = new vis.DataSet([
        { id: 0,  label: 'R',      x: -225, y: 0,   color: 'red',    },
        { id: 1,  label: 'G',      x: -75,  y: 0,   color: 'green',  },
        { id: 2,  label: 'B',      x: 75,   y: 0,   color: 'blue',   },
        { id: 3,  label: '1',      x: 225,  y: 0,   color: 'grey',   },
        { id: 4,  label: 'white',  x: -300, y: 200, color: 'white', },
        { id: 5,  label: 'black',  x: -200, y: 200, color: 'black', },
        { id: 6,  label: 'red',    x: -100, y: 200, color: 'red', },
        { id: 7,  label: 'yellow', x: 0,    y: 200, color: 'yellow', },
        { id: 8,  label: 'green',  x: 100,  y: 200, color: 'green', },
        { id: 9,  label: 'blue',   x: 200,  y: 200, color: 'blue', },
        { id: 10, label: 'purple', x: 300,  y: 200, color: 'purple', },
    ]);

    // その他表示設定
    var options = {
        physics: {
            enabled: false
        },
        nodes: {
            shape: 'dot',
            margin: 10,
            size: 30,
        },
        edges: {
            arrows: 'to',
            smooth: false,
            width: 0,
        }
    };

    // ネットワーク初期表示
    loadParameters();

    // 更新ボタン押下時処理
    $("#btn-update").on('click', function() {
        loadParameters();
    });

    // 保存ボタン押下時処理
    $("#btn-save").on('click', function() {

        $.ajax({
            url: 'http://localhost:80/save',
            type: 'POST',
            contentType: 'application/json',
            data: ''
        })
        .done(function(data) {
            alert('パラメータを保存しました。');
        })
        .fail(function(data) {
            alert('パラメータの保存に失敗しました。');
        })
        .always(function(data) {});
    });

    // 重みパラメータ取得→ネットワーク表示
    function loadParameters() {
        $.ajax({
            url: 'http://localhost:80/params',
            type: 'POST',
            contentType: 'application/json',
            data: ''
        })
        .done(function(data) {
            var params = data.params;
            var edges = makeEdge(params);
            makeNetwork(nodes, edges, options);
        })
        .fail(function(data) {
            console.log(data);
            console.log("failed to get data...");
        })
        .always(function(data) {
        });
    }

    // エッジの作成
    function makeEdge(params) {
        var w = params.Affine1.w;
        var b = params.Affine1.b;
        var edgeinfo = [];

        for (var i = 0; i < w.length; i++) {
            for (var j = 0; j < w[i].length; j++) {
                var value = w[i][j].toFixed(3);
                edgeinfo.push({
                    from: i,
                    to: j + 4,
                    label: value.toString(),
                    width: Math.max(0, Math.min(1, value)) * 10
                })
            }
        }
        for (var i = 0; i < b.length; i++) {
            var value = b[i].toFixed(3);
            edgeinfo.push({
                from: 3,
                to: i + 4,
                label: value.toString(),
                width: Math.max(0, Math.min(1, value)) * 10
            })
        }

        return new vis.DataSet(edgeinfo);
    }

    function makeNetwork(nodes, edges, options) {
        var data = {
            nodes: nodes,
            edges: edges,
        };

        var container = document.getElementById('network');
        var network = new vis.Network(container, data, options);
    }
});
