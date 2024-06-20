'use strict'

const _ = require('lodash')

module.exports = function () {

  return function verifyProperties(obj, properties) {
    return properties.every((property) => {
      
          const propertyPath = property.split(".").slice(0, -1) ;  
      
          if (_.isArray(_.get(obj, propertyPath))) {
          
            const propertie = [ property.split(".").pop() ]
                        
            return _.get(obj, propertyPath).every((item) => verifyProperties(item, propertie ));
          
          } else if (_.isArray(_.get(obj, propertyPath[0]))) {
      
            const subproperties = properties.map(el => el.split('.').slice(1).join('.'))
            
            return _.get(obj, propertyPath[0]).every((item) => verifyProperties(item, subproperties))
      
          } else {
            
            return _.has(obj, property);
          }
        }
    );
  }
}