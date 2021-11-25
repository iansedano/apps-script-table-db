namespace TableEntryMethods {
  export function getEntriesByFilter(this: _Table, filter: Filter) {
    const rowResults = this.getRowsByFilter(filter);

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
}
