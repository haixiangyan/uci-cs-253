const fs = require('fs')

const UTF8 = 'utf8'

function readFile(pathToFile) {
    return fs.readFileSync(pathToFile, UTF8)
}

function filterAndNormalize(strData) {
    const pattern = /[a-zA-Z]{2,}/g
    return strData.match(pattern).map(word => word.toLowerCase())
}

function removeStopWords(wordList) {
    const stopWords = new Set(fs.readFileSync('../stop_words.txt', UTF8).split(',').map(stopWord => stopWord.replace('\n', '')))
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

function printAll(wordFreqs) {
    for (let i = 0; i < 25; i++) {
        console.log(wordFreqs[i].word, '-', wordFreqs[i].frequency)
    }
}

printAll(
    sort(
        frequencies(
            removeStopWords(
                filterAndNormalize(
                    readFile(process.argv[2])
                )
            )
        )
    )
)
