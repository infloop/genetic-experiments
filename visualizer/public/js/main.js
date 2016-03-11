var batchSize, currentIteration, data, displayOpts, error, hiddenLayers, initializeOptions, intervalID, iterations, learningRate, net, resetAll, scene, setBatchSize, setLearningRate, stop, threeData, train, trainingOptions, xorData;

var threeData = app.threes;

var xorData = app.xor;

var data = threeData;

var batchSize = 1;

var learningRate = 0.5;

var iterations = 100000;

var currentIteration = 0;

var error = Infinity;

var intervalID = 0;

net = null;

trainingOptions = null;

hiddenLayers = [4];

net = new brain.NeuralNetwork({
    hiddenLayers: data.hiddenLayers || void 0
});

scene = app.scene;

setBatchSize = function(size) {
    return batchSize = size;
};

setLearningRate = function(rate) {
    return learningRate = rate;
};

displayOpts = {
    grid: true
};

initializeOptions = {
    iterations: 0
};

stop = function() {
    return clearInterval(intervalID);
};

resetAll = function() {
    stop();
    net = new brain.NeuralNetwork({
        hiddenLayers: hiddenLayers || void 0
    });
    scene.setNet(net);
    trainingOptions = {
        errorThresh: 0.01,
        iterations: batchSize,
        callback: function(info) {
            info.iterations = currentIteration;
            error = info.error;
            return scene.setInfo(info);
        },
        callbackPeriod: batchSize,
        learningRate: learningRate
    };
    console.log("LEARNING RATE IS : " + learningRate);
    net.train(data.trainingData, initializeOptions);
    return scene.updateAndRender(displayOpts);
};

console.log("HL : ");

console.log(data.hiddenLayers);

resetAll();

train = function() {
    var i;
    stop();
    i = 0;
    return intervalID = setInterval((function() {
        var output;
        net.train(data.trainingData, trainingOptions);
        scene.updateAndRender(displayOpts);
        i++;
        output = net.run(data.testData);
        currentIteration = i * batchSize;
        if (i * batchSize > iterations || error < trainingOptions.errorThresh) {
            clearInterval(intervalID);
            return console.log("YEAH");
        }
    }), 100);
};

$('#batch-size-button').click(function(e) {
    var size;
    size = Number($('#batch-size-input').val());
    console.log("BLAH");
    debugger;
    return setBatchSize(size);
});

$('#learning-rate-button').click(function(e) {
    var rate;
    rate = Number($('#learning-rate-input').val());
    console.log("BLAH");
    return setLearningRate(rate);
});

$('#reset-button').click(function(e) {
    resetAll();
    return console.log("BLAH");
});

$('#stop-button').click(function(e) {
    stop();
    return console.log("BLAH");
});

$('#train-button').click(function(e) {
    return train();
});

$('#hidden-layers-button').click(function(e) {
    var hLayers;
    console.log($('#hidden-layers-input').val());
    debugger;
    hLayers = JSON.parse($('#hidden-layers-input').val());
    console.log(hLayers);
    hiddenLayers = hLayers;
    return resetAll();
});