const fs = require('fs')

const UTF8 = 'utf8'

function readFile() {
    const strData = fs.readFileSync(articleFile, 'utf8')

    return {
        filterAndNormalize() {
            const pattern = /[a-zA-Z]{2,}/g
            const words = strData.match(pattern).map(word => word.toLowerCase())

            return {
                removeStopWords() {
                    const stopWords = new Set(fs.readFileSync(stopWordsFile, UTF8).split(',').map(stopWord => stopWord.replace('\n', '')))
                    const wordList = words.filter(word => !stopWords.has(word))

                    return {
                        frequencies() {
                            let wordFreq = {}
                            for (let word of wordList) {
                                if (wordFreq[word]) {
                                    wordFreq[word] += 1
                                } else {
                                    wordFreq[word] = 1
                                }
                            }

                            return {
                                sort() {
                                    let rawCounts = []
                                    for (let [word, frequency] of Object.entries(wordFreq)) {
                                        rawCounts.push({word, frequency})
                                    }

                                    const wordFreqs = rawCounts.sort((a, b) => b.frequency - a.frequency)

                                    return {
                                        printAll() {
                                            for (let i = 0; i < 25; i++) {
                                                console.log(wordFreqs[i].word, '-', wordFreqs[i].frequency)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

const stopWordsFile = process.argv[2]
const articleFile = process.argv[3]

readFile().filterAndNormalize().removeStopWords().frequencies().sort().printAll()
