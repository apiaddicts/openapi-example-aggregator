"use strict";

const _ = require("lodash");
const trySetExample = require('./setExample')()

module.exports = (function () {
  return function addExampleToSchema(schema, definition, exampleKey) {
    
    const example = require('./buildExample')(schema, definition); // Get the example of the schema//console.log(exampleKey , example)

    if(!trySetExample(definition, example.example, exampleKey, example.required)){ // Try to set the example in the definition  
      if(!trySetExample(definition, example.properties, exampleKey, example.required)){ // Try to set the properties in the definition
        _.unset(definition, `components.examples.${exampleKey.split('.').pop()}.value`); // If the example is not set in the definition, delete the example in the 
        require('../utils/warning')(`Example not generated for ${exampleKey}`); // If the example is still not set in the definition, show an error message in the console
      }
    }
}})();
