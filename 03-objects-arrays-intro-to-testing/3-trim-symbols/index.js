/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let newString = "";
  let symbols;
  let counter;
  for (let s of string) {
    if (s !== symbols) {
      counter = 0;
      symbols = s;
    }
    if (counter++ >= size) {
      continue;
    }
    newString = newString + s;
  }
  return newString;
}
