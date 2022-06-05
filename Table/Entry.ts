/**
 * Object representing a row, with each key is a header name, and the value
 * is the row value
 */
type Entry = { id?: number };

// class Entry {
//   public id: number;
//   constructor(object: { [key: string]: Value }) {
//     if (!object.hasOwnProperty("id")) Object.assign(this, object);
//     this.id = object.id;
//   }
// }

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
