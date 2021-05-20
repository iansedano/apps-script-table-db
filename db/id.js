function createUniqueKey(tableName) {
  const { data } = getTable(tableName)

  const ids = data.map(row => row[0])

  let newKey;
  if (allKeysUnique(ids)) {
    const sortedIds = ids.sort((a,b) => a - b)
    newKey = sortedIds[sortedIds.length - 1] + 1
  } else {
    throw "Your table has duplicate keys, please verify and remove duplicates."
  }

  return newKey;
}


/**
 * @param {array} ids
 */
function allKeysUnique(ids) {
  const checker = {}

  try {
    ids.forEach(id => {
      if (checker.hasOwnProperty(id)) {
        throw "duplicate keys!"
      } else {
        checker[id] = 1
      }
    })
  } catch (e) {
    return false
  }

  return true
}