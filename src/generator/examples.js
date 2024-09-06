"use strict";

const _ = require("lodash");
const setExample = require('./setExample')()


module.exports = (function () {
  return function addExampleToSchema(schema, definition, exampleKey) {

    const buildExample = require('./buildExample')(schema, definition); 
    const example = cleanEmptyValues(buildExample);
    
    if (!setExample(definition, example.example, exampleKey, example.required)) { 

      if(!setExample(definition, example.properties, exampleKey, example.required)){ 

        _.unset(definition, `components.examples.${exampleKey.split('.').pop()}`); 

        require('../utils/warning')(`Example not generated for ${exampleKey}`); 
      }
    }
}})();


const cleanEmptyValues = (data) => {
  if (Array.isArray(data)) {
    return data
      .map(cleanEmptyValues) 
      .filter(item => item !== undefined && item !== null && item !== "" && 
                      (Array.isArray(item) ? item.length > 0 : typeof item === 'object' ? Object.keys(item).length > 0 : true)); 
  } else if (typeof data === 'object' && data !== null) {
    return Object.keys(data)
      .reduce((acc, key) => {
        const cleanedValue = cleanEmptyValues(data[key]); 
        if (cleanedValue !== undefined && cleanedValue !== null && cleanedValue !== "" && 
            (Array.isArray(cleanedValue) ? cleanedValue.length > 0 : typeof cleanedValue === 'object' ? Object.keys(cleanedValue).length > 0 : true)) {
          acc[key] = cleanedValue; 
        }
        return acc;
      }, {});
  } else {
    return data; 
  }
};