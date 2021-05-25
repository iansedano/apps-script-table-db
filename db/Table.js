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
    this.data = this.convertIdsToInt(values.slice(2))
    this.ids = this.data.map(row => row[0])
    if (allKeysUnique(this.ids) === false) throw "all keys are not unique!"
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

  getRowsByValue(header, value) {
    const headerIndex = this.headers.indexOf(header)
    if (headerIndex === -1) throw "no matching header"

    const match = this.data.filter(row => row[headerIndex] === value)

    if (match.length === 0) throw "no values found"
    
    return match;
  }
  
  
}



