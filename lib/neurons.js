'use strict';

var synaptic = require('synaptic');

var A = new synaptic.Neuron();
var B = new synaptic.Neuron();
A.bias = 0.0;
B.bias = 0.0;
var connection = A.project(B, 0.00);


//var C = new synaptic.Neuron();
//C.gate(connection); // now C gates the connection between A and B
//C.bias = 1;
//connection.weight = 0.5;

A.activate(1); // 0.5
console.log(B.activate());