#!/usr/bin/env node

'use strict'

const _ = require('lodash');
const argv = require('yargs')(process.argv.slice(2))
    .usage('Usage: $0 -f [file]')
    .option('f', {
        alias: 'file',
        describe: 'Path to openapi file',
        type: 'string'
    })
    .example('\x1b[32m $0 -f /path/to/openapi.yaml \x1b[0m')
    .example('\x1b[32m $0 -f /path/to/openapi.yml \x1b[0m')
    .help()
    .alias('h', 'help')
    .argv;

global.definition = require('./src/parser/definition.js')();

// Iterate through paths and methods to add microcks operations and examples
Object.keys(global.definition.paths).forEach(path => {
    Object.keys(global.definition.paths[path]).forEach(method => {
        // Get the method object from the definition that contains the responses
        const methodObj = global.definition.paths[path][method];
        // Iterate through responses to add examples
        Object.keys(methodObj.responses).forEach(key => {
            const response = methodObj.responses[key]; // Get the response object actually being iterated 
            const property = response?.['$ref']?.split('/').slice(1).join('.') ?? `paths.${path}.${method}.responses.${key}`;
            const schemaPath = `${property}.content.application/json.schema`; // Get the schema from the definition
            const name = _.lowerCase(_.get(global.definition, schemaPath)?.['$ref']?.split('/').pop() || key);
            // If the schema has an example, set it in the definition 
            if(_.get(global.definition, schemaPath)?.['example'] || !_.get(global.definition, schemaPath)?.['$ref']){  
                const exampleKey = `${property}.content.application/json.examples.example-schema-${name}`; // Create the example key in the definition
                if(_.get(global.definition, schemaPath)?.['example']){ //If exist in the schema the property example , I add it to the definition
                    _.set(global.definition, exampleKey, { value: _.get(global.definition, schemaPath)?.['example'] }); // Set the example in the definition
                }
            } //If the response is component reference, get the schema and example from the reference
            if (response?.['$ref'] && !_.get(global.definition, `${property}.content.application/json.examples`)) {
                //If exist in the schema the property example, I delete it
                if(_.get(global.definition, `${property}.content.application/json.example`)){
                    _.unset(global.definition, `${property}.content.application/json.example`)
                }
                // Create the example key in the definition with format #/components/responses/{name_of_response}.content.application/json.examples.example-{name_of_response}
                const exampleKey = `${property}.content.application/json.examples.example-schema-${name}`; 
                // Add example to the schema in the definition 
                require('./src/generator/examples.js')(_.get(global.definition, schemaPath), global.definition, exampleKey);
            // If the response is not a component reference, and it has a schema and no example, get the example from the schema if it exists
            // Existence is controlled by the example generator
            } else if (_.get(response, 'content.application/json.schema') && !_.get(response, 'content.application/json.examples')) {
                const schemaPath = `${property}.content.application/json.schema`; // Get the schema path in the definition
                // Create the example key in the definition with format paths.{path}.{method}.responses.{key}.content.application/json.examples.example-{key}
                const exampleKey = `${property}.content.application/json.examples.example-schema-${name}`; 
                // Add example to the schema in the definition
                require('./src/generator/examples.js')(_.get(global.definition, schemaPath), global.definition, exampleKey);               
            } 
        });
    });
});




require('./src/generator/file.js')(); // Generate the new file with the operations and examples