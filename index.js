#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const { getName ,getNameExample, getProperty } = require('./src/utils/schemaUtils');

const { verifyProperties , errorsList} = require('./src/utils/verifyProperties')

const createComponent = require("./src/generator/createComponent")();

const argv = require('yargs')(process.argv.slice(2))
    .usage('Usage: $0 -f [file]')
    .option('f', {
        alias: 'file',
        describe: 'Path to openapi file',
        type: 'string',
        demandOption: true 
    })
    .example('\x1b[32m $0 -f /path/to/openapi.yaml \x1b[0m')
    .example('\x1b[32m $0 -f /path/to/openapi.yml \x1b[0m')
    .help()
    .alias('h', 'help')
    .argv;

global.definition = require('./src/parser/definition.js')();


function generateExample(property, schemaPath, nameExample, example , nameSchema) {
    const exampleKey = `${property}.content.application/json.examples.${nameExample}`;
    const routeKey = createComponent(definition, example, exampleKey);


    const validate = verifyProperties(example, schemaPath , nameSchema , exampleKey);


    if (!validate) {
        return;
    }

    _.unset(definition, `${property}.content.application/json.example`);
    _.set(definition, exampleKey, { $ref: routeKey });

    
    require('./src/utils/sucess')(`Example generated in ${exampleKey.replace('paths./', '#/').replace(/\./g, '/')}`);

}


Object.keys(definition.paths).forEach(path => {
    Object.keys(definition.paths[path]).forEach(method => {
        const methodObj = definition.paths[path][method];

        Object.keys(methodObj.responses ?? []).forEach(key => {
            const response = methodObj.responses[key]; 
            const property = getProperty(response, path, method, key);
            const schemaPath = `${property}.content.application/json.schema`; 


            const nameExample = getNameExample(schemaPath);
            const schema = _.get(definition, schemaPath);
            const schemaDetails = require('./src/parser/refs.js')(schema, definition);
            
        
            if (schema) {
                if (schema.example) {
                    generateExample(property, schemaDetails, nameExample, schema.example , getName(schemaPath));
                }

                if (_.get(response, 'content.application/json.example')) {
                    generateExample(property, schemaDetails, nameExample, _.get(response, 'content.application/json.example') , getName(schemaPath));
                }

                if (response?.['$ref'] && !_.get(definition, `${property}.content.application/json.examples`)) {
                    if (_.get(response, 'content.application/json.example')) {
                        _.unset(definition, `${property}.content.application/json.example`);
                    }
                    require('./src/generator/examples.js')(schema, definition, `${property}.content.application/json.examples.${nameExample}` , schemaDetails , getName(schemaPath))
                }
            }

            if (response?.['content']?.['application/json']?.schema && !response?.['content']?.['application/json']?.examples) {
                require('./src/generator/examples.js')(schema, definition, `${property}.content.application/json.examples.${nameExample}` , schemaDetails , getName(schemaPath))
            }
        });
    });
});


if (errorsList.length !== 0) {
    console.error('Errors found in the examples:');
    console.log(errorsList);
}




require('./src/generator/file.js')();