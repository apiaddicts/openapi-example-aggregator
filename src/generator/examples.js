"use strict";

const _ = require("lodash");
const { example } = require("yargs");

module.exports = (function () {
  return function addExampleToSchema(schema, definition, exampleKey) {
    
    const example = buildExample(schema, definition); // Get the example of the schema

    // If the example has an example and the properties are verified, set the example in the definition
    if(verifyProperties(example.example, example.required || []) && !_.isEmpty(example.example)) { 
      _.set(definition, exampleKey, { value: example.example });

      //console.info('[32m%s[0m',`Example generated for ${exampleKey}`); //Success message in console
    }

    // If the example is not set in the definition , try with example build from the schema
    if(!_.get(definition, exampleKey)){ 

      // If the example has properties and the properties are verified, set the example in the definition
      if(verifyProperties(example.properties, example.required || []) && !_.isEmpty(example.properties)) {
        console.info('[32m%s[0m',`Example generated for ${exampleKey}`);
        _.set(definition, exampleKey, { value: example.properties });
      }
    }

    // Finnaly if the example is not set in the definition, show an error message in console
    if(!_.get(definition, exampleKey)){
      //Salida de consola por colores rojo para que se vea de error indicando la ruta que no se genero
      console.error('[31m%s[0m',`Example not generated for ${exampleKey}`);
    }
  };
})();


const fetchExample = (schema, definition) => {
  return require("../parser/refs")(schema, definition);
};

const verifyProperties = (obj, properties) => {
  return properties.every((property) => {
    const propertyPath = property.split(".").slice(0, -1);
    if(_.isArray(_.get(obj, propertyPath))){
      return _.get(obj, propertyPath).every((item) =>  verifyProperties(item, [property.split(".").pop()]));
    } 
    return _.has(obj, property);
  });
};



// Function to search the example of the schema and build the example object
// In base of the schema and the definition
const buildExample = (schema, definition) => {
  // Create an empty example object
  const example = { properties: {}, required: [] , example : {}};
  // If the schema has allOf, anyOf or oneOf, iterate through the sub schemas
  if (schema?.allOf || schema?.anyOf || schema?.oneOf) {

    const subSchemas = schema.allOf || schema.anyOf || schema.oneOf; // Get the sub schemas
    subSchemas.forEach((subSchema) => {

      const subExample = buildExample(subSchema, definition); // Get the example of the sub schema 
      example.properties = _.merge(example.properties, subExample.properties); // Merge the properties of the sub schema with the example properties
      example.required = _.union(example.required, subExample.required); // Merge the required properties of the sub schema with the example required properties
      example.example = _.merge(example.example, subExample.example); // Merge the example of the sub schema with the example
    });
  } else if (schema?.$ref) { // If the schema has a reference

    _.merge(example, buildExample(fetchExample(schema, definition), definition)); // Merge the example with the example of the reference
  } else if (schema?.properties) { // If the schema has properties
    if(schema.example){ // If the schema has an example set it in the example object 
      _.set(example, 'example', schema.example);
    } 
    Object.keys(schema.properties).forEach((property) => { // Iterate through the properties of the schema and build the example
      const propertySchema = schema.properties[property];  // Get the property schema in constant propertySchema

      if (propertySchema.required) { // If the property schema has required properties, add them to the example required properties
        propertySchema.required.forEach((required) => example.required.push(`${property}.${required}`));
      }

      // If the schema has required properties, add them to the example required properties
      if (schema.required && schema.required.includes(property)){  
        example.required.push(property);
      }

      if (propertySchema.example) { // If the property schema has an example, set it in the example properties
        _.set(example.properties, property, propertySchema.example);
      } else if (propertySchema.items) { // If the property schema has items
        
        example.properties[property] = []; // Create an empty array in the example properties that not error
        example.example[property] = []; // Create an empty array in the example example that not error

        if (propertySchema.items.example) { // If the property schema items has an example, set it in the example properties
          example.properties[property].push(propertySchema.items.example);
        } else { // If the property schema items has no example, build the example of the items

          const itemsExample = buildExample(propertySchema.items, definition);
          if (!_.isEmpty(itemsExample.properties)) { // Check if itemsExample.properties is not empty
            example.properties[property].push(itemsExample.properties);
          }          
          if(!_.isEmpty(itemsExample.example)) { // Check if itemsExample.example is not empty
            example.example[property].push(itemsExample.example);
          }
          example.required = _.union(example.required,itemsExample.required.map((item) => `${property}.${item}`));
        }
      } else { // Else could be "$ref" , "allOf" , "anyOf" , "oneOf" 

        const propertyExample = buildExample(propertySchema, definition); // Build the example of the property schema
        if (!_.isEmpty(propertyExample.properties)) { // Check if propertyExample.properties is not empty
          example.properties[property] = propertyExample.properties;
        }
        example.required = _.union(example.required,propertyExample.required.map((item) => `${property}.${item}`));

      }
    });
    // If the schema has an example, set it in the example object
  } else if (schema?.example) { 
    example.properties = schema.example;
  } 
  // Return the example object

  return example;
};




