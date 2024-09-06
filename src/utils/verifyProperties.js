'use strict'

const _ = require('lodash')

module.exports = function () {

  return function verifyProperties(obj, properties) {
    return properties.every((property) => {
      const propertyPath = property.split(".").filter(Boolean); 

      if (_.isArray(_.get(obj, propertyPath.slice(0, -1)))) {
        const parentArray = _.get(obj, propertyPath.slice(0, -1));
        const lastProperty = propertyPath[propertyPath.length - 1];

        return parentArray.every((item) => verifyProperties(item, [lastProperty]));

      } else if (_.isArray(_.get(obj, propertyPath[0]))) {
        const parentArray = _.get(obj, propertyPath[0]);

        const subProperties = properties
          .filter((prop) => prop.startsWith(propertyPath[0]))
          .map((prop) => prop.split('.').slice(1).join('.'))
          .filter(Boolean); 

        return parentArray.every((item) => verifyProperties(item, subProperties));
      }

      return _.has(obj, property);
    });
  };
}
