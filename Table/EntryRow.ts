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
