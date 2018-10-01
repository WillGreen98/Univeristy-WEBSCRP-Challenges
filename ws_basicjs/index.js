'use strict';

let remembered;

function id() { return "UP853829"; }

function fn() { return "Will"; }

function sn() { return "Green"; }

function add(num1, num2) { return num1 + num2; }

function subtract(num1, num2) { return num1 - num2; }

function checkObject(object = {checked: false}) { object.checked = true; }

function checkObjectInside(object) { if(object.data != null) object.data.checked = true; }

function arraySet(array, index, number) { if(index in array) array[index] = number; }

function addAll(array) {
    let total = 0;
    for(const value of array) total += value;
    return total;
}

function larger(num1, num2) { return Math.max(num1, num2); }

function largest(array) { return Math.max(...array) }

function compare(cArray1, cArray2) { return cArray1.toString() === cArray2.toString(); }

function addToAll(array, adder) { return array.map((index) => { return index + adder; }); } 

function rememberThis(variable) { remembered = variable; }

function nArray(n) { return Array.from({length: n}, (index, number) => number + 1); }

function addAllOpt(array) { return Array.isArray(array)? array.reduce((head, tail) => head + tail, 0) : 0; }

function divisors(array, divisor) { array.map(function(index) { return index / divisor; }); }

function multiples(n, m) { return Array.from({length: n}, (index, m)  => 1*m, ); }