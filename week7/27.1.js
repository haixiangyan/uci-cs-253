const fs = require('fs')

const UTF8 = 'utf8'

function *characters(filename) {
    let lines = fs.readFileSync(filename, UTF8).split('\n')
    for (let line of lines) {
        for (let c of line) {
            yield c
        }
    }
}

function *allWords(filename) {
    const pattern = /[a-zA-Z]{2,}/g
    const words = fs.readFileSync(filename, UTF8).match(pattern).map(word => word.toLowerCase())
    for (let word of words) {
        yield word
    }
}

function *nonStopWords(filename) {
    const stopWords = new Set(
        fs.readFileSync(stopWordsFile, UTF8)
            .split(',')
            .map(stopWord => stopWord.replace('\n', ''))
    )

    for (let word of allWords(filename)) {
        if (!stopWords.has(word)) {
            yield word
        }
    }
}

function *countAndSort(filename) {
    let freqs = {}

    for (let word of nonStopWords(filename)) {
        freqs[word] = freqs[word] ? freqs[word] + 1 : 1
    }

    yield sorted(freqs)
}

function sorted(freqs) {
    let rawCounts = []
    for (let [word, frequency] of Object.entries(freqs)) {
        rawCounts.push({word, frequency})
    }

    return rawCounts.sort((a, b) => b.frequency - a.frequency)
}

const stopWordsFile = '../stop_words.txt'
const articleFile = '../pride-and-prejudice.txt'

const result = countAndSort(articleFile).next().value

for (let i = 0; i < 25; i++) {
    console.log(result[i].word, '-', result[i].frequency)
}
