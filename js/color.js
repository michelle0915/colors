$(function() {

    // クエリ実行ボタン
    $("#btn-query").on('click', function() {

        var r = $("#slider-r").val();
        var g = $("#slider-g").val();
        var b = $("#slider-b").val();

        $.ajax({
            url: 'http://localhost:80/query',
            type: 'POST',
            dataType: 'json',
            data: {
                rgb: [ r, g, b ]
            }
        })
        .done(function(data) {
            var result = data.result;
            console.log(result);
            $("#result").text(result);
        })
        .fail(function(data) {
            console.log(data);
            console.log("failed to get data...");
        })
        .always(function(data) {});
    });

    // ラベル送信・学習ボタン
    $("#color-select button").on('click', function() {

        var r = $("#slider-r").val();
        var g = $("#slider-g").val();
        var b = $("#slider-b").val();
        var label = $(this).val();

        $.ajax({
            url: 'http://localhost:80/train',
            type: 'POST',
            dataType: 'json',
            data: {
                rgb: [ r, g, b ],
                label: label
            }
        })
        .done(function(data) {
            console.log("send traindata.");
        })
        .fail(function(data) {
            console.log(data);
            console.log("failed to get data...");
        })
        .always(function(data) {});
    });

    $(".slidebar").on('input', function() {
        var r = $("#slider-r").val();
        var g = $("#slider-g").val();
        var b = $("#slider-b").val();
        $("#r").text(r);
        $("#g").text(g);
        $("#b").text(b);

        $("#color-panel").css("background-color", "rgb("+r+","+g+","+b+")");
    })

    function dispLoading(){
        if($("#loading").length == 0){
            $("body").append("<div id='loading'></div>");
        }
    }

    function removeLoading(){
        $("#loading").remove();
    }
});
