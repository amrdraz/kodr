module.exports = '\
describe("Cow", function() {\n \
  describe("constructor", function() {\n \
    it("should have a default name", function() {\n \
      var cow = new Cow();\n \
      expect(cow.name).to.equal("Anon cow");\n \
    });\n \
  it("should set cow\'s name if provided", function() {\n \
      var cow = new Cow("Kate");\n \
      expect(cow.name).to.equal("Kate");\n \
    });\n \
  });\n \
  describe("#greets", function() {\n \
    it("should throw if no target is passed in", function() {\n \
      expect(function() {\n \
        (new Cow()).greets();\n \
      }).to.throw(Error);\n \
    });\n \
    it("should greet passed target", function() {\n \
      var greetings = (new Cow("Kate")).greets("Baby");\n \
      expect(greetings).to.equal("Kate greets Baby");\n \
    });\n \
  });\n \
});\n \
';