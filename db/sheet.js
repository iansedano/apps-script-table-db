class Table {
  constructor(sheetName) {
    Logger.log("Initializing Table")
    this.file = SpreadsheetApp.openById(SS_ID);
    this.sheet = this.file.getSheetByName(sheetName);
    this.range = this.sheet.getDataRange();
    this.values = this.range.getValues();
    this.headers = this.values[0];
    if (this.headers[0] !== "id") throw "first column is not id"
    this.metadata = this.values[1];
    this.data = values.slice(2).map(row => {
      let id;
      try {
        id = parseInt(row[0])
        if (Number.isNaN(id)) throw "Cannot parse value into integer";
      } catch (e) {
        throw `There is something wrong with id "${row[0]}" in your table\n${e}`;
      }
      row[0] = id
      return row;
    })
    this.ids = this.data.map(row => row[0])
    if (allKeysUnique(this.ids) === false) throw "all keys are not unique!"
  }

  addRow(row) {
    Logger.log("Adding row")
    if (row.length !== this.headers.length) throw "wrong size of row"
    this.sheet.appendRow(row);
  }
  
  /**
   * @param {integer} id
   * @returns {Object}
   */
  getRow(id) {
    Logger.log("Getting row")
    let rowNumber;
    const filteredValues = this.values.filter((row, i) => {
      if (row[0] === id) {
        rowNumber = i;
        return true;
      } else return false;
    })
  
    if (filteredValues.length === 0){
      throw "no ID found";
    } else if (filteredValues.length > 1) {
      throw "there seems to be a duplicate ID!";
    }
  
    return {"rowNumber": rowNumber, "row": filteredValues[0]}
  }
  
  updateValue(id, header, value) {
    Logger.log("Updating Value")
    const { rowNumber } = this.getRow(id)

    const colIndex = this.headers.indexOf(header)
    if (colIndex === -1) throw "No such header"

    this.sheet.getRange(rowNumber, colIndex).setValue(value)
    return {rowUpdated: rowNumber}
  }
  
  updateRow(id, row) {
    Logger.log("Updating Row")
    const { rowNumber } = this.getRow(id)
    if (row.length !== this.headers.length) throw "wrong size of row"
  }

  createUniqueKey() {
    const ids = this.data.map(row => row[0])
  
    let newKey;
    if (allKeysUnique(ids)) {
      const sortedIds = ids.sort((a,b) => a - b)
      newKey = sortedIds[sortedIds.length - 1] + 1
    } else {
      throw "Your table has duplicate keys, please verify and remove duplicates."
    }
  
    return newKey;
  }

  /**
   * @param {array} ids
   */
  allKeysUnique() {
    const checker = {}
    try {
      this.ids.forEach(id => {
        if (checker.hasOwnProperty(id)) {
          throw "duplicate keys!"
        } else {
          checker[id] = 1
        }
      })
    } catch (e) {
      return false
    }
    return true
  }

}



