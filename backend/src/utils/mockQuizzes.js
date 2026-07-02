const REALISTIC_QUIZZES = {
  react: {
    BASIC: [
      {
        question: "What is the correct syntax to define a basic functional component in React?",
        options: [
          "function MyComponent() { return <div>Hello</div>; }",
          "const MyComponent = <div>Hello</div>;",
          "class MyComponent extends Component { render() { return <div>Hello</div>; } }",
          "const MyComponent() => <div>Hello</div>"
        ],
        answerIndex: 0
      },
      {
        question: "Which hook is used to perform side effects in functional React components?",
        options: [
          "useState",
          "useContext",
          "useEffect",
          "useReducer"
        ],
        answerIndex: 2
      },
      {
        question: "How do you pass data from a parent component down to a child component in React?",
        options: [
          "By updating the local state of the child",
          "Using props",
          "By importing the parent component into the child",
          "Using the useReducer hook"
        ],
        answerIndex: 1
      },
      {
        question: "What does JSX stand for in React development?",
        options: [
          "JavaScript XML",
          "Java Syntax Extension",
          "JavaScript Extended Style",
          "JSON eXtensible format"
        ],
        answerIndex: 0
      }
    ],
    INTERMEDIATE: [
      {
        question: "What is the primary purpose of the useCallback hook in React?",
        options: [
          "To execute side-effects asynchronously after rendering",
          "To cache computed values that are expensive to calculate",
          "To memoize a callback function to prevent unnecessary renders of child components",
          "To store mutable values that do not trigger re-render on change"
        ],
        answerIndex: 2
      },
      {
        question: "In React, what occurs under the hood when a state setter function is called?",
        options: [
          "React updates the state synchronously and immediately re-paints the DOM",
          "React schedules a re-render of the component and updates state asynchronously",
          "React restarts the application virtual DOM structure",
          "The browser is forced to perform a full page refresh"
        ],
        answerIndex: 1
      },
      {
        question: "When using useContext, what is the best practice to prevent consumers from re-rendering on unrelated context updates?",
        options: [
          "Wrap consumer components in React.memo",
          "Use a single context provider to manage all state variables",
          "Split context values into multiple smaller contexts",
          "Avoid using useState inside the context provider"
        ],
        answerIndex: 2
      },
      {
        question: "What is a major advantage of using useReducer over useState?",
        options: [
          "useReducer runs on a separate CPU thread",
          "useReducer automatically persists state to localStorage",
          "useReducer is ideal for managing complex state logic with multiple sub-values and transitions",
          "useReducer compiles to faster native machine instructions"
        ],
        answerIndex: 2
      }
    ],
    MASTER: [
      {
        question: "How does React's Fiber architecture enable concurrent rendering capabilities?",
        options: [
          "It compiles JSX code directly into optimized WebAssembly modules",
          "It utilizes Web Workers to process virtual DOM diffs on a background thread",
          "It splits rendering work into incremental units, allowing pausing, resuming, and prioritization of updates",
          "It completely removes the virtual DOM in favor of direct observable binds"
        ],
        answerIndex: 2
      },
      {
        question: "When building a custom state manager, how does useSyncExternalStore solve the tearing problem in concurrent rendering?",
        options: [
          "It runs state updates inside microtasks to guarantee synchronization",
          "It forces synchronous reading of the external store during render, avoiding visual inconsistencies",
          "It disables the concurrent mode features entirely for the whole subtree",
          "It clones the store data and synchronizes it using a Service Worker"
        ],
        answerIndex: 1
      },
      {
        question: "What is the most effective optimization for rendering massive, dynamic lists (e.g., 10,000+ rows) in React?",
        options: [
          "Wrapping every single row component inside React.Fragment",
          "Using useLayoutEffect instead of useEffect inside row render loops",
          "List virtualization (windowing) to render only the visible viewport items",
          "Increasing the browser rendering thread priority using requestAnimationFrame"
        ],
        answerIndex: 2
      }
    ]
  },
  'html & css': {
    BASIC: [
      {
        question: "Which HTML5 semantic element is most appropriate for containing standalone, reusable content like blog posts?",
        options: [
          "<section>",
          "<article>",
          "<div>",
          "<aside>"
        ],
        answerIndex: 1
      },
      {
        question: "What is the difference between relative and absolute positioning in CSS?",
        options: [
          "Relative positions an element relative to the viewport; absolute positions it relative to its parent",
          "Relative positions relative to its normal document flow position; absolute positions relative to the nearest positioned ancestor",
          "Relative elements are removed from normal flow; absolute elements remain in the normal document flow",
          "There is no functional difference; they are legacy synonyms"
        ],
        answerIndex: 1
      },
      {
        question: "Which CSS property is used to change the text color of an HTML element?",
        options: [
          "text-color",
          "font-color",
          "color",
          "background-color"
        ],
        answerIndex: 2
      }
    ],
    INTERMEDIATE: [
      {
        question: "What is the primary difference between CSS Grid and Flexbox layout models?",
        options: [
          "Flexbox is 2-dimensional (rows and columns); CSS Grid is 1-dimensional (rows only)",
          "Flexbox is 1-dimensional (row OR column); CSS Grid is 2-dimensional (rows AND columns)",
          "CSS Grid requires JavaScript to render; Flexbox is styling-only",
          "Flexbox is supported by legacy browsers only; CSS Grid is standard on mobile devices"
        ],
        answerIndex: 1
      },
      {
        question: "How do CSS Custom Variables (CSS variables) differ from preprocessor variables (like Sass or Less)?",
        options: [
          "CSS variables can be updated dynamically in the browser using JavaScript; preprocessor variables compile to static values",
          "Preprocessor variables support inheritance; CSS variables do not",
          "CSS variables are only supported in mobile web browsers",
          "CSS variables require an external server framework to resolve"
        ],
        answerIndex: 0
      },
      {
        question: "What is CSS specificity, and how is it calculated for style declarations?",
        options: [
          "It determines the priority of rules based on weight: inline styles (1000), IDs (100), classes/attributes (10), elements (1)",
          "It is the character count of the CSS selector string",
          "It refers to whether a rule is defined inside an external stylesheet or inline tag",
          "It measures the layout speed of the rendered element"
        ],
        answerIndex: 0
      }
    ],
    MASTER: [
      {
        question: "Which CSS property can trigger hardware acceleration (GPU) to improve animation performance?",
        options: [
          "will-change: transform, opacity",
          "transition: all 1s ease",
          "display: flow-root",
          "z-index: 9999"
        ],
        answerIndex: 0
      },
      {
        question: "What is the role of contain-intrinsic-size and content-visibility CSS properties in rendering optimization?",
        options: [
          "They load low-resolution placeholder images automatically",
          "They skip rendering off-screen elements and preserve layout sizing to avoid layout shifts",
          "They enable CSS selectors to target elements based on screen aspect ratio",
          "They compile CSS rules in separate CPU cores"
        ],
        answerIndex: 1
      },
      {
        question: "How does the browser's Rendering Pipeline handle layout and paint processes when CSS transform changes?",
        options: [
          "It forces full Reflow, Paint, and Composite calculations",
          "It skips Reflow and Paint, and goes straight to Compositing (if GPU accelerated)",
          "It triggers layout calculations on every frame",
          "It blocks the main execution thread completely"
        ],
        answerIndex: 1
      }
    ]
  },
  'node.js': {
    BASIC: [
      {
        question: "What is Node.js?",
        options: [
          "A client-side UI framework built on top of React",
          "A database query engine specifically for NoSQL",
          "A JavaScript runtime built on Chrome's V8 engine that runs on the server",
          "A cloud platform for deploying static websites"
        ],
        answerIndex: 2
      },
      {
        question: "Which core Node.js module is used to work with files and directories?",
        options: [
          "path",
          "fs",
          "http",
          "os"
        ],
        answerIndex: 1
      },
      {
        question: "In Node.js, what is the role of npm?",
        options: [
          "To compile JavaScript code into native executable code",
          "A package manager used to install third-party packages and manage dependencies",
          "A database system that caches query results",
          "An administrative server control panel"
        ],
        answerIndex: 1
      }
    ],
    INTERMEDIATE: [
      {
        question: "What is the purpose of the Node.js Event Loop?",
        options: [
          "To run CPU-bound operations in parallel using multi-threading",
          "To execute asynchronous non-blocking I/O callbacks sequentially on a single thread",
          "To automatically backup files to database storage",
          "To direct network requests to different web servers"
        ],
        answerIndex: 1
      },
      {
        question: "Which of the following describes the difference between setImmediate() and process.nextTick() in Node.js?",
        options: [
          "setImmediate runs on the next iteration of the Event Loop; process.nextTick runs immediately after the current operation finishes",
          "process.nextTick runs after setImmediate",
          "setImmediate uses multiple threads; process.nextTick uses a single thread",
          "They are exact synonyms and perform the same action in all phases"
        ],
        answerIndex: 0
      },
      {
        question: "What is the benefit of using Streams in Node.js instead of fs.readFile() for reading large files?",
        options: [
          "Streams encrypt file data during reading",
          "Streams read data in chunks without loading the entire file into memory, reducing usage",
          "Streams automatically index databases",
          "Streams format the output as valid JSON"
        ],
        answerIndex: 1
      }
    ],
    MASTER: [
      {
        question: "How do Worker Threads in Node.js differ from child processes?",
        options: [
          "Worker Threads run in separate OS processes; child processes share the same process memory space",
          "Worker Threads share memory using SharedArrayBuffer; child processes communicate via IPC and run in separate memory spaces",
          "Child processes do not support JavaScript execution",
          "Worker Threads cannot handle asynchronous code blocks"
        ],
        answerIndex: 1
      },
      {
        question: "What does the V8 garbage collector do under the hood when resolving memory leaks in a Node.js process?",
        options: [
          "It restarts the process once memory usage exceeds 1GB",
          "It uses a generational mark-and-sweep algorithm to identify and reclaim unreachable memory allocations",
          "It writes memory blocks to local file caches",
          "It delegates memory cleanup tasks to the operating system swap files"
        ],
        answerIndex: 1
      },
      {
        question: "In Node.js streams, what is backpressure and how is it resolved?",
        options: [
          "It is a database timeout caused by too many parallel queries",
          "It occurs when a writable stream writes slower than a readable stream reads; resolved by pausing the readable stream when the buffer is full",
          "It is a network congestion issue resolved by adding proxy nodes",
          "It refers to CPU bottleneck resolving through load balancing"
        ],
        answerIndex: 1
      }
    ]
  },
  'mongodb': {
    BASIC: [
      {
        question: "What type of database is MongoDB?",
        options: [
          "Relational Database Management System (RDBMS)",
          "Document-oriented NoSQL Database",
          "Graph Database",
          "In-memory key-value cache"
        ],
        answerIndex: 1
      },
      {
        question: "In MongoDB, what format is used to store documents in collection files?",
        options: [
          "SQL tables",
          "XML documents",
          "BSON (Binary JSON)",
          "YAML lines"
        ],
        answerIndex: 2
      },
      {
        question: "Which command/method is used to retrieve documents from a MongoDB collection?",
        options: [
          "db.collection.find()",
          "db.collection.select()",
          "db.collection.get()",
          "db.collection.query()"
        ],
        answerIndex: 0
      }
    ],
    INTERMEDIATE: [
      {
        question: "What is the purpose of creating Indexes in MongoDB?",
        options: [
          "To compress database size on the disk",
          "To accelerate query execution speeds by preventing full collection scans",
          "To encrypt sensitive data values",
          "To validate schema consistency automatically"
        ],
        answerIndex: 1
      },
      {
        question: "What does the MongoDB Aggregation Pipeline do?",
        options: [
          "It splits database storage across multiple servers",
          "It processes documents through multi-stage operations (filtering, grouping, sorting) to return computed results",
          "It backs up database collections to cloud storage",
          "It translates SQL queries to BSON format"
        ],
        answerIndex: 1
      },
      {
        question: "How does Mongoose middleware (hooks) like pre('save') work in MongoDB?",
        options: [
          "It executes code on the database server directly",
          "It runs validation logic inside the application layer before saving document updates to MongoDB",
          "It forces synchronous processing on the database driver",
          "It compresses the data before sending it"
        ],
        answerIndex: 1
      }
    ],
    MASTER: [
      {
        question: "How do Sharding and Replication differ in a MongoDB production environment?",
        options: [
          "Sharding copies data for high availability; Replication splits data across nodes for horizontal scaling",
          "Sharding distributes data across shards for horizontal write scaling; Replication copies data across nodes for high availability and read redundancy",
          "Sharding requires SQL drivers; Replication is NoSQL only",
          "They are synonymous terms for the exact same backup database architecture"
        ],
        answerIndex: 1
      },
      {
        question: "What is the significance of the wiredTiger storage engine cache, and how does it handle transaction concurrency?",
        options: [
          "It locks the entire database collection during any write transaction",
          "It uses document-level concurrency control and optimistic lock protocols to maximize transaction throughput",
          "It stores all write logs in separate microservices",
          "It operates purely in-memory and disables storage persistence"
        ],
        answerIndex: 1
      },
      {
        question: "What is a covered query in MongoDB, and why is it extremely fast?",
        options: [
          "A query that is executed through an encrypted SSL connection",
          "A query where all requested fields match the index keys, allowing MongoDB to return results from index data without reading actual documents",
          "A query that is stored in the local Redis server cache",
          "A query that uses only comparison operators ($gt, $lt)"
        ],
        answerIndex: 1
      }
    ]
  },
  'git': {
    BASIC: [
      {
        question: "What is Git?",
        options: [
          "A code hosting platform owned by GitHub",
          "A distributed version control system to track file changes in codebases",
          "A text editor for writing programming code",
          "A command-line script execution tool"
        ],
        answerIndex: 1
      },
      {
        question: "Which command initializes a new Git repository in a local directory?",
        options: [
          "git start",
          "git create",
          "git init",
          "git commit"
        ],
        answerIndex: 2
      },
      {
        question: "What is the staging area in Git?",
        options: [
          "A temporary branch used to deploy code to staging servers",
          "A sandbox where code is automatically run to check for compilation errors",
          "A preparation zone where files are added (staged) before being committed",
          "A backup folder containing deleted files"
        ],
        answerIndex: 2
      }
    ],
    INTERMEDIATE: [
      {
        question: "What is the difference between git merge and git rebase?",
        options: [
          "merge rewrites commit history; rebase preserves commit history",
          "merge combines changes by creating a new merge commit; rebase applies local commits sequentially on top of the target branch, keeping history linear",
          "merge is local-only; rebase is remote-only",
          "There is no difference; they are exact command synonyms"
        ],
        answerIndex: 1
      },
      {
        question: "How does git stash help during feature development workflows?",
        options: [
          "It uploads uncommitted changes to a secure remote server",
          "It temporarily saves modified files in a local stack, reverting your working directory to clean HEAD state",
          "It deletes all git branch histories",
          "It merges local conflicts automatically using AI"
        ],
        answerIndex: 1
      },
      {
        question: "What is the role of HEAD in Git?",
        options: [
          "It represents the main branch of the repository",
          "A pointer indicating the currently checked out commit/branch in your working directory",
          "The top directory containing the project code files",
          "A config script that sets up environment variables"
        ],
        answerIndex: 1
      }
    ],
    MASTER: [
      {
        question: "What happens under the hood when you run git cherry-pick <commit-hash>?",
        options: [
          "Git deletes all commits on the branch up to that commit",
          "Git extracts the diff introduced by the specified commit and applies it as a new commit on your current branch",
          "Git merges the entire branch history containing that commit",
          "Git resets the head pointer and deletes working changes"
        ],
        answerIndex: 1
      },
      {
        question: "How does the Git Object Model store and represent repository files, directories, and commits?",
        options: [
          "It uses a relational SQLite database inside the .git directory",
          "It uses cryptographically hashed blobs (file contents), trees (directory structures), and commits (pointers to tree hashes and metadata)",
          "It stores all revisions in a single compressed XML file",
          "It relies on absolute file paths and operating system logs"
        ],
        answerIndex: 1
      },
      {
        question: "What is the purpose of git reflog, and when is it critical to use?",
        options: [
          "It publishes repository changes to an external wiki page",
          "It logs every update made to refs (branches, HEAD), enabling the recovery of lost commits or reset branches that are not visible in git log",
          "It formats code files based on lint standards",
          "It measures the network bandwidth used during pushes"
        ],
        answerIndex: 1
      }
    ]
  }
};

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const shuffleQuiz = (questions) => {
  if (!questions || !Array.isArray(questions)) return [];

  // Shuffle the question order
  const shuffledQuestions = shuffleArray(questions);

  // Shuffle the options of each question and update answerIndex
  return shuffledQuestions.map((q) => {
    const correctOption = q.options[q.answerIndex];
    const shuffledOptions = shuffleArray(q.options);
    const newAnswerIndex = shuffledOptions.indexOf(correctOption);

    return {
      question: q.question,
      options: shuffledOptions,
      answerIndex: newAnswerIndex
    };
  });
};

