'use strict';

const _path = require('path');
const fs = require('fs');
const argv = require('yargs').argv;
const yaml = require('js-yaml');

module.exports = (function () {
  return function generatedFile() {
    try {
      const ext = _path.extname(argv.file).toLowerCase();
      const newFileBaseName = `generated-${_path.basename(argv.file, ext)}`;
      let newFile;

      switch (ext) {
        case '.yaml':
        case '.yml':
          newFile = _path.join(_path.dirname(argv.file), `${newFileBaseName}.yaml`);
          fs.accessSync(_path.dirname(newFile), fs.constants.W_OK);
          fs.writeFileSync(newFile, yaml.dump(global.definition, { noRefs: true }), 'utf8');
          console.info(`The YAML file has been saved as ${newFile}`);
          break;

        case '.json':
          newFile = _path.join(_path.dirname(argv.file), `${newFileBaseName}.json`);
          fs.accessSync(_path.dirname(newFile), fs.constants.W_OK);
          fs.writeFileSync(newFile, JSON.stringify(global.definition, null, 2), 'utf8');
          console.info(`The JSON file has been saved as ${newFile}`);
          break;

        default:
          require('../utils/error')('Unsupported file format: ' + argv.file);
      }

    } catch (error) {
      require('yargs').showHelp();
      require('../utils/error')('The file could not be saved');
    }
  };
})();
