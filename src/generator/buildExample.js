"use strict";

const _ = require("lodash");


const MAX_DEPTH_LEVEL = 20;
const { handleAllOfAnyOfOneOf, handleRef, handleProperties, handleItems } = require('../utils/handlers');


module.exports = function () {
  return function buildExample (schema, definition, depth = 0) {
    const example = { properties: {}, required: [], example: {} };
  
    if (depth > MAX_DEPTH_LEVEL) {
      return example;
    }

    if (_.isEmpty(schema)) {
      return example;
    }
  
    switch(!_.isEmpty(example)) {
      
      case _.has(schema, 'allOf'):
      case _.has(schema, 'anyOf'):
      case _.has(schema, 'oneOf'):
        handleAllOfAnyOfOneOf(schema, example, definition, depth);
        break;
      
      case _.has(schema, '$ref'):
        handleRef(schema, example, definition, depth);
        break;
  
      case _.has(schema, 'properties'):
        handleProperties(schema, example, definition, depth);
        break;
  
      case _.has(schema, 'example'):
        example.example = schema.example;
        break;
      case _.has(schema, 'items'):
        handleItems(schema, example, definition, depth);
        break;
      default:
      break;
    }
  
    return example;
  };
}()