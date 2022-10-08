/**
 * Object where key represents header and the value is the filter value
 * for that header.
 */
type RawFilter = { [key: string]: any };

/**
 * Extension of the {@link Filter} type that includes the column index of the header name
 */
type IndexedFilter = { [key: string]: { headerColIndex: number; value: any } };

class Filter {
  protected params: IndexedFilter;

  constructor(filterObject: RawFilter = null, headers: string[]) {
    if (filterObject == null) {
      this.params = {};
      return;
    }

    this.params = Object.entries(filterObject).reduce(
      (acc: IndexedFilter, [header, value]: [string, any]): IndexedFilter => {
        if (!headers.includes(header)) throw `"${header}" not found`;
        acc[header] = {
          headerColIndex: headers.indexOf(header),
          value: value
        };
        return acc;
      },
      {}
    );
  }

  public filter(frame: Frame) {
    return frame.filter((row: Series) => {
      return Object.entries(this.params).every(
        ([headerName, { headerColIndex, value }]): boolean =>
          row[headerColIndex] == value
      );
    });
  }
}
