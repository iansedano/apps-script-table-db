namespace TableEntryMethods {
  export function getEntriesByFilter(this: _Table, filter: Filter) {
    const rowResults = this.getRowsByFilter(filter);
    if (rowResults.length === 0) return [];

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
  
  export function addEntry(this: _Table, entry: Entry) {
    const row = this.headers.map((header) => entry[header])
    this.addRow(row)
  }
}
