class _SheetDb {
  SS_ID: string;

  constructor(SS_ID: string) {
    this.SS_ID = SS_ID;
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy

  loadTable(name: string) {
    if (!this[name]) {
      this[name] = new Table(this.SS_ID, name);
    }
  }
}

const SheetDbHandler = {
  get: function (target, prop) {
    if (!target[prop]) {
      target.loadTable(prop);
    }

    return target[prop];
  }
};

function SheetDb(SS_ID: string) {
  const sheetDb = new _SheetDb(SS_ID);
  return new Proxy(sheetDb, SheetDbHandler);
}
