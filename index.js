#!/usr/bin/env node

'use strict'

const _ = require('lodash');
const { getName, getProperty } = require('./src/utils/schemaUtils');
const createComponent = require("./src/generator/createComponent")();

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

Object.keys(global.definition.paths).forEach(path => {

    Object.keys(global.definition.paths[path]).forEach(method => {
        
        const methodObj = global.definition.paths[path][method];

        Object.keys(methodObj.responses ?? []).forEach(key => {

            const response = methodObj.responses[key]; 
            const property = getProperty(response, path, method, key);
            const schemaPath = `${property}.content.application/json.schema`; 
            const nameExample = getName(schemaPath, key);


            if(_.get(global.definition, schemaPath)?.['example'] || !_.get(global.definition, schemaPath)?.['$ref']){  
                
                const exampleKey = `${property}.content.application/json.examples.${nameExample}`; 

                if(_.get(global.definition, schemaPath)?.['example']){ 

                    const example = _.get(global.definition, schemaPath)?.['example'];
                    const routeKey = createComponent(global.definition, example, exampleKey);

                    _.unset(global.definition, `${property}.content.application/json.schema.example`)
                    _.set(global.definition, `${property}.content.application/json.examples.${nameExample}`, { $ref: routeKey });

                    require('./src/utils/sucess')(`Example generated for ${exampleKey}`)

                }
                
            } 

            if (_.get(global.definition, `${property}.content.application/json.example`)) {

                const exampleKey = `${property}.content.application/json.examples.${nameExample}`;
                const example = _.get(global.definition, `${property}.content.application/json.example`);

                const routeKey = createComponent(global.definition, example, exampleKey);

                if(_.get(global.definition, `${property}.content.application/json.example`)){

                    _.unset(global.definition, `${property}.content.application/json.example`)
                    _.set(global.definition, `${property}.content.application/json.examples.${nameExample}`, { $ref: routeKey });

                    require('./src/utils/sucess')(`Example generated for ${exampleKey}`)

                }

            }
            
            if (response?.['$ref'] && !_.get(global.definition, `${property}.content.application/json.examples`)) {

                if(_.get(global.definition, `${property}.content.application/json.example`)){
                    _.unset(global.definition, `${property}.content.application/json.example`)
                }

                const exampleKey = `${property}.content.application/json.examples.${nameExample}`; 

                require('./src/generator/examples.js')(_.get(global.definition, schemaPath), global.definition, exampleKey);
            

            } else if (_.get(response, 'content.application/json.schema') && !_.get(response, 'content.application/json.examples')) {

                const schemaPath = `${property}.content.application/json.schema`; 
                const exampleKey = `${property}.content.application/json.examples.${nameExample}`; 

                if(_.get(global.definition, `${property}.content.application/json.example`)){
                    _.unset(global.definition, `${property}.content.application/json.example`)
                }


                require('./src/generator/examples.js')(_.get(global.definition, schemaPath), global.definition, exampleKey);               
            }
        });
    });
});


require('./src/generator/file.js')();