'use strict';

const yaml = require('js-yaml');
const fs = require('fs');
const argv = require('yargs').argv;
const path = require('path');

module.exports = function() {
  return function get() {
    try {
      const contractFile = fs.existsSync(argv.file, 'utf8');
      if (!contractFile) {
        require('../utils/error.js')('The file not found');
      }

      const allowedExtensions = ['.yaml', '.yml', '.json'];
      const ext = path.extname(argv.file).toLowerCase();
      
      if (!allowedExtensions.includes(ext)) {
        require('../utils/error.js')('The file format is not correct: ' + argv.file);
      }

      switch (ext) {
        case '.yaml':
        case '.yml':
          return yaml.load(fs.readFileSync(argv.file, 'utf8'));
        case '.json':
          return JSON.parse(fs.readFileSync(argv.file, 'utf8'));
        default:
          require('../utils/error.js')('Unsupported file format: ' + argv.file);
      }

    } catch (e) {
      console.info(e.message);
      require('../utils/error.js')('The file does not exist or is not correct: ' + argv.file);
    }
  };
}();
