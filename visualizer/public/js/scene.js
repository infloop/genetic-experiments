'use strict';

window.app = {};

(function (THREE, $, net) {
    console.log(THREE);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    var renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log($('#webgl')[0]);
    $('#webgl').append(renderer.domElement);
    var orbit = new THREE.OrbitControls(camera, renderer.domElement);
    var neurons = [];
    var connections = [];
    var width = 5;
    var height = 3;
    var size = 0.2;
    var info = {
        error: 0,
        iterations: 0
    };

    var setInfo = function(newInfo) {
        return info = newInfo;
    };

    var generateNeurons = function(displayOpts) {
        var constructor, k, ref, results, row, rowSpacing, rows, y, yOffset;
        rows = net.sizes.length;
        results = [];
        for (row = k = 0, ref = rows; 0 <= ref ? k < ref : k > ref; row = 0 <= ref ? ++k : --k) {
            rowSpacing = (height * 2 - size * rows) / (rows - 1);
            y = size * row + rowSpacing * row;
            yOffset = (rows * size + rowSpacing * (rows - 1)) / 2;
            neurons.push([]);
            if (row === 0 && displayOpts.grid) {
                constructor = sensorNode;
            } else if (row === rows - 1 && displayOpts.grid) {
                constructor = outputNode;
            } else if (displayOpts.grid) {
                constructor = hiddenNode;
            }
            if (displayOpts.grid) {
                results.push(displayGrid(row, y - yOffset, constructor));
            } else {
                results.push(void 0);
            }
        }
        return results;
    };

    var displayLayer = function(row, y, nodeConstructor) {
        var col, colSpacing, cols, k, obj, ref, results, x, xOffset;
        cols = net.sizes[row];
        results = [];
        for (col = k = 0, ref = cols; 0 <= ref ? k < ref : k > ref; col = 0 <= ref ? ++k : --k) {
            colSpacing = (width * 2 - size * cols) / (cols - 1 || 1);
            xOffset = (cols * size + colSpacing * (cols - 1)) / 2;
            x = size * col + colSpacing * col;
            obj = nodeConstructor(size);
            obj.position.set(x - xOffset, y, 0);
            obj.renderOrder = 1;
            scene.add(obj);
            results.push(neurons[neurons.length - 1].push(obj));
        }
        return results;
    };
    var displayGrid = function(row, y, nodeConstructor) {
        var col, colSpacing, cols, farX, k, obj, ref, results, rowCols, rowSize, rows, rowsHeight, x, xOffset, z, zOffset;
        cols = net.sizes[row];
        rowCols = Math.floor(Math.sqrt(cols));
        rows = Math.ceil(Math.sqrt(cols));
        rowSize = rowCols;
        colSpacing = 1;
        rowsHeight = colSpacing * (rows - 1);
        xOffset = rowCols / 2;
        results = [];
        for (col = k = 0, ref = cols; 0 <= ref ? k < ref : k > ref; col = 0 <= ref ? ++k : --k) {
            farX = colSpacing * col;
            x = farX % rowSize;
            z = Math.floor(farX / rowSize);
            zOffset = rowsHeight / 2;
            obj = nodeConstructor(size);
            obj.position.set(x - xOffset, y, z - zOffset);
            obj.renderOrder = 1;
            scene.add(obj);
            results.push(neurons[neurons.length - 1].push(obj));
        }
        return results;
    };
    var generateConnections = function(neurons) {
        var geometry, i, j, k, layer, len, line, material, nextLayer, r, ref, results, source, sourceImportance, target, weightToNextLayer;
        ref = neurons.slice(0, -1);
        results = [];
        for (r = k = 0, len = ref.length; k < len; r = ++k) {
            layer = ref[r];
            nextLayer = neurons[r + 1];
            results.push((function() {
                var l, len1, len2, m, results1;
                results1 = [];
                for (i = l = 0, len1 = layer.length; l < len1; i = ++l) {
                    source = layer[i];
                    sourceImportance = 0;
                    for (j = m = 0, len2 = nextLayer.length; m < len2; j = ++m) {
                        target = nextLayer[j];
                        material = new THREE.LineBasicMaterial({
                            color: 0xFFFFFF
                        });
                        material.linewidth = 2;
                        weightToNextLayer = net.weights[r + 1][j][i];
                        if (weightToNextLayer > 0) {
                            material.color.setHSL(0.5, 0.5, 0.5);
                        }
                        if (weightToNextLayer < 0) {
                            material.color.setHSL(0.1, 0.5, 0.5);
                        }
                        sourceImportance += Math.abs(weightToNextLayer);
                        material.opacity = Math.pow(Math.abs(weightToNextLayer), 3);
                        material.transparent = true;
                        geometry = new THREE.Geometry();
                        geometry.vertices.push(source.position, target.position);
                        line = new THREE.Line(geometry, material);
                        line.renderOrder = -Math.abs(weightToNextLayer);
                        if (Math.abs(weightToNextLayer) > 0.2) {
                            scene.add(line);
                            connections.push(line);
                        }
                    }
                    sourceImportance = sourceImportance / nextLayer.length;
                    sourceImportance = sourceImportance > 3 ? 3 : sourceImportance;
                    if (r > 0) {
                        source.scale.x = sourceImportance;
                        source.scale.y = sourceImportance;
                        results1.push(source.scale.z = sourceImportance);
                    } else {
                        results1.push(void 0);
                    }
                }
                return results1;
            })());
        }
        return results;
    };
    var updateScene = function(opts) {
        generateNeurons(opts);
        return generateConnections(neurons);
    };
    var sensorNode = function(size) {
        var cube, geometry, material;
        geometry = new THREE.BoxGeometry(size, size, size);
        material = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF
        });
        cube = new THREE.Mesh(geometry, material);
        return cube;
    };
    var hiddenNode = function(size) {
        var cube, geometry, material;
        geometry = new THREE.SphereGeometry(size / 2, 60);
        material = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF
        });
        cube = new THREE.Mesh(geometry, material);
        return cube;
    };
    var outputNode = function(size) {
        var cube, geometry, material;
        geometry = new THREE.BoxGeometry(size, size, size);
        material = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF
        });
        cube = new THREE.Mesh(geometry, material);
        return cube;
    };

    var updateAndRender = function(opts) {
        var i, k, obj, ref;
        for (i = k = ref = scene.children.length; ref <= 0 ? k <= 0 : k >= 0; i = ref <= 0 ? ++k : --k) {
            obj = scene.children[i];
            if (obj !== camera) {
                scene.remove(obj);
            }
        }
        neurons = [];
        connections = [];
        updateScene(opts);
        $($('#info p').first()).text("Error : " + (Math.round(info.error * 100) / 100));
        return $($('#info p').last()).text("Iterations : " + info.iterations);
    };
    var render = function() {
        requestAnimationFrame(render);
        return renderer.render(scene, camera);
    };

    var setNet = function(n) {
        return net = n;
    };

    render();

    app.scene  = {
        scene: scene,
        render: render,
        updateAndRender: updateAndRender,
        updateScene: updateScene,
        setInfo: setInfo,
        setNet: setNet
    };
})(THREE, jQuery, {});

