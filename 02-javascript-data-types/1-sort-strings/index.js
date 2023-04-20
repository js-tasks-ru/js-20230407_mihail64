/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  const order = {
    "asc": (a, b) => a.localeCompare(b, ["ru", "en"], { sensitivity: "case", caseFirst: "upper" }),
    "desc": (a, b) => b.localeCompare(a, ["ru", "en"], { sensitivity: "case", caseFirst: "upper" })
  };
  if (order[param] === undefined) {
    throw new Error(`unknown sorting type ${param}`);
  }
  return [...arr].sort(order[param]);
}
