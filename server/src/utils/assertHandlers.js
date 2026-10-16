module.exports = function assertHandlers(obj, names, label) {
  names.forEach((n) => {
    if (typeof obj[n] !== 'function') {
      throw new Error(`[${label}] handler "${n}" is ${typeof obj[n]} — expected function`);
    }
  });
};