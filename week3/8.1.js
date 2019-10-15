const fs = require('fs')

const UTF8 = 'utf8'

function readFile(pathToFile, func) {
    const data = fs.readFileSync(pathToFile, 'utf8')
    // func -> filterChars
    func(data, normalize)
}

function filterChars(strData, func) {
    const pattern = /[a-zA-Z]{2,}/g
    // func -> normalize
    func(strData.match(pattern), scan)
}

function normalize(wordList, func) {
    // func -> scan
    func(wordList.map(word => word.toLowerCase()), removeStopWords)
}

function scan(wordList, func) {
    // func -> removeStopWords
    func(wordList, frequencies)
}

function removeStopWords(wordList, func) {
    const stopWords = new Set(
        fs.readFileSync(stopWordsFile, UTF8)
            .split(',')
            .map(stopWord => stopWord.replace('\n', ''))
    )
    // func -> frequencies
    func(wordList.filter(word => !stopWords.has(word)), sort)
}

function frequencies(wordList, func) {
    let wordFreq = {}
    for (let word of wordList) {
        if (wordFreq[word]) {
            wordFreq[word] += 1
        }
        else {
            wordFreq[word] = 1
        }
    }

    // func -> sort
    func(wordFreq, printText)
}

function sort(wordFreq, func) {
    let rawCounts = []
    for (let [word, frequency] of Object.entries(wordFreq)) {
        rawCounts.push({word, frequency})
    }

    // func -> printText
    func(rawCounts.sort((a, b) => b.frequency - a.frequency), noOp)
}

function printText(wordFreqs, func) {
    for (let i = 0; i < 25; i++) {
        console.log(wordFreqs[i].word, '-', wordFreqs[i].frequency)
    }
    // func -> noOp
    func(null)
}

function noOp(func) {
    return
}

const stopWordsFile = process.argv[2]
const articleFile = process.argv[3]

readFile(articleFile, filterChars)
