'use strict';

const _path = require('path');
const fs = require('fs');
const argv = require('yargs').argv;
const yaml = require('js-yaml');

module.exports = (function () {
  function saveFile(filePath, data, extension) {
    const formattedData = (extension === '.yaml' || extension === '.yml')  ? yaml.dump(data, { noRefs: true })  : JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, formattedData, 'utf8');
    console.info(`The ${extension.toUpperCase()} file has been saved as ${filePath}`);
  }

  return function generatedFile() {
    try {
      const ext = _path.extname(argv.file).toLowerCase();
      const fileCurrent = _path.basename(argv.file, ext)
      const newFileBaseName = `generated-${fileCurrent}`;
      let newFile;

      const handleExistingFile = (filePath, extension) => {

        const fileWithExtension = `${filePath}${extension}`

        if (fs.existsSync(fileWithExtension) && argv.overwrite) {
          saveFile(fileWithExtension, global.definition, extension);
          return true;
        }
        return false;
      };

      switch (ext) {
        case '.yaml':
        case '.yml':
        case '.json':
          
          if (!handleExistingFile(fileCurrent, ext)) {
              newFile = _path.join(_path.dirname(argv.file), `${newFileBaseName}${ext}`);
              fs.accessSync(_path.dirname(newFile), fs.constants.W_OK);
              saveFile(newFile, global.definition, ext);
            }

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
