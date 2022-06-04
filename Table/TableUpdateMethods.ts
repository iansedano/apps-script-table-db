namespace TableUpdateMethods {
  export function createUniqueKeys(
    this: Table,
    numberOfKeys: number
  ): Array<number> {
    if (this.ids.length == 0) {
      return [1];
    }

    const sortedIds = this.ids.sort((idA, idB) => idA - idB);

    const newKeys = [];
    for (let i = 0; i != numberOfKeys; i++) {
      newKeys.push(sortedIds[sortedIds.length - 1] + 1 + i);
    }

    return newKeys;
  }

  export function updateValue(
    this: Table,
    idToUpdate: number,
    headerName: string,
    value: any
  ): number {
    if (!this.headers.includes(headerName)) return undefined;

    const rowNumber: number = this.getIdRowNumber(idToUpdate);

    const colNumber = this.headers.indexOf(headerName) + 1;

    this.sheet.getRange(rowNumber, colNumber).setValue(value);
    this.update();
    return rowNumber;
  }

  export function updateRow(
    this: Table,
    idToUpdate: number,
    newRowValues: Array<any>
  ): void {
    const row = this.getRowById(idToUpdate);

    if (row[0] !== newRowValues[0]) throw "IDs don't match";
    if (row.length > this.headers.length) throw "wrong size of row";

    this.sheet
      .getRange(this.getIdRowNumber(idToUpdate), 1, 1, newRowValues.length)
      .setValues([newRowValues]); // must be Array<Array<any>>
    this.update();
  }

  export function deleteRow(this: Table, idToDelete: number): void {
    const rowNumber: number = this.getIdRowNumber(idToDelete);

    this.sheet.deleteRow(rowNumber);
    this.update();
  }
}
