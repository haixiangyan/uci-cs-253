const fs = require('fs')
const path = require('path')

const SEPARATOR = /[ \t\n,.'":;_\-!@#$%^&*()<>\/\\{}\[\]+=|~`?]+/
const UTF8 = 'utf8'

if (process.argv.length !== 4){
    console.log('Usage: node index.js stop_words.txt pride-and-prejudice.txt')
    return
}
const stopWordsPath = path.join('../', process.argv[2])
const articlePath = path.join('../', process.argv[3])

// Function to get term frequency from a given article
function termFrequency(stopWordsPath, articlePath) {
    const stopWords = new Set(fs.readFileSync(stopWordsPath, UTF8).split(','))
    const article = fs.readFileSync(articlePath, UTF8)
    const words = article.split(SEPARATOR).map(word => word.toLowerCase())

    let frequency = {}
    words.forEach(word => {
        if (!stopWords.has(word)) {
            if (!frequency[word]) {
                frequency[word] = 0
            }
            frequency[word] += 1
        }
    })

    return frequency
}

// Test
const results = termFrequency(stopWordsPath, articlePath)

// Test cases
const TEST_CASES = {
    mr: 786,
    elizabeth: 635,
    very: 488,
    darcy: 418,
    such: 395,
    mrs: 343,
    much: 329,
    more: 327,
    bennet: 323,
    bingley: 306,
    jane: 295,
    miss: 283,
    one: 275,
    know: 239,
    before: 229,
    herself: 227,
    though: 226,
    well: 224,
    never: 220,
    sister: 218,
    soon: 216,
    think: 211,
    now: 209,
    time: 203,
    good: 201
}

let isPass = true
for (let [word, frequency] of Object.entries(TEST_CASES)) {
    if (results[word] !== frequency) {
        isPass = false
    }
    console.log(`Current: ${word} Result: ${results[word]} Actual: ${frequency}`)
}

console.log(isPass ? 'Passed all test cases!' : 'Some test cases fail')
