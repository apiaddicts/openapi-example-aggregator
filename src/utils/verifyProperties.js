"use strict";

const _ = require('lodash');
const Ajv = require("ajv");
const AjvKeywords = require("ajv-keywords");

let errorsList = [];  

const addUniqueError = (errorsList, newError) => {
    const existingErrorIndex = errorsList.findIndex(error =>
        error.route === newError.route &&
        error.propertyError === newError.propertyError &&
        error.message === newError.message
    );

    if (existingErrorIndex > -1) {
        const existingError = errorsList[existingErrorIndex];
        if (existingError.reference === 'AnonymousSchema' && newError.reference !== 'AnonymousSchema') {
            errorsList[existingErrorIndex] = newError; 
        }
    } else {
        errorsList.push(newError);
    }
};

function verifyProperties(example, schema, schemaName = 'AnonymousSchema', exampleKey = 'Unknown') {
    const ajv = new Ajv({ strict: false, validateFormats: false });
    AjvKeywords(ajv); 


    ajv.addSchema(global.definition, 'openAPI');

    const validate = ajv.compile(schema); 
    const valid = validate(example); 

    if (!valid) {
        validate.errors.forEach((error) => {
            const newError = {
                route: exampleKey?.split('content')[0]?.replace(/\./g, '/').replace(/\/+/g, '/').replace(/\/$/, '') || 'Unknown',
                reference: schemaName,
                propertyError: error.instancePath,
                validate: error.params,
                message: error.message,
            };

            addUniqueError(errorsList, newError);
        });
    }

    return valid;
};

module.exports = { verifyProperties, errorsList };
