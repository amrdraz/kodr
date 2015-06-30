module.exports = '\
{\n\
    "$num": function(num) {\n\
        return num.value > 100;  // Just return true/false\n\
    },\n\
    "$num, $incr": function(num, incr) {\n\
        if (num.value <= incr.value) {\n\
        // Return the failure message\n\
        return {failure: "The increment must be smaller than the number."};\n\
        }\n\
        return true;\n\
    }\n\
}\n\
';

export default undefined;
