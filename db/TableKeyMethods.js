Table.prototype.createUniqueKey = () => {
  const ids = this.data.map((row) => row[0]);

  let newKey;
  if (allKeysUnique(ids)) {
    const sortedIds = ids.sort((a, b) => a - b);
    newKey = sortedIds[sortedIds.length - 1] + 1;
  } else {
    throw "Your table has duplicate keys, please verify and remove duplicates.";
  }

  return newKey;
};

/**
 * @param {array} ids
 */
Table.prototype.allKeysUnique = (ids) => {

  const checker = {};
  try {
    ids.forEach((id) => {
      if (checker.hasOwnProperty(id)) {
        throw "duplicate key! " + id;
      } else {
        checker[id] = 1;
      }
    });
  } catch (e) {
    console.log(e)
    return false;
  }
  return true;
};


Table.prototype.convertIdsToInt = (values) => {
    return values.map(row => {
        let id;
        try {
          id = parseInt(row[0])
          if (Number.isNaN(id)) throw "Cannot parse value into integer";
        } catch (e) {
          throw `There is something wrong with id "${row[0]}" in your table\n${e}`;
        }
        row[0] = id
        return row;
      })
}
