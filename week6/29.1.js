const fs = require('fs')
const { Worker, isMainThread } = require('worker_threads');

let wordSpace = []
let freqSpace = []

const stopWordsPath = '../stop_words.txt'
const articlePath = '../pride-and-prejudice.txt'
const UTF8 = 'utf8'

const stopWords = new Set(fs.readFileSync(stopWordsPath, UTF8).split(','))

function processWords() {
    let wordFreqs = {}
    while (wordSpace.length !== 0) {
        const word = wordSpace.pop()

        if (!stopWords.has(word)) {
            if (wordFreqs[word]) {
                wordFreqs[word] += 1
            }
            else {
                wordFreqs[word] = 1
            }
        }
    }
    freqSpace.push(wordFreqs)
}

const wordList = fs.readFileSync(articlePath, 'utf8').match(/[a-zA-Z]{2,}/g).map(word => word.toLowerCase())
for (let word of wordList) {
    wordSpace.push(word)
}
processWords()

let workers = []
for (let i = 0; i < 5; i++) {
    try {
        workers.push(new Worker(processWords))
    }
    catch(e) {}
}

let wordFreqs = {}
while (freqSpace.length !== 0) {
    const freqs = freqSpace.pop()
    for (let [k, v] of Object.entries(freqs)) {
        let count = 0
        if (wordFreqs[k]) {
            count = wordFreqs[k] + v
        }
        else {
            count = v
        }
        wordFreqs[k] = count
    }
}

let rawCounts = []
for (let [word, frequency] of Object.entries(wordFreqs)) {
    rawCounts.push({word, frequency})
}

rawCounts.sort((a, b) => b.frequency - a.frequency)

for (let i = 0; i < 25; i++) {
    console.log(rawCounts[i].word, '-', rawCounts[i].frequency)
}


