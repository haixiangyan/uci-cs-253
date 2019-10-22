const fs = require('fs')

const UTF8 = 'utf8'

function extractWords(obj, pathToFile) {
    const article = fs.readFileSync(pathToFile, UTF8)
    const pattern = /[a-zA-Z]{2,}/g
    obj['data'] = article.match(pattern).map(word => word.toLowerCase())
}

function loadStopWords(obj, pathToFile) {
    obj['stopWords'] = new Set(
        fs.readFileSync(pathToFile, UTF8)
            .split(',')
            .map(stopWord => stopWord.replace('\n', ''))
    )
}

function incrementCount(obj, word) {
    obj['freqs'][word] = !obj['freqs'][word] ? 1 : obj['freqs'][word] + 1
}

function sort(wordFreq) {
    let rawCounts = []
    for (let [word, frequency] of Object.entries(wordFreq)) {
        rawCounts.push({word, frequency})
    }

    return rawCounts.sort((a, b) => b.frequency - a.frequency)
}

let dataStorageObj = {
    data: [],
    init: (pathToFile) => extractWords(dataStorageObj, pathToFile),
    words: () => dataStorageObj['data']
}

let stopWordsObj = {
    stopWords: [],
    init: () => loadStopWords(stopWordsObj, stopWordsFile),
    isStopWord: (word) => stopWordsObj['stopWords'].has(word)
}

let wordFreqsObj = {
    freqs: {},
    incrementCount: (word) => incrementCount(wordFreqsObj, word),
    sorted: () => sort(wordFreqsObj['freqs'])
}

const articleFile = '../pride-and-prejudice.txt'
const stopWordsFile = '../stop_words.txt'

stopWordsObj['init']()
dataStorageObj['init'](articleFile)

const words = dataStorageObj['words']()
for (let word of words) {
    if (!stopWordsObj['isStopWord'](word)) {
        wordFreqsObj['incrementCount'](word)
    }
}

// =======================================
// Print results
const results = wordFreqsObj['sorted']()
for (let i = 0; i < 25; i++) {
    console.log(results[i].word, '-', results[i].frequency)
}

