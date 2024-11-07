
const _ = require('lodash');


function getName(schemaPath) {
    const ref = _.get(global.definition, schemaPath)?.['$ref'];


    return  ref?.split('/')?.pop() || schemaPath.replace(/\./g, '/').replace("paths/", '#') || 'Anonymous'
}

function getNameExample(schemaPath) {
    const ref = _.get(global.definition, schemaPath)?.['$ref'];

    const name = ref ? ref.split('/').pop() : generateShortUUID();

    return `GeneratedExample${_.upperFirst(_.camelCase(name))}`;
}



function getProperty(response, path, method, key) {
    if (response?.['$ref']) {
        return response['$ref'].split('/').slice(1).join('.');
    }
    return `paths.${path}.${method}.responses.${key}`;
}

function generateShortUUID() {
    return 'xxxx'.replace(/[x]/g, function() {
        const r = Math.random() * 16 | 0;
        return r.toString(16);
    });
}


function findObject(obj, propertiesArray) {
    if (propertiesArray.length < 1 || !obj) {
        return obj; 
    }
    let property = propertiesArray.shift(); 
    return findObject(obj[property], propertiesArray); 
}


module.exports = { getName, getNameExample , getProperty , findObject }
