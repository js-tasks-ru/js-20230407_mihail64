/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (obj) {
    return recursiveGetter(obj, path.split('.'));
  } ;
}

function recursiveGetter(obj, pathArr) {
  if (pathArr.length === 0 || obj === undefined) {
    return obj;
  }
  return recursiveGetter(obj[pathArr[0]], pathArr.slice(1));
}
