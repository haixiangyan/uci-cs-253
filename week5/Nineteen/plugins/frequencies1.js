function top25(wordList) {
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

    // Sort
    let rawCounts = []
    for (let [word, frequency] of Object.entries(wordFreq)) {
        rawCounts.push({word, frequency})
    }

    return rawCounts.sort((a, b) => b.frequency - a.frequency)
}
