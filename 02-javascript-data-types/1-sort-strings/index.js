/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let sortedArr = [...arr];
  sortedArr.sort(compareStrings);
  if (param === "desc") {
    sortedArr.reverse();
  }
  return sortedArr;
}

function compareStrings(a, b) {
  return a.localeCompare(b, "ru", { sensitivity: "case", caseFirst: "upper" });
}
