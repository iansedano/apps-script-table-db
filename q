[1mdiff --git a/Table/Table.ts b/Table/Table.ts[m
[1mindex 55121c8..cfcad60 100644[m
[1m--- a/Table/Table.ts[m
[1m+++ b/Table/Table.ts[m
[36m@@ -1,11 +1,3 @@[m
[31m-/*[m
[31m-[m
[31m-The design of this class must take into account the fact that the[m
[31m-table will be reinitialized at every execution. Hence loading ids, headers,[m
[31m-values are all done depending on the task at hand.[m
[31m-[m
[31m-*/[m
[31m-[m
 type RowResult = {[m
   rowNumber: number;[m
   row: Array<any>;[m
[36m@@ -16,7 +8,6 @@[m [mtype ColumnResult = {[m
   column: Array<any>;[m
 };[m
 [m
[31m-type Filter = {}; // key is header and value is value to filter[m
 type OrderedFilterObject = { headers: string[]; values: any[] };[m
 type Entry = { id?: number };[m
 [m
[36m@@ -24,7 +15,7 @@[m [minterface TableInterface {[m
   getIds(): Array<number>;[m
   getHeaders(): Array<string>;[m
 [m
[31m-  getEntries(filterObject: Filter): Array<Entry>; // empty obj returns everything[m
[32m+[m[32m  getEntries(filterObject: Object): Array<Entry>; // empty obj returns everything[m
 [m
   addEntry(entry: Entry): void;[m
 [m
[36m@@ -65,18 +56,58 @@[m [mclass Table implements TableInterface {[m
     return this._headers;[m
   }[m
   public clearEntries(): void {[m
[31m-    this._loadData();[m
[32m+[m[32m    // this._loadData(); // Probably not needed but might be good to have as failsafe[m
     this._entryRange.clear();[m
   }[m
 [m
[32m+[m[32m  protected _loadData(this: Table): void {[m
[32m+[m[32m    this._dataRange = this._sheet.getDataRange();[m
[32m+[m[32m    this._values = this._dataRange.getValues();[m
[32m+[m[32m    this._headers = this._values[0];[m
[32m+[m[32m    if (this._headers[0] !== "id") throw "first column must be 'id' lowercase";[m
[32m+[m[32m    this.numRows = this._values.length;[m
[32m+[m[32m    this.numColumns = this._values[0].length;[m
[32m+[m
[32m+[m[32m    if (this.numRows == 1) {[m
[32m+[m[32m      this._entryRange = null;[m
[32m+[m[32m      this._entries = [];[m
[32m+[m[32m      this._ids = [];[m
[32m+[m[32m    } else if (this.numRows > 1) {[m
[32m+[m[32m      this._entryRange = this._sheet.getRange([m
[32m+[m[32m        2,[m
[32m+[m[32m        1,[m
[32m+[m[32m        this.numRows - 1,[m
[32m+[m[32m        this.numColumns[m
[32m+[m[32m      );[m
[32m+[m[32m      this._entries = this._values.slice(1, -1);[m
[32m+[m
[32m+[m[32m      this._ids = this._entries[m
[32m+[m[32m        .map((entry) => {[m
[32m+[m[32m          if (typeof entry[0] !== "number")[m
[32m+[m[32m            throw `All IDs must be numbers, ${entry[0]} is not a number`;[m
[32m+[m[32m          return entry[0];[m
[32m+[m[32m        })[m
[32m+[m[32m        .flat();[m
[32m+[m[32m    } else throw "0 rows? Headers must be present";[m
[32m+[m[32m  }[m
[32m+[m
   protected _update = () => {[m
     SpreadsheetApp.flush();[m
     // Utilities.sleep(1000)[m
     this._loadData();[m
   };[m
 [m
[31m-  protected _getRowNumber = TableInternalMethods._getRowNumber;[m
[31m-  protected _loadData = TableInternalMethods._loadData;[m
[32m+[m[32m  protected _getIdRowNumber(this: Table, searchId: number): number {[m
[32m+[m[32m    for (const [index, id] of this._ids.entries()) {[m
[32m+[m[32m      if (id === searchId) {[m
[32m+[m[32m        // index + 1 because rows begin at 1 not 0[m
[32m+[m[32m        const rowNumber = index + 1;[m
[32m+[m[32m        return rowNumber;[m
[32m+[m[32m      }[m
[32m+[m[32m    }[m
[32m+[m[32m  }[m
[32m+[m[32m  protected _addIndicesToFilterObject =[m
[32m+[m[32m    TableGetMethods.addIndicesToFilterObject;[m
 [m
   public getColumnByHeader = TableGetMethods.getColumnByHeader;[m
   public getRowById = TableGetMethods.getRowById;[m
[1mdiff --git a/Table/TableEntryMethods.ts b/Table/TableEntryMethods.ts[m
[1mindex f17a787..d591581 100644[m
[1m--- a/Table/TableEntryMethods.ts[m
[1m+++ b/Table/TableEntryMethods.ts[m
[36m@@ -1,12 +1,12 @@[m
 namespace TableEntryMethods {[m
[31m-  export function getEntries(this: Table, filter: Filter = null) {[m
[32m+[m[32m  export function getEntries(this: Table, filter: Object = null) {[m
     const rowResults = this.getRowsByFilter(filter || {});[m
     if (rowResults.length === 0) return [];[m
[31m-    if (rowResults[0].row[0] == "id") throw "header values are being returned";[m
[32m+[m[32m    if (rowResults[0][0] == "id") throw "header values are being returned";[m
 [m
[31m-    const entries: Array<Entry> = rowResults.map((rowResult) => {[m
[32m+[m[32m    const entries: Array<Entry> = rowResults.map((row) => {[m
       // Assuming headers are already loaded...[m
[31m-      return rowResult.row.reduce([m
[32m+[m[32m      return row.reduce([m
         (output: Entry, value: any, index: number) => {[m
           const header = this._headers[index];[m
           output[header] = value;[m
[1mdiff --git a/Table/TableGetMethods.ts b/Table/TableGetMethods.ts[m
[1mindex 1982704..ed039af 100644[m
[1m--- a/Table/TableGetMethods.ts[m
[1m+++ b/Table/TableGetMethods.ts[m
[36m@@ -2,19 +2,12 @@[m [mnamespace TableGetMethods {[m
   export function getColumnByHeader([m
     this: Table,[m
     headerName: string[m
[31m-  ): ColumnResult {[m
[32m+[m[32m  ): Array<any> {[m
     if (!this._headers.includes(headerName)) return undefined;[m
[31m-    if (!this._dataRange) this._loadData();[m
 [m
[31m-    const columnNumber: number = this._headers.indexOf(headerName) + 1;[m
[32m+[m[32m    const columnIndex: number = this._headers.indexOf(headerName);[m
 [m
[31m-    return {[m
[31m-      columnNumber,[m
[31m-      column: this._sheet[m
[31m-        .getRange(2, columnNumber, this.numRows, 1)[m
[31m-        .getValues()[m
[31m-        .flat(),[m
[31m-    };[m
[32m+[m[32m    return this._entries.map((entry) => entry[columnIndex]).flat();[m
   }[m
 [m
   export function getRowById(this: Table, searchId: number): RowResult {[m
[36m@@ -32,65 +25,44 @@[m [mnamespace TableGetMethods {[m
     return undefined;[m
   }[m
 [m
[32m+[m[32m  export function addIndicesToFilterObject(this: Table, filter: Object) {[m
[32m+[m[32m    return Object.entries(filter).reduce([m
[32m+[m[32m      (acc: Object, [header, value]: [string, any]): Object => {[m
[32m+[m[32m        if (!this._headers.includes(header)) throw `"${header}" not found`;[m
[32m+[m[32m        acc[header] = {[m
[32m+[m[32m          index: this._headers.indexOf(header),[m
[32m+[m[32m          value: value,[m
[32m+[m[32m        };[m
[32m+[m[32m        return acc;[m
[32m+[m[32m      },[m
[32m+[m[32m      {}[m
[32m+[m[32m    );[m
[32m+[m[32m  }[m
[32m+[m
   export function getRowsByFilter([m
     this: Table,[m
[31m-    filterObject: Filter[m
[31m-  ): Array<RowResult> {[m
[32m+[m[32m    filterObject: Object[m
[32m+[m[32m  ): Array<Array<any>> {[m
     // TODO - what if someone wants to get certain range of ids...[m
     // TODO - Limit of number of cells??[m
 [m
[31m-    // Initializing columns to be searched, array of columns with all values in column[m
[31m-    let columnResults: Array<ColumnResult> = [];[m
[31m-    // Initializing transformation of the filterObject into arrays to be iterated over[m
[31m-    let filter: OrderedFilterObject = { headers: ["id"], values: [null] }; // null can mean "any"[m
[31m-[m
[31m-    // For each header[m
[31m-    // Could be optimized by getting adjacent columns in one call[m
[31m-    for (const header in filterObject) {[m
[31m-      if (!this._headers.includes(header)) throw `"${header}" not found`;[m
[31m-      filter.headers.push(header);[m
[31m-      filter.values.push(filterObject[header]);[m
[31m-      columnResults.push(this.getColumnByHeader(header));[m
[31m-    }[m
[31m-[m
[31m-    // Creating intermediate value array with ids and the values that are being filtered[m
[31m-    const valuesToFilter = this._ids.map((id: number, index: number) => {[m
[31m-      return [[m
[31m-        id,[m
[31m-        ...columnResults.map([m
[31m-          (columnResult: ColumnResult) => columnResult.column[index][m
[31m-        ),[m
[31m-      ];[m
[31m-    });[m
[31m-[m
[31m-    // https://developers.google.com/apps-script/reference/spreadsheet/sheet#getrangelista1notations[m
[32m+[m[32m    const filter = this._addIndicesToFilterObject(filterObject);[m
 [m
[31m-    // Using intermediate array, valuesToFilter to return an array of RowResults[m
[31m-    // TODO - this gets each row individually from sheet, doesn't filter in memory[m
[31m-    const rowResults: Array<RowResult> = valuesToFilter.reduce([m
[31m-      ([m
[31m-        output: Array<RowResult>,[m
[31m-        row: Array<any>,[m
[31m-        index: number,[m
[31m-        array: any[m
[31m-      ): Array<RowResult> => {[m
[32m+[m[32m    const rowResults: Array<Array<any>> = this._entries.reduce([m
[32m+[m[32m      (output: Array<any>, row: Array<any>, index: number): Array<any> => {[m
         // Going through filter object to see if match[m
         // returns unmodified output if not.[m
[31m-        for (const [index, rowValue] of row.entries()) {[m
[31m-          const filterValue = filter.values[index];[m
 [m
[31m-          if (rowValue != filterValue && filterValue != null) {[m
[31m-            return output;[m
[31m-          }[m
[32m+[m[32m        if ([m
[32m+[m[32m          Object.entries(filter).every([m
[32m+[m[32m            ([header, { headerIndex, value }]): boolean => {[m
[32m+[m[32m              if (row[headerIndex] == value) return true;[m
[32m+[m[32m              return false;[m
[32m+[m[32m            }[m
[32m+[m[32m          )[m
[32m+[m[32m        ) {[m
[32m+[m[32m          output.push(row);[m
         }[m
[31m-        // If here, means that filter matches.[m
[31m-        const rowNumber = index + 2;[m
[31m-        output.push({[m
[31m-          rowNumber,[m
[31m-          row: this._sheet[m
[31m-            .getRange(rowNumber, 1, 1, this.numColumns)[m
[31m-            .getValues()[0],[m
[31m-        });[m
         return output;[m
       },[m
       [][m
[1mdiff --git a/Table/TableInternalMethods.ts b/Table/TableInternalMethods.ts[m
[1mindex 3caf4ce..581f9e4 100644[m
[1m--- a/Table/TableInternalMethods.ts[m
[1m+++ b/Table/TableInternalMethods.ts[m
[36m@@ -30,7 +30,7 @@[m [mnamespace TableInternalMethods {[m
     } else throw "0 rows? Headers must be present";[m
   }[m
 [m
[31m-  export function _getRowNumber(this: Table, searchId: number): number {[m
[32m+[m[32m  export function _getIdRowNumber(this: Table, searchId: number): number {[m
     for (const [index, id] of this._ids.entries()) {[m
       if (id === searchId) {[m
         // index + 1 because rows begin at 1 not 0[m
