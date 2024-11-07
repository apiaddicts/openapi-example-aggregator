'use strict';

const { findObject } = require('../utils/schemaUtils')

function eachRecursiveAllLevels(obj, definition) {

    let newObject = Array.isArray(obj) ? [] : {};
    

    for (let k in obj) {
        if (typeof obj[k] === 'object' && obj[k] !== null) {
            newObject[k] = eachRecursiveAllLevels(obj[k], definition);
        } else {
            if (k === '$ref') {
                let property = obj[k].replace('#/', ''); 
                let propertiesArray = property.split('/');
                let refObject = findObject(definition, propertiesArray); 

                newObject = { ...newObject, ...eachRecursiveAllLevels(refObject, definition) };
            } else {

                newObject[k] = obj[k];
            }
        }
    }
    return newObject; 
}



module.exports = function() {
    return function get(obj, definition) {
        return eachRecursiveAllLevels(obj, definition); 
    };
}();
