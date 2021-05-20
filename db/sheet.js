/**
 * @param {string} tableName
 */
function getTable(tableName) {
  Logger.log("Getting table")
  const file = SpreadsheetApp.openById(SS_ID);
  const sheet = file.getSheetByName(tableName);

  if (sheet === null) throw "couldn't initialize table, maybe the name is wrong."

  const range = sheet.getDataRange();
  const values = range.getValues();

  const headers = values.shift()
  const metadata = values.shift()

  // This row is to convert all the ids into integers
  const data = values.map(row => {
    let id;
    try {
      id = parseInt(row[0])
      if (Number.isNaN(id)) throw "Cannot parse value into integer"
    } catch (e) {
      throw `There is something wrong with id "${row[0]}" in your table \n${e}`
    }
    row[0] = id
    return row
  })
  
  return {"headers": headers, "metadata": metadata, "data": data}
}

function addRow(tableName, row) {
  Logger.log("Adding row")
  const file = SpreadsheetApp.openById(SS_ID);
  const sheet = file.getSheetByName(tableName);
  sheet.appendRow(row);
}

/**
 * @param {string} tableName
 * @param {integer} id
 * @returns {Object}
 */
function getRow(tableName, id) {
  Logger.log("Getting row")
  const file = SpreadsheetApp.openById(SS_ID);
  const sheet = file.getSheetByName(tableName);
  const range = sheet.getDataRange();
  const values = range.getValues();
  let rowNumber;
  const filteredValues = values.filter((row, i) => {
    if (row[0] === id) {
      rowNumber = i;
      return row
    }
  })

  if (filteredValues.length === 0){
    throw "no ID found"
  } else if (filteredValues.length > 1) {
    throw "there seems to be a duplicate ID!"
  }

  return {"rowNumber": rowNumber, "row": filteredValues.flat()}
}

function getHeaders(tableName) {
  Logger.log("Getting headers")
  const file = SpreadsheetApp.openById(SS_ID);
  const sheet = file.getSheetByName(tableName);
  const range = sheet.getDataRange();
  const width = range.getWidth()
  
  const headerRange = sheet.getRange(1,1,2,width)
  const headerValues = headerRange.getValues()
  
  return {headers: headerValues[0], metadata: headerValues[1]}
}

function updateValue(tableName, row, col, value) {
  Logger.log("Updating Value")
  const file = SpreadsheetApp.openById(SS_ID);
  const sheet = file.getSheetByName(tableName);
  const range = sheet.getRange(row, col)
  range.setValue(value)
}

function updateRow(tableName, row) {
  
}
