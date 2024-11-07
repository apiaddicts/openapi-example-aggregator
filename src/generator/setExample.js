"use strict"

const _ = require("lodash"); 
const createComponent = require("./createComponent")(); 

module.exports = function () {
  return function setExample(definition, example, exampleKey) {

      const name = createComponent(definition, example, exampleKey); 

      _.set(definition, exampleKey, { $ref: name });
    
      require('../utils/sucess')(`Example generated for ${exampleKey}`)
    
  };
};