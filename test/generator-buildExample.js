
const assert = require("assert"); 
const _ = require("lodash");

describe("generator-buildExample", () => {
    it("Should not match schema and add value", () => {
    
    const schema = { $ref: "#/components/schemas/Libro" };
    const definition = require("../seeds/exampleBuildExampleInitial.json");
    const definitionResult = require("../seeds/exampleBuildExampleResult.json");

    const result = require("../src/generator/buildExample")(schema, definition);

    const resultSet = _.get( definitionResult, "paths./libros/{id}.get.responses.200.content.application/json.examples.example-schema-libro.value");

    assert.notDeepStrictEqual(result, schema);

    assert.deepStrictEqual(result.properties, resultSet);
  });
}); 
