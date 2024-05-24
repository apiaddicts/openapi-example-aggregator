'use strict'

const _ = require('lodash')

module.exports = function () {
    // Function to verify if the properties are in the object
    return function verifyProperties(obj, properties) {
        // Iterate through the properties and check if they are in the object
        return properties.every((property) => {
      
          const propertyPath = property.split(".").slice(0, -1);  // Get the property path in constant propertyPath
      
          if (_.isArray(_.get(obj, propertyPath))) { 
          
            // If the property is an array, iterate through the array and check if the properties are in the object
            return _.get(obj, propertyPath).every((item) => verifyProperties(item, [property.split(".").pop()]));
          
          } else if(_.isArray(_.get(obj , propertyPath[0]))) {
      
              const subproperties = properties.map(el => el.split('.').slice(1).join('.')) 
              return _.get(obj, propertyPath[0]).every((item) => verifyProperties(item , subproperties))
      
          } else 
            
             // Return if the property is in the object
            return _.has(obj, property);
          }
      )}
}