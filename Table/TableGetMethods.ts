namespace TableGetMethods {
  export function getColumnByHeader(
    this: Table,
    headerName: string
  ): Array<any> {
    if (!this.headers.includes(headerName)) return undefined;

    const columnIndex: number = this.headers.indexOf(headerName);

    return this.entries.map((entry) => entry[columnIndex]).flat();
  }

  export function getRowById(this: Table, searchId: number): RowResult {
    for (const [index, id] of this.ids.entries()) {
      if (id === searchId) {
        // index + 1 because rows begin at 1 not 0
        const rowNumber = index + 1;
        const row = this.sheet
          .getRange(rowNumber, 1, 1, this.numColumns)
          .getValues()[0];
        return { rowNumber, row };
      }
    }

    return undefined;
  }
}
