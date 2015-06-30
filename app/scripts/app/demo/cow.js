module.exports = '\
\n \
function Cow(name) { \n \
  this.name = name || "Anon cow"; \n \
} \n \
Cow.prototype = { \n \
  greets: function(target) { \n \
    if (!target) \n \
      throw new Error("missing target"); \n \
    return this.name + " greets " + target; \n \
  } \n \
}; \n \
'; 