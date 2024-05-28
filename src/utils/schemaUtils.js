
const _ = require('lodash');

function getName(schemaPath, key) {
    const ref = _.get(global.definition, schemaPath)?.['$ref'];
    const name = ref ? ref.split('/').pop() : key;
    return _.toLower(name).replace(/[^a-zA-Z0-9]/g, '-');
}


function getProperty(response, path, method, key) {
    if (response?.['$ref']) {
        return response['$ref'].split('/').slice(1).join('.');
    }
    return `paths.${path}.${method}.responses.${key}`;
}

module.exports = { getName, getProperty };
