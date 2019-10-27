const fs = require('fs')

const UTF8 = 'utf8'

function extractWords(articleFilePath, stopWordsFilePath) {
    // Article
    const wordList = fs.readFileSync(articleFilePath, UTF8)
                        .match(/[a-zA-Z]{2,}/g)
                        .map(word => word.toLowerCase())

    // Stop words
    const stopWords = new Set(
        fs.readFileSync(stopWordsFilePath, UTF8)
            .split(',')
            .map(stopWord => stopWord.replace('\n', ''))
    )

    return wordList.filter(word => !stopWords.has(word))
}
