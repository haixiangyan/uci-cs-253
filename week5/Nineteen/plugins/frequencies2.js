function top25(wordList) {
    // Make frequencies
    const wordFreq = frequencies(wordList)

    // Sort
    const top25 = sort(wordFreq)

    return top25
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
