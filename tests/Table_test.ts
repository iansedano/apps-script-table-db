function test() {
  const table = new Table(...config.TEST_TABLE);
  console.log("TABLE INITIALIZED");

  console.log("should contain 1000", table.getRowById(3));
  console.log(table.getColumnByHeader("date"));
  // console.log(table.getRowsByValue("steps", 1000));
  console.log(table.getRowsByFilter({ steps: 1000 }));
  console.log("CREATING KEYS");
  console.log(table.createUniqueKeys(3));
  console.log(table.createUniqueKeys(1));
  console.log("ADDING ROWS");
  table.addRow(["", "5/6/2021", "2021", "5", "14", "2000", "1", 1, 2, 4]);
  table.addRow(["", "5/6/2021", "2021", "5", "14", "5000", "1", 1, 2, 4]);
  // console.log(table.getRowsByValue("steps", 5000));
  console.log(table.getRowsByFilter({ steps: 5000 }));

  SpreadsheetApp.flush(); // TODO !! This needs to be integrated into the class

  table.updateValue(13, "steps", 9999);
  table.updateRow(13, [13, 1, 1, 1, 1]);
  table.deleteRow(12);
}
