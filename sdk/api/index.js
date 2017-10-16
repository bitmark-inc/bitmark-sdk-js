let funcs = {};
Object.assign(funcs, require('./transfer'), require('./bitmarks'), require('./assets'));
module.exports = funcs;
