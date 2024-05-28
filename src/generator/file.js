"use strict";

const _path = require("path");
const fs = require("fs");
const argv = require("yargs").argv;
const yaml = require("js-yaml");



module.exports = (function () {
  return function generatedFile() {
    try {
      const newFileYaml = _path.join(_path.dirname(argv.file), `generated-${_path.basename(argv.file)}`);
      
      fs.accessSync(_path.dirname(newFileYaml), fs.constants.W_OK); 
      
      fs.writeFileSync(newFileYaml, yaml.dump(global.definition, { noRefs: true }), "utf8");
      
      console.info(`The file has been saved as ${newFileYaml}`);
    
    } catch (error) {
      require("yargs").showHelp();
      require("../utils/error")("The file could not be saved");
    }
  };
})();
