'use strict';

var Neuron = require('synaptic').Neuron;

/**
 * @typedef Neuron
 * @property {Number} bias
 * @method activate
 */

/**
 * @class {NeuronEx}
 * @extends {Neuron.prototype}
 */
class NeuronEx extends Neuron{
    constructor() {
        super();
        this.activationCount = 0;
        this.vacantScore = 0;
        this.bias = 0;
    }

    activate(input) {
        this.activationCount++;
        return super.activate(input);
    }

    project(neuron, weight) {
        return super.project(neuron, weight);

    }
}
module.exports = NeuronEx;