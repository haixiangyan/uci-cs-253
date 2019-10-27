const fs = require('fs')
const UTF8 = 'utf8'

function loadStopWords() {
    // Inspect stack
    if (loadStopWords.caller !== extractWords) {
        return
    }
    return new Set(
        fs.readFileSync(stopWordsFile, UTF8)
            .split(',')
            .map(stopWord => stopWord.replace('\n', ''))
    )
}

function extractWords(pathToFile) {
    // Inspect stack
    if (extractWords.caller !== main) {
        return
    }
    const pattern = /[a-zA-Z]{2,}/g
    const stopWords = loadStopWords.call()
    const article = fs.readFileSync(pathToFile, UTF8)
    return article.match(pattern).map(word => word.toLowerCase()).filter(word => !stopWords.has(word))
}

function frequencies(wordList) {
    // Inspect stack
    if (frequencies.caller !== main) {
        return
    }
    // Make frequencies
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
    // Inspect stack
    if (sort.caller !== main) {
        return
    }
    let rawCounts = []
    for (let [word, frequency] of Object.entries(wordFreq)) {
        rawCounts.push({word, frequency})
    }

    return rawCounts.sort((a, b) => b.frequency - a.frequency)
}

const stopWordsFile = process.argv[2]
const articleFile = process.argv[3]

function main() {
    const wordFreqs = sort.call(null,
        (frequencies.call(null,
            (extractWords.call(null,
                (articleFile))))))

    for (let i = 0; i < 25; i++) {
        console.log(wordFreqs[i].word, '-', wordFreqs[i].frequency)
    }
}

main.call()
