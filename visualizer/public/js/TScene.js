'use strict';

class TScene {
    /**
     *
     * @param {jQuery} $
     * @param {window} window
     * @param {THREE} THREE
     */
    constructor($, window, THREE) {
        this.$ = $;

        /** @type {THREE} */
        this.THREE = THREE;

        /** @type {THREE.Scene} */
        this.scene = new THREE.Scene();

        /** @type {THREE.PerspectiveCamera} */
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 10;

        /** @type {THREE.WebGLRenderer} */
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.orbit = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        /** @type {TNet} */
        this.net = null;

        this.neurons = [];

        this.connections = [];

        this.width = 5;
        this.height = 3;
        this.size = 0.2;
        this.info = {
            error: 0,
            iterations: 0
        };
    }

    initialize() {
        this.$('#webgl').append(this.renderer.domElement);
    }

    setInfo(newInfo) {
        return (this.info = newInfo);
    }

    generateNeurons(displayOpts) {
        var constructor, k, ref, results, row, rowSpacing, rows, y, yOffset;
        rows = this.net.sizes.length;
        results = [];
        for (row = k = 0, ref = rows; 0 <= ref ? k < ref : k > ref; row = 0 <= ref ? ++k : --k) {
            rowSpacing = (height * 2 - size * rows) / (rows - 1);
            y = size * row + rowSpacing * row;
            yOffset = (rows * size + rowSpacing * (rows - 1)) / 2;
            this.neurons.push([]);
            if (row === 0 && displayOpts.grid) {
                constructor = this.sensorNode;
            } else if (row === rows - 1 && displayOpts.grid) {
                constructor = this.outputNode;
            } else if (displayOpts.grid) {
                constructor = this.hiddenNode;
            }
            if (displayOpts.grid) {
                results.push(this.displayGrid(row, y - yOffset, constructor));
            } else {
                results.push(void 0);
            }
        }
        return results;
    }

    displayLayer(row, y, nodeConstructor) {
        var col, colSpacing, cols, k, obj, ref, results, x, xOffset;
        cols = this.net.sizes[row];
        results = [];
        for (col = k = 0, ref = cols; 0 <= ref ? k < ref : k > ref; col = 0 <= ref ? ++k : --k) {
            colSpacing = (this.width * 2 - size * cols) / (cols - 1 || 1);
            xOffset = (cols * size + colSpacing * (cols - 1)) / 2;
            x = size * col + colSpacing * col;
            obj = nodeConstructor(size);
            obj.position.set(x - xOffset, y, 0);
            obj.renderOrder = 1;
            this.scene.add(obj);
            results.push(this.neurons[neurons.length - 1].push(obj));
        }
        return results;
    }

    displayGrid(row, y, nodeConstructor) {
        var col, colSpacing, cols, farX, k, obj, ref, results, rowCols, rowSize, rows, rowsHeight, x, xOffset, z, zOffset;
        cols = this.net.sizes[row];
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
            this.scene.add(obj);
            results.push(this.neurons[neurons.length - 1].push(obj));
        }
        return results;
    }

    generateConnections(neurons) {
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
                        material = new this.THREE.LineBasicMaterial({
                            color: 0xFFFFFF
                        });
                        material.linewidth = 2;
                        weightToNextLayer = this.net.weights[r + 1][j][i];
                        if (weightToNextLayer > 0) {
                            material.color.setHSL(0.5, 0.5, 0.5);
                        }
                        if (weightToNextLayer < 0) {
                            material.color.setHSL(0.1, 0.5, 0.5);
                        }
                        sourceImportance += Math.abs(weightToNextLayer);
                        material.opacity = Math.pow(Math.abs(weightToNextLayer), 3);
                        material.transparent = true;
                        geometry = new this.THREE.Geometry();
                        geometry.vertices.push(source.position, target.position);
                        line = new this.THREE.Line(geometry, material);
                        line.renderOrder = -Math.abs(weightToNextLayer);
                        if (Math.abs(weightToNextLayer) > 0.2) {
                            this.scene.add(line);
                            this.connections.push(line);
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
    }

    updateScene(opts) {
        this.generateNeurons(opts);
        return this.generateConnections(this.neurons);
    }

    /**
     *
     * @param {Number} size
     */
    sensorNode(size) {
        var geometry = new this.THREE.BoxGeometry(size, size, size);
        var material = new this.THREE.MeshBasicMaterial({
            color: 0xFFFFFF
        });
        return new this.THREE.Mesh(geometry, material);
    }

    /**
     *
     * @param {Number} size
     */
    hiddenNode(size) {
        var geometry = new this.THREE.SphereGeometry(size / 2, 60);
        var material = new this.THREE.MeshBasicMaterial({
            color: 0xFFFFFF
        });
        return new this.THREE.Mesh(geometry, material);
    }

    /**
     *
     * @param {Number} size
     */
    outputNode(size) {
        var geometry = new this.THREE.BoxGeometry(size, size, size);
        var material = new this.THREE.MeshBasicMaterial({
            color: 0xFFFFFF
        });
        return new this.THREE.Mesh(geometry, material);
    }

    updateAndRender(opts) {
        var i, k, obj, ref;
        for (i = k = ref = this.scene.children.length; ref <= 0 ? k <= 0 : k >= 0; i = ref <= 0 ? ++k : --k) {
            obj = this.scene.children[i];
            if (obj !== this.camera) {
                this.scene.remove(obj);
            }
        }
        this.neurons = [];
        this.connections = [];
        this.updateScene(opts);

        this.$(this.$('#info p').first()).text("Error : " + (Math.round(this.info.error * 100) / 100));
        return this.$(this.$('#info p').last()).text("Iterations : " + this.info.iterations);
    }

    render() {
        requestAnimationFrame(this.render);
        return this.renderer.render(this.scene, this.camera);
    }

    startRender() {
        this.render();
    }

    setNet(net) {
        return (this.net = net);
    };
}

(function (THREE, $, net) {

    app.scene  = {
        scene: scene,
        render: render,
        updateAndRender: updateAndRender,
        updateScene: updateScene,
        setInfo: setInfo,
        setNet: setNet
    };
})(THREE, jQuery, {});

