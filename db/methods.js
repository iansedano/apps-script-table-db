/**
 * @param {string} tableName
 * @param {array} ids
 */
function getByIds(tableName, ids) {
  const { headers, metadata, data } = getTable(tableName);
  const filteredData = data.filter(row => ids.include(row[0]));
  return {headers, metadata, filteredData};
}

/**
 * @param {string} tableName
 * @param {Object=} body - fields to include, empty
 */
function insert(tableName, body = {}) {
  const { headers, metadata, data } = getTable(tableName);

  if (Object.keys(body).length >= headers.length) throw "body has too many properties"
  if (body.hasOwnProperty("id")) throw "don't provide an id in the body"

  for (let key in body) {
    if (!headers.includes(key)) throw `body has invalid property ${key}` 
  }

  const row = headers.map((header, i) => {
    if (header === "id") {
      if (i !== 0) throw "id is not in first column! Check the sheet."
      return createUniqueKey();
    }
    return body.hasOwnProperty(header)
      ? body[header] : ""
  })
}

/**
 * @param {string} tableName
 * @param {string} id
 * @param {string} header
 * @param {string} value
 */
function update(tableName, id, header, value) {
  let rowNumber

  try {
    ({ rowNumber } = getRow(tableName, id))
  } catch (e) {
    throw `Something went wrong when getting row:\n${e}`
  }

  const { headers } = getHeader(tableName)
  const colIndex = headers.indexOf(header)
  updateValue(tableName, rowNumber, colIndex, value)
}


