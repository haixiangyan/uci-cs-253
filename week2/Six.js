const fs = require('fs')

const UTF8 = 'utf8'
const DELIMITER = /([A-Za-z]{2,})/g
const stops = new Set(fs.readFileSync('../stop_words.txt', UTF8).split(','))
const words = fs.readFileSync('../pride-and-prejudice.txt', UTF8).match(DELIMITER).map(word => word.toLowerCase())

// Make it a dict
let freq = {}
words.forEach(word => {
    if (!stops.has(word)) {
        if (!freq[word]) {
            freq[word] = 0
        }
        freq[word] += 1
    }
})
// Make it an array
let counts = []
for (let [word, frequency] of Object.entries(freq)) {
    counts.push({word, frequency})
}
// Sort it
counts.sort((a, b) => {
    return b.frequency - a.frequency
})

// Print out results
for (let i = 0; i < 25; i++) {
    console.log(counts[i].word, counts[i].frequency)
}
