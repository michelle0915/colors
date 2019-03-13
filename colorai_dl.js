// ベクトル演算用マップ関数
function maparrays(fn, arr1, arr2) {
    var result = [];
    
    for (var i = 0; i < arr1.length && i < arr2.length; i++) {
        result.push(fn(arr1[i], arr2[i]));
        // 注：arr1[i]が参照型の場合、破壊的になる可能性あり
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

// 行列演算用マップ関数
function mapmatrix(fn, mat1, mat2) {
    var result = [];
    
    for (var i = 0; i < mat1.length && i < mat2.length; i++) {
        var row = []
        for (var j = 0; j < mat1[0].length && j < mat2[0].length; j++) {
            row.push(fn(mat1[i][j], mat2[i][j]));
        }
        result.push(row);
    }
    return result;
}

// 行列加算
function mplus(mat1, mat2) {
    return mapmatrix(function(x, y) { return x + y}, mat1, mat2);
}

// 行列の各要素ごとに処理をする関数
function matEach(fn, mat) {
    return mat.map(row => row.map(x => fn(x)));
}

// 合計
function sum(arr) {
    return arr.reduce(function (sum, val, index, arr) {
        return sum + val;
    });

}

// 内積
function innerProduct(arr1, arr2) {
    return sum(vmulti(arr1, arr2));
}

// 転置行列
function tr(mat) {
    var result = [];

    // ベクトルの場合、2重配列に変換
    if (typeof mat[0] === 'number') { mat = [mat]; }
    for (var n = 0; n < mat[0].length; n++) {
        var row = [];
        for (var m = 0; m < mat.length; m++) {
            row.push(mat[m][n]);
        }
        result.push(row);
    }
    return (result.length === 1) ? result[0] : result;
}

// 行列の積
function dot(mat1, mat2) {
    var result = [];

    // ベクトルの場合、2重配列に変換
    if (typeof mat1[0] === 'number') { mat1 = [mat1]; }
    if (typeof mat2[0] === 'number') { mat2 = [mat2]; }

    // mat2は計算しやすいように転置
    mat2 = tr(mat2);

    mat1.forEach(function(row) {
        var outrow = [];
        mat2.forEach(function(col) {
            outrow.push(innerProduct(row, col));
        });
        result.push(outrow);
    });
    return (result.length === 1) ? result[0] : result;
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

// Affine Layer
// 重み係数とバイアスにより出力
// 学習により更新
function Affine(name) {
    var _w, _b, _x, _dw, _db;

    return {
        name: name,
        set: function(input) {
            _w = input.w;
            _b = input.b;
        },
        forward: function(x) {
            _x = x;
            return vplus(dot(_x, _w), _b);
        },
        backward: function(dout) {
            _dw = dot(tr(_x), dout);
            _db = dout;
            return dot(dout, tr(_w));
        },
        update: function(rate) {
            _w = mplus(_w, matEach(function(x) { return -1 * rate * x; }, _dw));
            _b = vplus(_b, _db.map(x => -1 * rate * x));
        },
        export: function() {
            return {
                w: _w,
                b: _b,
            }
        }
    }
}

// ReLU Layer
// 活性化関数：0以下の出力を0に切り替える
// 複雑な深層学習で有効、今回は使わない
function Relu() {
    var _mask;

    return {
        forward: function(x) {
            _mask = x.map(v => (v > 0));
            return vmulti(x, _mask);
        },
        backward: function(dout) {
            return vmulti(dout, _mask);
        },
        update: function() {},
        export: function() {}
    }
}

// Sigmoid Layer
// 活性化関数：出力を0~1にする
function Sigmoid() {
    var _out;

    return {
        forward: function(x) {
            _out = x.map(v => 1 / (1 + Math.exp(-v)));
            return _out;
        },
        backward: function(dout) {
            return vmulti(dout, _out.map(x => (1 - x) * x));
        },
        update: function() {},
        export: function() {}
    }
}

// Softmax + CrossEntropyError Layer
function SoftmaxWithLoss() {
    var _y, _t, _loss;

    return {
        forward: function(x, t) {
            _t = t;
            _y = softmax(x);
            _loss = crossEntropyError(_y, _t);
            return _loss;
        },
        backward: function() {
            return vminus(_y, _t);
        }
    }

}

// ニューラルネット全体
function NeuralNet() {
    var layers = [];
    var lastLayer;
    var learningRate = 0.1; // 学習係数（1回の学習がどれほど影響するか）

    return {
        init: function(settings) {
            layers.push(Affine('Affine1'));
            // layers.push(Relu());
            layers.push(Sigmoid());
            lastLayer = SoftmaxWithLoss();

            // 各層の初期値設定
            var layerSettings = settings || {
                Affine1: {
                    w: [
                        [ r(), r(), r(), r(), r(), r(), r() ], 
                        [ r(), r(), r(), r(), r(), r(), r() ], 
                        [ r(), r(), r(), r(), r(), r(), r() ], 
                    ],
                    b:  [ r(), r(), r(), r(), r(), r(), r() ]
                }
            };
            layers.forEach(function(layer) {
                var input = layerSettings[layer.name];
                input && layer.set(input);
            });
        },
        predict: function(x) {
            layers.forEach(function(layer) {
                x = layer.forward(x);
            });
            return x;
        },
        train: function(x, t) {
            // forward
            lastLayer.forward(this.predict(x), t);

            // backward（勾配計算）
            var dout = lastLayer.backward();
            for (var i = layers.length - 1; i >= 0; i--) {
                dout = layers[i].backward(dout);
            }

            layers.forEach(function(layer) {
                layer.update(learningRate);
            });
        },
        export: function() {
            var expObj = {};
            // 各層ごとに設定値をオブジェクトにして出力
            layers.forEach(function(layer) {
                if (layer.name) {
                    expObj[layer.name] = layer.export();
                }
            });
            return expObj;
        }
    }
}

// 0~1のランダム値
function r() {
    return Math.random();
}

module.exports = {
    NeuralNet: NeuralNet,
    softmax: softmax,
    tr: tr
};
