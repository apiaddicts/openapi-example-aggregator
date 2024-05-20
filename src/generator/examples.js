"use strict"

const _ = require('lodash');

module.exports = function() {   
    return function addExampleToSchema(schema, definition, exampleKey){
        // Get the example from the schema and set it in the definition
        let example = require('../parser/refs')(schema, definition) ;
        // If example exists, set it in the definition , otherwise do nothing
        if (example?.['example']) _.set(definition, exampleKey, { value: example?.['example'] });
        // If the schema has properties, build the example object and set it in the definition
        if (!_.get(definition, exampleKey)) {
          // If the example is empty, set the schema as the example 
            if(_.isEmpty(example)) example = schema;
            console.log(exampleKey)
            if (example?.properties) { // If the schema has properties, build the example object and set it in the definition
                const exampleBuild = buildExampleObject(example.properties); // Build the example object
                // If the example object has the required fields, set it in the definition
                if (hasRequiredFields(exampleBuild, example?.required || [])) {
                  _.set(definition, exampleKey, { value: exampleBuild });
                }
            }
        }
    }
}()

const hasRequiredFields = (obj, requiredFields) =>
    requiredFields.every((field) => obj.hasOwnProperty(field));

const buildExampleObject = (properties) =>
  Object.keys(properties).reduce((example, property) => {
    if (properties[property].example) {
      example[property] = properties[property].example;
    }
    return example;
  }, {});
    