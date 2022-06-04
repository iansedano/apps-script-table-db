namespace TableInternalMethods {
  export function _loadData(this: Table): void {
    this.dataRange = this.sheet.getDataRange();
    this.allValues = this.dataRange.getValues();
    this.headers = this.allValues[0];
    if (this.headers[0] !== "id") throw "first column must be 'id' lowercase";
    this.numRows = this.allValues.length;
    this.numColumns = this.allValues[0].length;

    if (this.numRows == 1) {
      this.entryRange = null;
      this.entryArray = [];
      this.ids = [];
    } else if (this.numRows > 1) {
      this.entryRange = this.sheet.getRange(
        2,
        1,
        this.numRows - 1,
        this.numColumns
      );
      this.entryArray = this.allValues.slice(1, -1);

      this.ids = this.entryArray
        .map((entry) => {
          if (typeof entry[0] !== "number")
            throw `All IDs must be numbers, ${entry[0]} is not a number`;
          return entry[0];
        })
        .flat();
    } else throw "0 rows? Headers must be present";
  }

  export function _getIdRowNumber(this: Table, searchId: number): number {
    for (const [index, id] of this.ids.entries()) {
      if (id === searchId) {
        // index + 1 because rows begin at 1 not 0
        const rowNumber = index + 1;
        return rowNumber;
      }
    }
  }
}
