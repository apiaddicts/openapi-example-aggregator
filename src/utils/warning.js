'use strict'

module.exports = function() {
  
  return function post(message){
    console.warn('\x1b[33m%s\x1b[0m', message);
  };

}()


