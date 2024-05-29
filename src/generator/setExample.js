"use strict"

const _ = require("lodash"); 
const verifyProperties = require("../utils/verifyProperties")(); 
const createComponent = require("./createComponent")(); 

module.exports = function () {
  return function setExample(definition, example, exampleKey, requiredProperties = []) {

    if (verifyProperties(example, requiredProperties) && !_.isEmpty(example)) {

      const name = createComponent(definition, example, exampleKey); 

      _.set(definition, exampleKey, { $ref: name });
    
      require('../utils/sucess')(`Example generated for ${exampleKey}`)

      return true;
    }
    return false; 
  };
};
