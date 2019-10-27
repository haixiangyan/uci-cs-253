const fs = require('fs')
const UTF8 = 'utf8'

function extractWords(articleFilePath, stopWordsFilePath) {
    const pattern = /[a-zA-Z]{2,}/g

    // Article
    const article = fs.readFileSync(articleFilePath, UTF8)
    const wordList = article.match(pattern).map(word => word.toLowerCase())

    // Stop words
    const stopWords = new Set(
        fs.readFileSync(stopWordsFilePath, UTF8)
            .split(',')
            .map(stopWord => stopWord.replace('\n', ''))
    )

    return wordList.filter(word => !stopWords.has(word))
}
