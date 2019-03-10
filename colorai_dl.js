function maparrays(fn, arr1, arr2) {
    var result = [];
    
    for (var i = 0; i < arr1.length && i < arr2.length; i++) {
        result.push(fn(arr1[i], arr2[i]));
    }
    return result;
}

// ベクトル加算
function vplus(arr1, arr2) {
    return maparrays(function(x, y) { return x + y; }, arr1, arr2);
}

// ベクトル減算
function vminus(arr1, arr2) {
    return maparrays(function(x, y) { return x - y; }, arr1, arr2);
}

// ベクトル乗算
function vmulti(arr1, arr2) {
    return maparrays(function(x, y) { return x * y; }, arr1, arr2);
}

function sum(arr) {
    return arr.reduce(function (sum, val, index, arr) {
        return sum + val;
    });

}

// 内積
function innerProduct(arr1, arr2) {
    return sum(vmulti(arr1, arr2));
}

// 線形結合
function dot(mat, vect) {
    var result = [];

    mat.forEach(function(row) {
        result.push(innerProduct(row, vect));
    })
    return result;
}

// ソフトマックス関数（出力値の正規化）
// yk = exp(ak) / Σexp(a)
function softmax(a) {
    var c = Math.max.apply(null, a); // 桁あふれ対策
    var exp_a = a.map(x => Math.exp(x - c));
    var sum_exp_a = sum(exp_a);

    return exp_a.map(x => x / sum_exp_a);
}

// 交差エントロピー誤差関数
// 正解ラベルtはone-hot表現
function crossEntropyError(y, t) {
    var delta = 1e-7;
    return -sum(vmulti(t, y.map(x => Math.log(x + delta))));
}
