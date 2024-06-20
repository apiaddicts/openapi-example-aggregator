
const _ = require('lodash'); 


const fetchExample = (schema, definition) => require("../parser/refs")(schema, definition);

const handleSubSchemas = (subSchemas, example, definition, depth) => {

  subSchemas.forEach((subSchema) => {
    
    const subExample = require('../generator/buildExample')(subSchema, definition, depth + 1);
    example.properties = _.merge(example.properties, subExample.properties);
    example.required = _.union(example.required, subExample.required);
    example.example = _.merge(example.example, subExample.example);
  
});
};

const handleAllOfAnyOfOneOf = (schema, example, definition, depth) => {
  
  const subSchemas = schema.allOf || schema.anyOf || schema.oneOf;
  handleSubSchemas(subSchemas, example, definition, depth);

};

const handleRef = (schema, example, definition, depth) => {

   const getSchema = fetchExample(schema, definition);
   const _example = require('../generator/buildExample')(getSchema, definition, depth + 1);

  _.merge(example,  _example );

};

const handleProperties = (schema, example, definition, depth) => {
  if (schema.example) _.set(example, 'example', schema.example);

  Object.keys(schema.properties).forEach((property) => {
    const propertySchema = schema.properties[property];

    if (propertySchema.required) {
      propertySchema.required.forEach((required) => example.required.push(`${property}.${required}`));
    }

    if (schema.required && schema.required.includes(property)) {
      example.required.push(property);
    }

    switch (!_.isEmpty(propertySchema)) {
      case _.has(propertySchema, 'example'):
        _.set(example.properties, property, propertySchema.example);
        break;
      case _.has(propertySchema, 'items'):
        handleItems(propertySchema, example, definition, depth, property);
        break;
      default:
        const propertyExample =  require('../generator/buildExample')(propertySchema, definition, depth + 1);
        
        if (!_.isEmpty(propertyExample.properties)) {
          example.properties[property] = propertyExample.properties;
        }

        if (!_.isEmpty(propertyExample.example)) {
          _.set(example.example, property, propertyExample.example);
        }

        example.required = _.union(example.required, propertyExample.required.map((item) => `${property}.${item}`));
        break;
    }
  });
};

const handleItems = (schema, example, definition, depth, property = null) => {
  let arrProperties = property === null ? example.properties : (example.properties[property] = []);

  if (schema.items.example) {
    arrProperties.push(schema.items.example);
  } else {
    const itemsExample = require('../generator/buildExample')(schema.items, definition, depth + 1);

    if (!_.isEmpty(itemsExample.properties)) {
      arrProperties.push(itemsExample.properties);
    }

    if (!_.isEmpty(itemsExample.example)) {
      let arrExample = property === null ? example.example : (example.example[property] = []);
      arrExample.push(itemsExample.example);
    }

    example.required = _.union(example.required, itemsExample.required);
  }
};

module.exports = {
  handleSubSchemas,
  handleAllOfAnyOfOneOf,
  handleRef,
  handleProperties,
  handleItems
};
