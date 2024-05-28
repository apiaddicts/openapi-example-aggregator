"use strict";

const _ = require("lodash");
const setExample = require('./setExample')()


module.exports = (function () {
  return function addExampleToSchema(schema, definition, exampleKey) {

    const example = require('./buildExample')(schema, definition); 
    
    if (!setExample(definition, example.example, exampleKey, example.required)) { 

      if(!setExample(definition, example.properties, exampleKey, example.required)){ 

        _.unset(definition, `components.examples.${exampleKey.split('.').pop()}`); 

        require('../utils/warning')(`Example not generated for ${exampleKey}`); 
      }
    }
}})();
