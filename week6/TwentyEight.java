import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class TwentyEight {
    private static final String INIT = "init";
    private static final String FILTERED_WORD = "filtered_word";
    private static final String RESET_COUNT = "reset_count";
    private static final String UNFILTERED_WORD = "unfiltered_word";
    private static final String PRINT_TOP_25 = "print_top_25";
    private static final String PROCESS_WORDS = "process_words";
    private static final String TERMINATE = "terminate";
    private static final String REGISTER_FOR_UPDATES = "register_for_updates";

    abstract private static class ActiveWFObject extends Thread {
        private boolean mStop = false;
        private final LinkedBlockingQueue<Message<?>> mMsgQueue = new LinkedBlockingQueue<>();
        protected final List<ActiveWFObject> mRecipients = new ArrayList<>();

        @Override
        public void run() {
            while (!mStop) {
                Message<?> msg;
                try {
                    msg = mMsgQueue.take();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
                if (msg.getOperationId().equals(TERMINATE)) {
                    mStop = true;
                    forwardMessage(msg);
                } else if (msg.getOperationId().equals(REGISTER_FOR_UPDATES) &&
                        msg instanceof ActorMessage) {
                    for (ActiveWFObject a : ((ActorMessage)msg).getArgs()) {
                        mRecipients.add(a);
                    }
                } else {
                    dispatch(msg);
                }
            }
        }

        protected void forwardMessage(Message<?> msg) {
            for (ActiveWFObject a : mRecipients) {
                a.acceptMessage(msg);
            }
        }

        protected void acceptMessage(Message<?> msg) { mMsgQueue.add(msg); }

        abstract protected void dispatch(Message<?> msg);
    }

    private static class DataStorageManager extends ActiveWFObject {

        private String mFileContents;

        @Override
        protected void dispatch(Message<?> msg) {
            if (msg.getOperationId().equals(INIT) && msg instanceof StringMessage) {
                this.init((StringMessage) msg);
            } else if (msg.getOperationId().equals(PROCESS_WORDS)) {
                this.processWords();
            } else {
                forwardMessage(msg);
            }
        }

        private void init(StringMessage msg) {
            String filepath = msg.getArgs()[0];
            try (Stream<String> lines = Files.lines(Paths.get(filepath))) {
                mFileContents = lines.map(line -> line.toLowerCase().replaceAll("[^a-zA-Z\\d\\s]", " ")).
                        collect(Collectors.joining(System.lineSeparator()));
            } catch (IOException ioe) {
                throw new RuntimeException(ioe);
            }
        }

        private void processWords() {
            if (mFileContents == null) {
                return;
            }
            String[] words = mFileContents.split("\\s+");
            for (String w : words) {
                for (ActiveWFObject a : mRecipients) {
                    a.acceptMessage(new StringMessage(UNFILTERED_WORD, w));
                }
            }
            mRecipients.stream().forEach(r -> r.acceptMessage(new StringMessage(PRINT_TOP_25)));
            this.acceptMessage(new StringMessage(TERMINATE));
        }
    }

    private static class StopWordManager extends ActiveWFObject {

        private Set<String> mStopWords;

        @Override
        protected void dispatch(Message<?> msg) {
            if (msg.getOperationId().equals(INIT)) {
                init();
            } else if (msg.getOperationId().equals(UNFILTERED_WORD) && msg instanceof StringMessage) {
                filterWord((StringMessage) msg);
            } else {
                forwardMessage(msg);
            }
        }

        private void filterWord(StringMessage msg) {
            for (String w : msg.getArgs()) {
                if (!mStopWords.contains(w)) {
                    for (ActiveWFObject a : mRecipients) {
                        a.acceptMessage(new StringMessage(FILTERED_WORD, w));
                    }
                }
            }
        }

        private void init() {
            try (Stream<String> swStream = Files.lines(Paths.get("../stop_words.txt"))) {
                mStopWords = Stream.concat(swStream.map(line -> line.split(",")).flatMap(Arrays::stream),
                        Arrays.stream("a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(","))).
                        collect(Collectors.toCollection(HashSet::new));
            } catch (IOException ioe) {
                throw new RuntimeException(ioe);
            }
        }
    }

    private static class WordFrequencyManager extends ActiveWFObject {

        private Map<String, Integer> mWordFreqs;

        @Override
        protected void dispatch(Message<?> msg) {
            if (msg.getOperationId().equals(INIT) ||
                    msg.getOperationId().equals(RESET_COUNT)) {
                mWordFreqs = new HashMap<>();
            } else if (msg.getOperationId().equals(FILTERED_WORD) && msg instanceof StringMessage) {
                incrementWordCount((StringMessage) msg);
            } else if (msg.getOperationId().equals(PRINT_TOP_25)) {
                printTop25();
            } else {
                forwardMessage(msg);
            }
        }

        private void printTop25() {
            mWordFreqs
                .entrySet()
                .stream()
                .sorted((e1,e2) -> -e1.getValue().compareTo(e2.getValue()))
                .limit(25)
                .forEach(e -> System.out.println(String.format("%s  -  %d", e.getKey(), e.getValue())));
        }

        private void incrementWordCount(StringMessage msg) {
            for (String w : msg.getArgs()) {
                mWordFreqs.merge(w, 1, (current, one) -> current + one);
            }
        }
    }

    private static class StringMessage extends Message<String> {
        private StringMessage(String operationId, String... args) { super(operationId, args); }
    }

    private static class ActorMessage extends Message<ActiveWFObject> {
        private ActorMessage(String operationId, ActiveWFObject... args) { super(operationId, args); }
    }

    abstract private static class Message<T> {
        private final String mOperationId;
        private final T[] mArgs;

        private Message(String operationId, T... args) {
            mOperationId = operationId;
            mArgs = args;
        }

        public String getOperationId() { return mOperationId; }

        public T[] getArgs() { return mArgs; }
    }

    public static void main(String[] args) throws InterruptedException {
        String articlePath = "../pride-and-prejudice.txt";

        DataStorageManager dataStorageManager = new DataStorageManager();
        StopWordManager stopWordManager = new StopWordManager();
        WordFrequencyManager wordFreqManager = new WordFrequencyManager();
        ActiveWFObject[] actors = new ActiveWFObject[] { dataStorageManager, stopWordManager, wordFreqManager };
        for (ActiveWFObject a : actors) {
            a.start();
        }

        dataStorageManager.acceptMessage(new StringMessage(INIT, articlePath));
        stopWordManager.acceptMessage(new StringMessage(INIT));
        wordFreqManager.acceptMessage(new StringMessage(INIT));

        dataStorageManager.acceptMessage(new ActorMessage(REGISTER_FOR_UPDATES, stopWordManager));
        stopWordManager.acceptMessage(new ActorMessage(REGISTER_FOR_UPDATES, wordFreqManager));
        dataStorageManager.acceptMessage(new StringMessage(PROCESS_WORDS));
        for (ActiveWFObject a : actors) {
            a.join();
        }
    }
}
