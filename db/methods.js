

/**
 * @param {string} tableName
 * @param {array} ids
 */
function get(tableName, ids) {
  const table = new Table(tableName)
  const filteredData = table.data.filter(row => ids.include(row[0]));
  return {headers: table.headers, metadata: table.metadata, data: filteredData};
}

/**
 * @param {string} tableName
 * @param {Object=} body - fields to include, empty
 */
function insert(tableName, body = {}) {
  const table = new Table(tableName)

  if (Object.keys(body).length >= table.headers.length) {
    throw "body has too many properties"
  }
  if (body.hasOwnProperty("id")) throw "don't provide an id in the body"

  for (let key in body) {
    if (table.headers.includes(key) === false) {
      throw `body has invalid property ${key}`
    }
  }

  const row = table.headers.map((header, i) => {
    return body.hasOwnProperty(header)
      ? body[header] : ""
  })

  table.addRow(row)
}

/**
 * @param {string} tableName
 * @param {string} id
 * @param {string} header
 * @param {string} value
 */
function update(tableName, id, header, value) {
  const table = new Table(tableName)
  table.updateValue(id, header, value)
}

