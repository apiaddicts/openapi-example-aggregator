"use strict";

const _ = require("lodash");
const setExample = require('./setExample')();
const { verifyProperties } = require('../utils/verifyProperties');
const { exit } = require("yargs");

module.exports = (function () {

  return function addExampleToSchema(schema, definition, exampleKey, schemaDetails , nameSchema) {
    
    const buildExample = require('./buildExample')(schema, definition);
    const example = cleanEmptyValues(buildExample);

    let isValid = true;

    if (schema?.allOf || schema?.oneOf || schema?.anyOf) {
      isValid = validateComposedSchemas(schema, definition , exampleKey);
    }

    if (schema.$ref) {
      isValid = validateReference(schema, definition , exampleKey);
    }

    isValid = verifyProperties(example.example, schemaDetails, nameSchema , exampleKey);

    if (!isValid) {
      require('../utils/warning')(`Error in the generated example for ${exampleKey}`);
      return;
    }
    

    setExample(definition, example.example, exampleKey);

  };
})();

const validateReference = (schema, definition , exampleKey) => {

  let isValid = true;

  const refSchema = require('../parser/references.low')(schema , definition);

  if (refSchema?.allOf || refSchema?.oneOf || refSchema?.anyOf) {
    if ( !validateComposedSchemas(refSchema, definition , exampleKey) ) {
      isValid = false;
    }
  }

  return isValid;
};

const validateComposedSchemas = (schema, definition , exampleKey) => {
  let isValid = true;

  const schemasToCheck = schema.allOf || schema.oneOf || schema.anyOf;

  schemasToCheck.forEach((element, index) => {

    const subExample = require('./buildExample')(element, definition);
    const subSchema = require('../parser/refs')(element, definition);

    const subNameSchema = element.$ref ? element?.$ref.split('/').pop() : 'AnonymousSchema';

    if (!verifyProperties(subExample.example, subSchema, subNameSchema , exampleKey)) {
      isValid = false;
    }
  });

  return isValid;
};

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
