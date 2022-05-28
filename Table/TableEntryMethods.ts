namespace TableEntryMethods {
  export function getEntries(this: _Table, filter: Filter = null) {
    const rowResults = this.getRowsByFilter(filter || {});
    if (rowResults.length === 0) return [];
    if (rowResults[0].row[0] == "id") throw "header values are being returned";

    const entries: Array<Entry> = rowResults.map((rowResult) => {
      // Assuming headers are already loaded...
      return rowResult.row.reduce(
        (output: Entry, value: any, index: number) => {
          const header = this.headers[index];
          output[header] = value;
          return output;
        },
        {} // output init
      );
    });

    return entries;
  }

  export function addEntry(this: _Table, entry: Entry): void {
    const row = this.headers.map((header) => entry[header]);
    console.log(row);
    this.addRow(row);
  }
}
