$(function() {

    // カラー表示初期化
    (function() {
        var r = $("#slider-r").val();
        var g = $("#slider-g").val();
        var b = $("#slider-b").val();
        $("#r").text(r);
        $("#g").text(g);
        $("#b").text(b);
    })();

    $("#color-panel").css("background-color", "rgb("+r+","+g+","+b+")");

    // クエリ実行ボタン
    $("#btn-query").on('click', function() {

        var r = parseInt($("#slider-r").val());
        var g = parseInt($("#slider-g").val());
        var b = parseInt($("#slider-b").val());
        var postdata = {
            rgb: [ r, g, b ]
        };

        $("button").prop("disabled", true);

        $.ajax({
            url: 'http://localhost:80/query',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(postdata)
        })
        .done(function(data) {
            var result = data.result;
            console.log(result);
            $("#result").text("AI: 「 " + result + " 」");
        })
        .fail(function(data) {
            console.log(data);
            console.log("failed to get data...");
        })
        .always(function(data) {
            $("button").prop("disabled", false);
        });
    });

    // ラベル送信・学習ボタン
    $("#color-select button").on('click', function() {

        dispBlind();

        var r = parseInt($("#slider-r").val());
        var g = parseInt($("#slider-g").val());
        var b = parseInt($("#slider-b").val());
        var label = parseInt($(this).val());
        var postdata = {
            rgb: [ r, g, b ],
            label: label
        };

        $.ajax({
            url: 'http://localhost:80/train',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(postdata)
        })
        .done(function(data) {
            console.log("send traindata.");
            removeBlind("学習が完了しました。");
        })
        .fail(function(data) {
            console.log(data);
            console.log("failed to get data...");
            removeBlind("学習に失敗しました。");
        })
        .always(function(data) {
        });
    });

    // TODO saveボタン配置
    $("h1").on('click', function() {

        $.ajax({
            url: 'http://localhost:80/save',
            type: 'POST',
            contentType: 'application/json',
            data: ''
        })
        .done(function(data) {
        })
        .fail(function(data) {
        })
        .always(function(data) {});
    });

    // カラースライドバーによる背景色表示変更
    $("input[type='range']").on('input', function() {
        var r = $("#slider-r").val();
        var g = $("#slider-g").val();
        var b = $("#slider-b").val();
        $("#r").text(r);
        $("#g").text(g);
        $("#b").text(b);

        $("#color-panel").css("background-color", "rgb("+r+","+g+","+b+")");
    })

    function dispBlind(){
        $("#blind").show();
        $("#img-waiting").show();
    }

    function removeBlind(message){
        $("#img-waiting").hide();
        $("#message").show().text(message);
        setTimeout(function() {
            $("#blind").fadeOut('normal', function() {
                $("#message").hide().text("");
            });
        }, 1000);
    }

    $("#blind").hide();
    $("#img-waiting").hide();
    $("#message").hide();
});
