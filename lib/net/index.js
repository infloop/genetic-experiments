'use strict';

var EventEmitter = require('events');
var _ = require('lodash');
var NeuronEx = require('./neuron');
var socket = require('./socket');

const TYPE_INPUT = 1;
const TYPE_OUTPUT = 2;

const QUERY_RANDOM_NEURON = 1;
const QUERY_MOST_ACTIVATED = 2;
const QUERY_VACANT_SCORE = 3;


class Net {
    constructor(events) {
        /** @type {EventEmitter} */
        this.events = events;

        this.inputsNumber = 0;
        this.outputsNumber = 0;

        /** @type {Array<NeuronEx>} */
        this.inputs = [];

        /** @type {Array<NeuronEx>} */
        this.outputs = [];

        /** @type {Array<NeuronEx>} */
        this.layer = [];

        this.connections = [];
    }

    initialize(inputsNumber, outputsNumber, connProb, queryType) {
        this.inputsNumber = inputsNumber;
        this.outputsNumber = outputsNumber;
        this.connProb = connProb || 0.001;
        this.queryType = queryType || QUERY_RANDOM_NEURON;

        for(let i=0; i<this.inputsNumber; i++) {
            let neuron = new NeuronEx();
            neuron.bias = 0;
            this.inputs.push(neuron);
        }

        for(let i=0; i<this.outputsNumber; i++) {
            let neuron = new NeuronEx();
            neuron.bias = 0;
            this.outputs.push(neuron);
        }

        this.events.emit('initialized', this);
    }

    /**
     *
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * @returns {NeuronEx}
     */
    randomInput() {
        return this.inputs[this.randomInt(0, this.inputs.length-1)];
    }

    /**
     * @returns {NeuronEx}
     */
    randomOutput() {
        return this.outputs[this.randomInt(0, this.outputs.length-1)];
    }

    /**
     *
     * @param {Number} type
     * @param {Number} queryType
     * @returns {NeuronEx}
     */
    getNeuron(type, queryType) {
        type = type || TYPE_INPUT;
        queryType = queryType || QUERY_RANDOM_NEURON;

        if(queryType === QUERY_RANDOM_NEURON) {
            return (type === TYPE_INPUT) ? this.randomInput() : this.randomOutput();
        } else if(queryType == QUERY_MOST_ACTIVATED) {
            return _
                .chain((type === TYPE_INPUT) ? this.inputs : this.outputs)
                .sortBy('activationCount')
                .head()
                .value();
        } else if(queryType == QUERY_VACANT_SCORE) {
            return _
                .chain((type === TYPE_INPUT) ? this.inputs : this.outputs)
                .sortBy('vacantScore')
                .head()
                .value();
        }
    }

    connect(type) {
        var input = this.getNeuron(TYPE_INPUT, type);
        var output = this.getNeuron(TYPE_OUTPUT, type);
        var connection = input.project(output, 0.00);
        var neuron = new NeuronEx();
        neuron.gate(connection);
        this.layer.push(neuron);
        this.connections.push(connection);
        this.events.emit('connection.new', connection);
    }

    iterate() {
        let d = Math.random();
        if(d > (1-this.connProb)) {
            this.connect(this.queryType);
        }
    }

    toObject() {
        return {
            inputs: this.inputs,
            outputs: this.outputs,
            layer: this.layer,
        }
    }
}

if(require.main === module) {

    var net = new Net(new EventEmitter());

    net.events.on('initialized', function(net){
        console.log('initialized');
        socket.emit('initialized');
    });

    net.events.on('connection.new', function(connection){
        console.log('connection.new');
        let data = {
            from: connection.from.ID,
            to:  connection.to.ID
        };
        socket.emit('connection.new', data);
    });

    net.initialize(15,10,0.1);

    setInterval(function() {
        net.iterate();
    },200);
}