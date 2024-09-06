const _ = require('lodash');
const MAX_DEPTH = 15;

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
  if (subSchemas) {
    handleSubSchemas(subSchemas, example, definition, depth);
  }
};

const handleRef = (schema, example, definition, depth) => {
  const getSchema = fetchExample(schema, definition);
  const _example = require('../generator/buildExample')(getSchema, definition, depth + 1);
  _.merge(example, _example);
};

const handleProperties = (schema, example, definition, depth) => {
  if (schema.example) {
    _.set(example, 'example', schema.example);
  } else {
    Object.keys(schema.properties).forEach((property) => {
      const propertySchema = schema.properties[property];
      const currentPath = property;

      if (propertySchema.type === 'array') {
        if (propertySchema.items.$ref) {
          const arrayRefSchema = fetchExample(propertySchema.items, definition);
          handleRequiredReferences(arrayRefSchema, example, definition, currentPath);

          if (arrayRefSchema.required) {
            example.required = _.union(example.required, arrayRefSchema.required.map((item) => `${currentPath}.${item}`));
          }
        }
      } 

      if (_.has(propertySchema, 'example')) {
        _.set(example.properties, property, propertySchema.example);
      } else if (_.has(propertySchema, 'items')) {
        handleItems(propertySchema, example, definition, depth, property);
      } else {
        const propertyExample = require('../generator/buildExample')(propertySchema, definition, depth + 1);

        if (!_.isEmpty(propertyExample.properties)) {
          example.properties[property] = propertyExample.properties;
        }

        if (!_.isEmpty(propertyExample.example)) {
          _.set(example.example, property, propertyExample.example);
        }

        example.required = _.union(example.required, propertyExample.required.map((item) => {
          return schema.type === 'array' ? item : `${property}.${item}`;
        }));
      }
    });

    handleRequiredReferences(schema, example, definition);
  }
};

const handleRequiredReferences = (schema, example, definition, parentPath = '' , depth = 0) => {

  if (depth > MAX_DEPTH) {
    return;
  }

  if (schema.properties) {
    Object.keys(schema.properties).forEach((property) => {
      const propertySchema = schema.properties[property];
      const currentPath = parentPath ? `${parentPath}.${property}` : property;

      if (schema.required && schema.required.includes(property)) {
        example.required.push(currentPath);
      }

      if (propertySchema.type === 'object') {
        handleRequiredReferences(propertySchema, example, definition, currentPath, depth + 1);
      } else if (propertySchema.type === 'array' && propertySchema.items && propertySchema.items.$ref) {
        const arrayRefSchema = fetchExample(propertySchema.items, definition);
        handleRequiredReferences(arrayRefSchema, example, definition, currentPath, depth + 1);

        if (arrayRefSchema.required) {
          example.required = _.union(example.required, arrayRefSchema.required.map((item) => `${currentPath}.${item}`));
        }
      } else if (propertySchema.$ref) {
        const refSchema = fetchExample(propertySchema, definition);
        handleRequiredReferences(refSchema, example, definition, currentPath, depth + 1);
      }
    });
  }
};

const handleItems = (schema, example, definition, depth, property = null) => {
  let arrExample = _.isNull(property) ? example.example : example.example[property];
  let arrProperties = _.isNull(property) ? example.properties : example.properties[property];

  if (!Array.isArray(arrProperties)) {
    arrProperties = [];
  }

  if (!Array.isArray(arrExample)) {
    arrExample = [];
  }

  if (schema.items.example) {
    arrProperties.push(schema.items.example);
    arrExample.push(schema.items.example);
  } else {
    const itemsExample = require('../generator/buildExample')(schema.items, definition, depth + 1);

    if (!_.isEmpty(itemsExample.properties)) {
      arrProperties.push(itemsExample.properties);
    }

    if (!_.isEmpty(itemsExample.example)) {
      arrExample.push(itemsExample.example);
    }

    example.required = _.union(example.required, itemsExample.required.map((item) => {
      return _.isEmpty(property) ? item : `${property}.${item}`;
    }));
  }

  if (_.isNull(property)) {
    example.properties = arrProperties;
    example.example = arrExample;
  } else {
    example.properties[property] = arrProperties;
    example.example[property] = arrExample;
  }
};

module.exports = {
  handleSubSchemas,
  handleAllOfAnyOfOneOf,
  handleRef,
  handleProperties,
  handleItems
};
