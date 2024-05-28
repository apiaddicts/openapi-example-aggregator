"use strict"

const _ = require("lodash");

// Function to fetch the example of the schema
const fetchExample = (schema, definition) =>  require("../parser/refs")(schema, definition);

module.exports= ( function() {

  return function buildExample(schema, definition) {

    const example = { properties: {}, required: [], example: {} };
    
      if (schema?.allOf || schema?.anyOf || schema?.oneOf) {
    
        const subSchemas = schema.allOf || schema.anyOf || schema.oneOf; 
        subSchemas.forEach((subSchema) => {
    
          const subExample = buildExample(subSchema, definition); 
          example.properties = _.merge(example.properties, subExample.properties); 
          example.required = _.union(example.required, subExample.required); 
          example.example = _.merge(example.example, subExample.example);  
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
            if (propertySchema.items.example) { // If the property schema items has an example, set it in the example properties
              example.properties[property].push(propertySchema.items.example);
            } else { // If the property schema items has no example, build the example of the items
    
              const itemsExample = buildExample(propertySchema.items, definition);

              if (!_.isEmpty(itemsExample.properties)) { // Check if itemsExample.properties is not empty
                example.properties[property].push(itemsExample.properties);
              }          
              if(!_.isEmpty(itemsExample.example)) { // Check if itemsExample.example is not empty
                example.example[property] = []; // Create an empty array in the example example that not error
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
      } else if (schema?.example) { 
        
        example.properties = schema.example;
      } else if (schema?.items) { // If the schema has items
        example.properties = []; // Create an empty array in the example properties that not error
        if (schema.items.example) { // If the schema items has an example, set it in the example properties
          example.properties.push(schema.items.example);
        } else { // If the schema items has no example, build the example of the items
          const itemsExample = buildExample(schema.items, definition);
          if (!_.isEmpty(itemsExample.properties)) { // Check if itemsExample.properties is not empty
            example.properties.push(itemsExample.properties);
          }
          if(!_.isEmpty(itemsExample.example)) { // Check if itemsExample.example is not empty
            example.example = []; 
            example.example.push(itemsExample.example);
          }
          example.required = _.union(example.required,itemsExample.required);
        }
    }
      // Return the example object
      return example;
    };
})()