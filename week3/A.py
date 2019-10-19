import re, sys, operator

# Mileage may vary. If this crashes, make it lower
RECURSION_LIMIT = 5000
# We add a few more, because, contrary to the name,
# this doesn't just rule recursion: it rules the
# depth of the call stack
sys.setrecursionlimit(1000000)

def wf_print(wordfreq):
    def wfp(f, wf):
        print wf[0][0], '-', wf[0][1]
        f(wf[1:])
    Y = lambda f: (lambda x: f(lambda v: x(x)(v))) (lambda y: f(lambda u: y(y)(u)))
    fact = (lambda f: lambda wf: None if len(wf) == 0 else wfp(f,wf))
    Y(fact)(wordfreq)

def count(word_list, stopwords, wordfreqs):
    def stat(wordlist, stopwords, wordfreq, f):
        word = wordlist[0]
        if word not in stopwords:
            if word not in wordfreq:
                wordfreq[word] = 0
            wordfreq[word] += 1
        f(wordlist[1:])
         
    Y = lambda f: (lambda x: f(lambda v: x(x)(v))) (lambda y: f(lambda u: y(y)(u)))
    fact = (lambda f: (lambda word_list: None if len(word_list) == 0 else stat(word_list, stopwords, wordfreqs, f)))
    Y(fact)(word_list)

stop_words = set(open('../stop_words.txt').read().split(','))
words = re.findall('[a-z]{2,}', open(sys.argv[1]).read().lower())

word_freqs = {}
# Theoretically, we would just call count(words, stop_words, word_freqs)
# Try doing that and see what happens.
for i in range(0, len(words), RECURSION_LIMIT):
    count(words[i:i+RECURSION_LIMIT], stop_words, word_freqs)

wf_print(sorted(word_freqs.items(), key=operator.itemgetter(1), reverse=True)[:25])