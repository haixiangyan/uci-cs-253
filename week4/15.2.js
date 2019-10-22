const fs = require('fs')

const UTF8 = 'utf8'

class EventManager {
    constructor() {
        this._subscriptions = {}
    }

    subscribe(eventType, handler) {
        if (this._subscriptions[eventType]) {
            this._subscriptions[eventType].push(handler)
        }
        else {
            this._subscriptions[eventType] = [handler]
        }
    }

    publish(event) {
        const eventType = event[0]
        if (this._subscriptions[eventType]) {
            for (let h of this._subscriptions[eventType]) {
                h(event)
            }
        }
    }
}

class DataStorage {
    constructor(eventManager) {
        this._eventManager = eventManager
        this._eventManager.subscribe('load', this.load.bind(this))
        this._eventManager.subscribe('start', this.produceWords.bind(this))
    }

    load(event) {
        const pathToFile = event[1]
        this._data = fs.readFileSync(pathToFile, UTF8)
        const pattern = /[a-zA-Z]{2,}/g
        this._data = this._data.match(pattern).map(word => word.toLowerCase())
    }

    produceWords(event) {
        for (let word of this._data) {
            this._eventManager.publish(['word', word])
        }
        this._eventManager.publish(['eof', null])
    }
}

class StopWordFilter {
    constructor(eventManager) {
        this._stopWords = []
        this._eventManager = eventManager
        this._eventManager.subscribe('load', this.load.bind(this))
        this._eventManager.subscribe('word', this.isStopWord.bind(this))
    }

    load(event) {
        this._stopWords = new Set(
            fs.readFileSync(stopWordsFile, UTF8)
                .split(',')
                .map(stopWord => stopWord.replace('\n', ''))
        )
    }

    isStopWord(event) {
        const word = event[1]
        if (!this._stopWords.has(word)) {
            this._eventManager.publish(['valid_word', word])
        }
    }
}

class WordFrequencyCounter {
    constructor(eventManager) {
        this._wordFreqs = {}
        this._eventManager = eventManager
        this._eventManager.subscribe('valid_word', this.incrementCount.bind(this))
        this._eventManager.subscribe('print', this.printFreqs.bind(this))
    }

    incrementCount(event) {
        const word = event[1]
        if (this._wordFreqs[word]) {
            this._wordFreqs[word] += 1
        }
        else {
            this._wordFreqs[word] = 1
        }
    }

    printFreqs(event) {
        const wordFreqs = this.sort(this._wordFreqs)
        for (let i = 0; i < 25; i++) {
            console.log(wordFreqs[i].word, '-', wordFreqs[i].frequency)
        }
    }

    sort(wordFreq) {
        let rawCounts = []
        for (let [word, frequency] of Object.entries(wordFreq)) {
            rawCounts.push({word, frequency})
        }

        return rawCounts.sort((a, b) => b.frequency - a.frequency)
    }
}

class WordFrequencyApplication {
    constructor(eventManager) {
        this._eventManager = eventManager
        this._eventManager.subscribe('run', this.run.bind(this))
        this._eventManager.subscribe('eof', this.stop.bind(this))
    }

    run(event) {
        const pathToFile = event[1]
        this._eventManager.publish(['load', pathToFile])
        this._eventManager.publish(['start', null])
    }

    stop(event) {
        this._eventManager.publish(['print', null])
    }
}

// New class is added
class WordsWithZ {
    constructor(eventManager) {
        this.words = new Set()
        this._eventManager = eventManager
        this._eventManager.subscribe('valid_word', this.appendWord.bind(this))
        this._eventManager.subscribe('print', this.printWordsWithZ.bind(this))
    }

    appendWord(event) {
        // Non stop word
        const word = event[1]
        if (word.indexOf('z') >= 0) {
            this.words.add(word)
        }
    }

    printWordsWithZ(event) {
        console.log('The number of non-stop words with the letter z: ' + this.words.size)
    }
}

const stopWordsFile = '../stop_words.txt'
const articleFile = '../pride-and-prejudice.txt'

const em = new EventManager()
new DataStorage(em)
new StopWordFilter(em)
new WordFrequencyCounter(em)
new WordFrequencyApplication(em)
new WordsWithZ(em)
em.publish(['run', articleFile])
