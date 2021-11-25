class _SheetDb {
  SS_ID: string;

  constructor(SS_ID: string) {
    this.SS_ID = SS_ID;

    return new Proxy(this, {
      get: function (target, prop: string) {
        if (!target[prop]) {
          target.loadTable(prop);
        }

        return target[prop];
      }
    });
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy

  loadTable(name: string) {
    if (!this[name]) {
      this[name] = new Table(this.SS_ID, name);
    }
  }
}

var SheetDb = _SheetDb;
