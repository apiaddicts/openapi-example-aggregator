
const assert = require("assert");
const verifyProperties = require("../src/utils/verifyProperties")(); 

const json = require("../seeds/verifyProperties.json");

describe("verifyProperties", () => {
  it("Should correctly verify existence of deeply nested properties in json", () => {
    const propertiesToVerify = [
      "prop1.subprop1.subsubprop1",
      "prop3.arrayProp1",
    ];
    assert.strictEqual(verifyProperties(json, propertiesToVerify), true);
  });


  it("Should fail when verifying non-existent properties in json", () => {
    const propertiesToVerify = [
      "prop1.nonExistentProp.subprop1",
      "prop1.subprop2.nonExistentProp",
      "prop3.nonExistentProp",
    ];

    assert.strictEqual(verifyProperties(json, propertiesToVerify), false);
  });

  it("Should an array of objects fail if any object does not have a required property", () => {
    const propertiesToVerify = [
      "prop1.subprop2.nestedProp1",
      "prop1.subprop2.nestedProp2"
    ];

    assert.strictEqual(verifyProperties(json, propertiesToVerify), false);
  });

});
