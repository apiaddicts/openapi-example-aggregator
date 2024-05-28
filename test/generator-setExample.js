
const _ = require("lodash");
const assert = require("assert");

  
const setExample = require('../src/generator/setExample')()

const definition = require("../seeds/exampleSetExampleInitial.json");

describe("generator-setExample", () => {

    //Deberia fallar si el example el nulo
    it("should be false if the object is empty, null or undefiend", () => {
  

      const objectEmpty = setExample(definition, {}, "components.responses.Pets.content.application/json.examples.example-schema-pet-list" );
      const objectNull = setExample(definition, null, "components.responses.PetById.content.application/json.examples.example-schema-pet" );
      const objectUndefined = setExample(definition, undefined, "components.responses.Pets.content.application/json.examples.example-schema-pet-list" );

      assert.notDeepStrictEqual(objectEmpty,true);
      assert.notDeepStrictEqual(objectNull, true);
      assert.notDeepStrictEqual(objectUndefined, true);
    });
    it("should return false if a required property does not exist in the example." , () => {
      const example = {
        properties : {
          id: 1,
          nombre: "El Quijote",
          autor: "Miguel de Cervantes",
          anio: 1605,
        },
        required : ["id", "uuid"]
      }
      const exampleKey = "paths./libros/{id}.get.responses.200.content.application/json.examples.example-schema-libro.value";
      const boolSet = setExample(definition,   example.properties , exampleKey , example.required);

      assert.notDeepStrictEqual(boolSet, true);
      assert.deepStrictEqual(boolSet, false);
    });

    it("should return true if the example is added correctly", () => {
      
      const example = {
        properties : {
          id: 1,
          nombre: "El Quijote",
          autor: "Miguel de Cervantes",
          anio: 1605,
        },
        required : ["id" , "nombre", "autor", "anio"]
      }

      const exampleKey = "paths./libros/{id}.get.responses.200.content.application/json.examples.example-schema-libro.value";
      const boolSet = setExample(definition,   example.properties , exampleKey , example.required);

      assert.deepStrictEqual(boolSet, true);
    });
})