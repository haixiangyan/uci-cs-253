const fs = require('fs')

const UTF8 = 'utf8'

function splitWords(dataStr) {
    function _scan(strData) {
        const pattern = /[a-zA-Z]{2,}/g
        return strData.match(pattern).map(word => word.toLowerCase())
    }

    function _removeStopWords(wordList) {
        const stopWords = new Set(readFile(stopWordsPath).split(','))
        return wordList.filter(word => !stopWords.has(word))
    }

    let result = []
    const words = _removeStopWords(_scan(dataStr))
    for (let word of words) {
        result.push([word, 1])
    }
    return result
}

function regroup(pairsList) {
    let mapping = {}
    for (let pair of pairsList) {
        if (mapping[pair[0]]) {
            mapping[pair[0]].push(pair[1])
        }
        else {
            mapping[pair[0]] = [pair[1]]
        }
    }
    return mapping
}

function countWords(mapping) {
    function add(x, y) {
        return x + y
    }

    for (let key of Object.keys(mapping)) {
        mapping[key] = mapping[key].reduce(add)
    }

    return mapping
}

const articlePath = process.argv[2]
const stopWordsPath = process.argv[3]

function sort(wordFreq) {
    let rawCounts = []
    for (let [word, frequency] of Object.entries(wordFreq)) {
        rawCounts.push({word, frequency})
    }

    return rawCounts.sort((a, b) => b.frequency - a.frequency)
}

function readFile(pathToFile) {
    return fs.readFileSync(pathToFile, UTF8)
}

const wf = sort(countWords(regroup(splitWords(readFile(articlePath)))))

for (let i = 0; i <= 25; i++) {
    console.log(wf[i].word, '-', wf[i].frequency)
}
