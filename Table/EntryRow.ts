// TODO - remove
type RowResult = {
  rowNumber: number;
  row: Array<any>;
};
/** Values allowed in spreadsheet */
type Value = string | number | Date | boolean;
/** One dimensional array of cell values, could be row or column */
type Series = Value[];
/** Array of {@link Series} representing a spreadsheet value range */
type Frame = Series[];

/**
 * Object representing a row, with each key is a header name, and the value
 * is the row value
 */
type Entry = { id?: number };

function rowToEntry(row: Series, headers: string[]): Entry {
  return row.reduce((output: Entry, value: Value, index: number): Entry => {
    const header = headers[index];
    output[header] = value;
    return output;
  }, {});
}

function entryToRow(entry: Entry, headers: string[]): Series {
  Object.keys(entry).forEach((key: string) => {
    if (!headers.includes(key)) throw `${key} in entry not in headers`;
  });

  return headers.map((header) => entry[header]);
}
