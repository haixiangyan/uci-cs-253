const fs = require('fs')

const UTF8 = 'utf8'

let allWords = [[], null]
let stopWords = [[], null]

let nonStopWords = [[], () => {
    return allWords[0].filter(word => !stopWords[0].has(word))
}]
let uniqueWords = [[], () => {
    return nonStopWords[0]
}]
let counts = [[], () => {
    let frequency = {}
    uniqueWords[0].forEach(word => {
        if (!frequency[word]) {
            frequency[word] = 0
        }
        frequency[word] += 1
    })
    return frequency
}]
let sortedData = [[], () => {
    let rawCounts = []
    for (let [word, frequency] of Object.entries(counts[0])) {
        rawCounts.push({word, frequency})
    }

    return rawCounts.sort((a, b) => b.frequency - a.frequency)
}]

const allColumns = [allWords, stopWords, nonStopWords, uniqueWords, counts, sortedData]

function update() {
    for (let c of allColumns) {
        if (c[1]) {
            c[0] = c[1]()
        }
    }
}

const stopWordsFile = process.argv[2]
const articleFile = process.argv[3]

const pattern = /[a-zA-Z]{2,}/g
allWords[0] = fs.readFileSync(articleFile, UTF8).match(pattern).map(word => word.toLowerCase())
stopWords[0] = new Set(
    fs.readFileSync(stopWordsFile, UTF8)
        .split(',')
        .map(stopWord => stopWord.replace('\n', ''))
)

update()

for (let i = 0; i < 25; i++) {
    console.log(sortedData[0][i].word, '-', sortedData[0][i].frequency)
}
