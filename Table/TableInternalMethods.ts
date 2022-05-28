namespace TableInternalMethods {
  export function _loadData(this: Table): void {
    this._dataRange = this._sheet.getDataRange();
    this._values = this._dataRange.getValues();
    this._headers = this._values[0];
    if (this._headers[0] !== "id") throw "first column must be 'id' lowercase";
    this.numRows = this._values.length;
    this.numColumns = this._values[0].length;

    if (this.numRows == 1) {
      this._entryRange = null;
      this._entries = [];
      this._ids = [];
    } else if (this.numRows > 1) {
      this._entryRange = this._sheet.getRange(
        2,
        1,
        this.numRows - 1,
        this.numColumns
      );
      this._entries = this._values.slice(1, -1);

      this._ids = this._entries
        .map((entry) => {
          if (typeof entry[0] !== "number")
            throw `All IDs must be numbers, ${entry[0]} is not a number`;
          return entry[0];
        })
        .flat();
    } else throw "0 rows? Headers must be present";
  }

  export function _getRowNumber(this: Table, searchId: number): number {
    for (const [index, id] of this._ids.entries()) {
      if (id === searchId) {
        // index + 1 because rows begin at 1 not 0
        const rowNumber = index + 1;
        return rowNumber;
      }
    }
  }
}
