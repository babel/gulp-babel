const { transformAsync } = require("../babel/node_modules/@babel/core");

module.exports = ({ code, options }) => transformAsync(code, options);
