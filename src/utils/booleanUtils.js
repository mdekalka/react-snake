export function getRandomNumberExcluded(min, max, excluded = []) {
  let n = Math.floor(Math.random() * (max-min) + min);

  if (excluded.includes(n)) {
    n++;
  }

  return n;
}

// TODO: kinda ugly, create a new one w/o looping
export function getRandomNumbersExcluded(min, max, limit, excluded = []) {
  let resultNumbers = [];

  new Array(limit).fill(0).forEach(count => {
    const number = getRandomNumberExcluded(min, max, [...excluded, ...resultNumbers]);

    resultNumbers.push(number);
  });

  return resultNumbers;
}

export function getBoolean(factor = 0.1) { // default ~10% probability of getting true.
  return Math.random() < factor;
}

export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
