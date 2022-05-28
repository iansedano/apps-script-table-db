namespace TableGetMethods {
  export function getColumnByHeader(
    this: Table,
    headerName: string
  ): Array<any> {
    if (!this._headers.includes(headerName)) return undefined;

    const columnIndex: number = this._headers.indexOf(headerName);

    return this._entries.map((entry) => entry[columnIndex]).flat();
  }

  export function getRowById(this: Table, searchId: number): RowResult {
    for (const [index, id] of this._ids.entries()) {
      if (id === searchId) {
        // index + 1 because rows begin at 1 not 0
        const rowNumber = index + 1;
        const row = this._sheet
          .getRange(rowNumber, 1, 1, this.numColumns)
          .getValues()[0];
        return { rowNumber, row };
      }
    }

    return undefined;
  }

  export function addIndicesToFilterObject(this: Table, filter: Object) {
    return Object.entries(filter).reduce(
      (acc: Object, [header, value]: [string, any]): Object => {
        if (!this._headers.includes(header)) throw `"${header}" not found`;
        acc[header] = {
          index: this._headers.indexOf(header),
          value: value,
        };
        return acc;
      },
      {}
    );
  }

  export function getRowsByFilter(
    this: Table,
    filterObject: Object
  ): Array<Array<any>> {
    // TODO - what if someone wants to get certain range of ids...
    // TODO - Limit of number of cells??

    const filter = this._addIndicesToFilterObject(filterObject);

    const rowResults: Array<Array<any>> = this._entries.reduce(
      (output: Array<any>, row: Array<any>, index: number): Array<any> => {
        // Going through filter object to see if match
        // returns unmodified output if not.

        if (
          Object.entries(filter).every(
            ([header, { headerIndex, value }]): boolean => {
              if (row[headerIndex] == value) return true;
              return false;
            }
          )
        ) {
          output.push(row);
        }
        return output;
      },
      []
    );

    if (rowResults.length === 0) console.log("no results");

    return rowResults;
  }
}