const getRealisticQuiz = (skillName, tier) => {
  const normalizedSkill = skillName.toLowerCase().trim();
  const skillQuizzes = REALISTIC_QUIZZES[normalizedSkill];
  
  let pool = [];
  if (skillQuizzes && skillQuizzes[tier]) {
    pool = skillQuizzes[tier];
  } else {
    // If not found in our realistic pool, return generic mock questions
    pool = [
      {
        question: `What is a primary concept or foundational feature of ${skillName} at the ${tier} level?`,
        options: [
          `Option A: Core feature and basic usage of ${skillName}`,
          `Option B: Secondary syntax details`,
          `Option C: Advanced configuration framework`,
          `Option D: Legacy deprecated behaviors`
        ],
        answerIndex: 0
      },
      {
        question: `Which of the following describes a typical troubleshooting scenario for ${skillName} (${tier})?`,
        options: [
          `Incorrect scoping parameters`,
          `Standard default setup (Recommended)`,
          `Third-party extensions override`,
          `Operating system memory leaks`
        ],
        answerIndex: 1
      },
      {
        question: `What is the recommended best practice for optimizing performance in ${skillName} during ${tier} tasks?`,
        options: [
          `Compile all modules synchronously`,
          `Avoid unnecessary recalculations and caches`,
          `Use modular imports and profile bottlenecks`,
          `Disable security scanning controls`
        ],
        answerIndex: 2
      }
    ];
  }

  // Shuffle the pool and take up to 3 questions
  const shuffledPool = shuffleArray(pool);
  const selectedQuestions = shuffledPool.slice(0, 3);

  // Return fully randomized questions and options
  return shuffleQuiz(selectedQuestions);
};

module.exports = {
  getRealisticQuiz,
  shuffleQuiz,
  REALISTIC_QUIZZES
};
