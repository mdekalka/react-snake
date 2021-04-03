export function difference(searchArray = [], toRemoveArray = []) {
  return searchArray.filter(item => { return !toRemoveArray.includes(item)});
}

export function arrayToHash(array = [], key = 'id') {
  return array.reduce((result, current) => {
    if (!result[key]) {
      result[current[key]] = current;
    }

    return result;
  }, {});
}
