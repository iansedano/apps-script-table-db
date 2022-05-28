namespace TableEntryMethods {
  export function getEntries(this: Table, filter: Object = null) {
    const rowResults = this.getRowsByFilter(filter || {});
    if (rowResults.length === 0) return [];
    if (rowResults[0][0] == "id") throw "header values are being returned";

    const entries: Array<Entry> = rowResults.map((row) => {
      // Assuming headers are already loaded...
      return row.reduce(
        (output: Entry, value: any, index: number) => {
          const header = this._headers[index];
          output[header] = value;
          return output;
        },
        {} // output init
      );
    });

    return entries;
  }

  export function addEntry(this: Table, entry: Entry): void {
    const row = this._headers.map((header) => entry[header]);
    console.log(row);
    this.addRow(row);
    SpreadsheetApp.flush();
  }
}
