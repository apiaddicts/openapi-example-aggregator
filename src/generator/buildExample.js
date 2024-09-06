"use strict";

const _ = require("lodash");


const MAX_DEPTH_LEVEL = 20;
const { handleAllOfAnyOfOneOf, handleRef, handleProperties, handleItems } = require('../utils/handlers');


function mergeAndDeduplicate(value1, value2) {
  if (_.isArray(value1) || _.isArray(value2)) {
    const combined = _.concat(value1 || [], value2 || []);
    return _.uniqWith(combined, _.isEqual);
  }

  if (_.isPlainObject(value1) || _.isPlainObject(value2)) {
    return _.mergeWith({}, value1 || {}, value2 || {}, (objValue, srcValue) => {
      if (_.isArray(objValue) && _.isArray(srcValue)) {
        return _.uniqWith(_.concat(objValue, srcValue), _.isEqual);
      }
    });
  }

  return value1 || value2;
}

module.exports = function () {
  return function buildExample (schema, definition, depth = 0) {
    const example = { properties: {}, required: [], example: {} };
  
    if (depth > MAX_DEPTH_LEVEL) {
      return example;
    }
  
    if (_.isEmpty(schema)) {
      return example;
    }
  
    if (_.has(schema, 'allOf') || _.has(schema, 'anyOf') || _.has(schema, 'oneOf')) {
      handleAllOfAnyOfOneOf(schema, example, definition, depth);
    } else if (_.has(schema, '$ref')) {
      handleRef(schema, example, definition, depth);
    } else if (_.has(schema, 'properties')) {
      handleProperties(schema, example, definition, depth);
    } else if (_.has(schema, 'example')) {
      example.example = schema.example;
    } else if (_.has(schema, 'items')) {
      handleItems(schema, example, definition, depth);
    } 

    example.example = mergeAndDeduplicate(example.example, example.properties);

    return example;
  }
}()


