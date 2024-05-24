'use strict'

module.exports = function() {
  
  return function post(message){
	console.info('\x1b[32m%s\x1b[0m',message);
  };

}()