const fs = require('fs')
const ini = require('ini')

const UTF8 = 'utf8'

function loadPlugins() {
    const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'))

    if (!config.Plugins) {
        console.log('Make sure config the config.ini correctly')
    }

    eval(fs.readFileSync(config.Plugins.words, UTF8))
    eval(fs.readFileSync(config.Plugins.frequencies, UTF8))

    return top25(extractWords(articleFile, stopWordsFile))
}

const stopWordsFile = process.argv[2]
const articleFile = process.argv[3]

const wordFreqs = loadPlugins(articleFile, stopWordsFile)

for (let i = 0; i < 25; i++) {
    console.log(wordFreqs[i].word, '-', wordFreqs[i].frequency)
}
