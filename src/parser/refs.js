'use strict'

function eachRecursive(obj , definition) {
	let newObject = Array.isArray(obj) ? [] : {}
	for (var k in obj) {
		if (typeof obj[k] == "object" && obj[k] !== null) {
			eachRecursive(obj[k] , definition);
		} else {
			if (k == '$ref') {
				let property = obj[k]
				property = property.replace('#/', '')
				let propertiesArray = property.split('/')
				let refObject = findObject(definition, propertiesArray)
				newObject = { ...newObject, ...refObject }
			}
		}
	}
	return newObject
}


function findObject(obj, propertiesArray) {
	if(propertiesArray.length < 1 || !obj) {
		return obj
	}
	let property = propertiesArray.shift()
	return findObject(obj[property], propertiesArray)
}

module.exports = function() {
	return function get(obj, definition) {
		return eachRecursive(obj, definition)
	}
}()