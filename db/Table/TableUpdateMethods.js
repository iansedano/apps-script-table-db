Table.prototype.addRow = (row) => {
  Logger.log("Adding row");
  if (row.length !== this.headers.length) throw "wrong size of row";
  if (row[0] !== "") throw "id position (index 0) must be blank string"
  row[0] = createUniqueKey()
  this.sheet.appendRow(row);
};

Table.prototype.updateValue = (id, header, value) => {
  Logger.log("Updating Value");
  const { rowNumber } = this.getRow(id);

  const colIndex = this.headers.indexOf(header);
  if (colIndex === -1) throw "No such header";

  this.sheet.getRange(rowNumber, colIndex).setValue(value);
  return { rowUpdated: rowNumber };
};

Table.prototype.updateRow = (row) => {
  Logger.log("Updating Row");
  const { rowNumber } = this.getRow(row[id]);
  if (row.length !== this.headers.length) throw "wrong size of row";
  
  this.sheet.getRange(rowNumber, 1, 1, headers.length).setValues(row)
};

Table.prototype.deleteRow = (id) => {
  // TODO
};
