const fs = require('fs')

const UTF8 = 'utf8'

class TFTheOne {
    constructor(v) {
        this._value = v
    }

    bind(func) {
        this._value = func(this._value)
        return this
    }

    printme() {
        console.log(this._value)
    }
}

function readFile() {
    return fs.readFileSync(articleFile, UTF8)
}

function filter(strData) {
    const pattern = /[a-zA-Z]{2,}/g
    return strData.match(pattern)
}

function normalize(wordList) {
    return wordList.map(word => word.toLowerCase())
}

function scan(wordList) {
    return wordList
}

function removeStopWords(wordList) {
    const stopWords = new Set(fs.readFileSync(stopWordsFile, UTF8).split(',').map(stopWord => stopWord.replace('\n', '')))
    return wordList.filter(word => !stopWords.has(word))
}

function frequencies(wordList) {
    let wordFreq = {}
    for (let word of wordList) {
        if (wordFreq[word]) {
            wordFreq[word] += 1
        }
        else {
            wordFreq[word] = 1
        }
    }

    return wordFreq
}

function sort(wordFreq) {
    let rawCounts = []
    for (let [word, frequency] of Object.entries(wordFreq)) {
        rawCounts.push({word, frequency})
    }

    return rawCounts.sort((a, b) => b.frequency - a.frequency)
}

function top25Freqs(wordFreqs) {
    let top25 = ''
    for (let i = 0; i < 25; i++) {
        top25 += `${wordFreqs[i].word} - ${wordFreqs[i].frequency}\n`
    }
    return top25
}

const stopWordsFile = '../stop_words.txt'
const articleFile = '../pride-and-prejudice.txt'

new TFTheOne(articleFile)
    .bind(readFile)
    .bind(filter)
    .bind(normalize)
    .bind(scan)
    .bind(removeStopWords)
    .bind(frequencies)
    .bind(sort)
    .bind(top25Freqs)
    .printme()
