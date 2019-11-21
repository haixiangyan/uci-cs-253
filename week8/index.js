const fs = require('fs')

const UTF8 = 'utf8'

// '../pride-and-prejudice.txt'
const articleFile = process.argv[2]

const rawData = fs.readFileSync(articleFile, UTF8)

const LEET = {
    A: '4',
    B: '13',
    C: '<',
    D: '|>',
    E: '3',
    F: '|=',
    G: 'C-',
    H: '4',
    I: '1',
    J: '7',
    K: '|<',
    L: '1',
    M: '44',
    N: '|\|',
    O: '0',
    P: '|>',
    Q: '9',
    R: '12',
    S: '5',
    T: '7',
    U: '|_|',
    V: '\/',
    W: '\/\/',
    X: '>K',
    Y: '`/',
    Z: '2',
    0: 'O',
    1: 'l',
    2: 'e',
    3: 'E',
    4: 'h',
    5: 'S',
    6: 'b',
    7: 'T',
    8: 'B',
    9: 'g'
}

const countReducer = (accumulator, currentSymbol, index, stringArray) => {
    // Ignore first element
    if (index === 0) {
        return accumulator
    }

    const current2Gram = `${stringArray[index - 1]} ${currentSymbol}`

    // Count frequency
    if (!accumulator[current2Gram]) {
        accumulator[current2Gram] = 0
    }
    accumulator[current2Gram] += 1

    return accumulator
}

const sortHelper = (a, b) => b[1] - a[1]

const printEach = ([char, count]) => console.log(`"${char}" - ${count}`)

Object.entries(
    rawData
        .split('')
        .filter(char => /[a-zA-Z0-9]/.test(char))
        .map(char => char.toUpperCase())
        .map(char => LEET[char])
        .reduce(countReducer, {})
)
    .sort(sortHelper)
    .slice(0, 5)
    .forEach(printEach)
