
const _ = require("lodash");
const assert = require("assert");

const createComponent = require("../src/generator/createComponent")();

const definition = require("../seeds/exampleCreateComponentInitial.json");
const definitionResult = require("../seeds/exampleCreateComponentResult.json");

describe("generator-createComponent", () => {

  it("Should fail if no example is provided", () => {

    const result = createComponent( definition, null, "paths./libros/{id}.get.responses.200.content.application/json.examples.example-schema-libro");

    assert.notDeepStrictEqual(result, definitionResult);
  });

  it("Should add the example to the definition", () => {

    const example = {
      id: 1,
      nombre: "El Quijote",
      autor: "Miguel de Cervantes",
      anio: 1605,
    };

    const result = createComponent( definition, example, "paths./libros/{id}.get.responses.200.content.application/json.examples.example-schema-libro" );

    const isCreated = _.has( definitionResult, `${result.split("/").slice(1).join(".")}` );

    assert.strictEqual(isCreated, true);
  });

  if("Should return the name of the component created", () => {

    const example = {
      id: 1,
      nombre: "El Quijote",
      autor: "Miguel de Cervantes",
      anio: 1605,
    };

    const result = createComponent( definition, example, "paths./libros/{id}.get.responses.200.content.application/json.examples.example-schema-libro");

    assert.strictEqual(result, "components.examples.example-schema-libro.value");
  });
});
