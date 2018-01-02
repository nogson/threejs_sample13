(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var baseVert = require('./../shader/base.vert');
var baseFrag = require('./../shader/base.frag');

var notWebGL = function notWebGL() {
    // webGL非対応時の記述
    console.log('this browser does not support webGL');
};

if (document.getElementsByTagName('html')[0].classList.contains('no-webgl')) {
    notWebGL();
}

// three.jsのとき
try {
    var renderer = new THREE.WebGLRenderer();
} catch (e) {
    notWebGL();
}

// 返ってくる値を確認してみましょう！
console.log(ubu.detect);
// IEの時
if (ubu.detect.browser.ie) {
    console.log('IEさん、動画テクスチャはちょっと…無理ですね…');
}

window.onload = function () {

    var renderer;
    var camera, scene;
    var theta = 0;
    var clock = new THREE.Clock();
    var composer;
    var customPass;

    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var aspect = windowWidth / windowHeight;
    var videoTexture;
    var video;

    //uniform用
    var distortion = 0.0;
    var distortion2 = 0.0;
    var scrollSpeed = 0.0;
    var time = 0.0;

    //audio関連の変数
    var context = void 0;
    var analyser = void 0;
    var bufferLength = void 0;
    var dataArray = void 0;
    var source = void 0;
    var fftSize = void 0;

    //audioInit();
    init();

    function init() {

        // rendererの作成
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(0xffffff), 1.0);

        // canvasをbodyに追加
        document.body.appendChild(renderer.domElement);

        // canvasをリサイズ
        renderer.setSize(windowWidth, windowHeight);

        // ベースの描画処理（renderTarget への描画用）
        scene = new THREE.Scene();

        //LIGHTS
        var light = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(light);

        //ベースの描画処理用カメラ                      
        camera = new THREE.PerspectiveCamera(60, windowWidth / windowHeight, 0.1, 1000);
        camera.position.z = 1;

        //Load Video
        // video = document.createElement('video');
        // video.loop = true;
        // video.src = 'movie/mv.mp4';
        // video.play();


        // videoTexture = new THREE.Texture(video);
        // videoTexture.minFilter = THREE.LinearFilter;
        // videoTexture.magFilter = THREE.LinearFilter;
        // var material = new THREE.MeshBasicMaterial({
        //     map: videoTexture
        // });

        var material = new THREE.MeshLambertMaterial();
        var geometry = new THREE.PlaneGeometry(2, 3, 1, 1);
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        composer = new THREE.EffectComposer(renderer);

        //現在のシーンを設定
        var renderPass = new THREE.RenderPass(scene, camera);
        composer.addPass(renderPass);
        //カスタムシェーダー
        var myEffect = {
            uniforms: {
                "tDiffuse": {
                    value: null
                },
                "time": {
                    type: "f",
                    value: time
                },
                "distortion": {
                    type: "f",
                    value: distortion
                },
                "distortion2": {
                    type: "f",
                    value: 2.0
                },
                "scrollSpeed": {
                    type: "f",
                    value: 0.5
                },
                "speed": {
                    type: "f",
                    value: 1.0
                },
                "resolution": {
                    type: 'v2',
                    value: new THREE.Vector2(windowWidth, windowHeight)
                }
            },
            vertexShader: baseVert,
            fragmentShader: baseFrag

            //エフェクト結果をスクリーンに描画する
        };customPass = new THREE.ShaderPass(myEffect);
        customPass.renderToScreen = true;
        composer.addPass(customPass);

        render();
    }

    function audioInit() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        context = new AudioContext();
        analyser = context.createAnalyser();
        analyser.minDecibels = -90; //最小値
        analyser.maxDecibels = 0; //最大値
        analyser.smoothingTimeConstant = 0.65;
        analyser.fftSize = 512; //音域の数

        bufferLength = analyser.frequencyBinCount; //fftSizeの半分のサイズ
        dataArray = new Uint8Array(bufferLength); //波形データ格納用の配列を初期化
        analyser.getByteFrequencyData(dataArray); //周波数領域の波形データを取得

        //マイクの音を取得
        navigator.webkitGetUserMedia({
            audio: true
        }, function (stream) {
            source = context.createMediaStreamSource(stream);
            // オーディオの出力先を設定
            source.connect(analyser);
        }, function (err) {
            console.log(err);
        });
    }

    function sum(arr) {
        return arr.reduce(function (prev, current, i, arr) {
            return prev + current;
        });
    };

    function render() {

        // if (video.readyState === video.HAVE_ENOUGH_DATA) {
        //     if (videoTexture) videoTexture.needsUpdate = true;
        // }
        //analyser.getByteFrequencyData(dataArray)

        time = clock.getElapsedTime();
        customPass.uniforms.time.value = time;

        // customPass.uniforms.distortion.value = sum(dataArray)/dataArray.length;
        // customPass.uniforms.distortion2.value = sum(dataArray)/(dataArray.length * Math.random()*10 + 10);
        // customPass.uniforms.scrollSpeed.value = sum(dataArray)/(dataArray.length * Math.random()*500 + 500);               
        composer.render();

        requestAnimationFrame(render);
    }
};

},{"./../shader/base.frag":2,"./../shader/base.vert":3}],2:[function(require,module,exports){
module.exports = "#ifdef GL_ES\nprecision mediump float;\n#endif\n \nuniform float time;\nuniform vec2 resolution;\n \n#define XAmplitude 0.40\n#define YAmplitude 0.30\n#define XSpeed 1.50\n#define YSpeed 1.45\n#define MinSize 1.7\n#define MaxSize 1.75\n#define speed 0.01\n#define changeSpeed 0.70\n#define Count 10.0\n#define color1 vec3(10.0, 0.0, 0.0)\n#define color2 vec3(0.0, 10.0, 0.0)\n#define color3 vec3(0.0, 0.0, 10.0)\n\nvoid main( void ) \n{\n    //座標を正規化\n    vec2 pos = ( gl_FragCoord.xy / resolution.xy ) * 2.0 - 1.0;\n    //横長にならないように縦横比を調整\n    pos.x *= (resolution.x / resolution.y);\n    \n    vec3 c = vec3( 0, 0, 0 );\n\n    for( float i = 1.0; i < Count+1.0; ++i )\n    {   \n        //X軸の移動　XAmplitudeは振り幅の範囲(-XAmplitude ~ XAmplitudeの間になる)\n        float px = cos( time * XSpeed * (i/Count) ) * sin(time * XAmplitude);\n        //px = px * rand(vec2(px,0)) * 0.01;\n        //Y軸の移動　YAmplitudeは振り幅の範囲(-YAmplitude ~ YAmplitudeの間になる)\n        float py = sin( time * YSpeed   * (i/Count) ) * sin(time * YAmplitude);\n        //py = py * rand(vec2(0,py)) * 0.01;\n        //circleの座標\n        vec2 circlePos = vec2( px , py );\n        //sin(time * 0.30 * 1) * 0.5 +0.5\n        //サイズ変更用の値　0.5 ~ 1.0の間の範囲をとる\n        float t = sin( time * speed * i ) * 0.5 + 0.5;\n        //MinSizeとMaxSize\bをtの値で線形補間　なので比較的MaxSizeに近い値になる\n        float circleSize = mix( MinSize, MaxSize, t );\n        //clamp = min(max(x, a), b)  ・・・　引数として与えられた数値を一定の範囲に収めてくれる\n        //0.0 ~ circleSizeの範囲になる\n        float d = clamp( sin( length( pos - circlePos )  + circleSize ), 0.0, circleSize);\n        //色を変更\n        float s = sin( time * changeSpeed * i ) * 0.5 + 0.5;\n        //色をミックス\n        vec3 color = mix( color1, color2, s );\n\n        c += color * pow( d, 70.0 );\n    }\n \n    gl_FragColor = vec4(vec3(c), 1.0 );\n \n}\n\n\n";

},{}],3:[function(require,module,exports){
module.exports = "\n\nvarying vec3 vNormal;\nvarying vec2 vUv;\n\nvoid main() {\n  vUv = uv; \n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";

},{}]},{},[1]);
