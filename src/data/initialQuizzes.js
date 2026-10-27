export const initialQuizzes = [
  {
    id: "frontend-quiz-1",
    lessonId: "frontend-lesson-1",

    title: "Frontend Fundamentals",

    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",

        question:
          "Which technology defines the structure of a webpage?",

        options: [
          "HTML",
          "CSS",
          "JavaScript",
          "SQL",
        ],

        correctAnswer: 0,

        explanation:
          "HTML defines the structure and meaning of webpage content.",
      },

      {
        id: "q2",

        question:
          "Which technology primarily controls webpage appearance?",

        options: [
          "HTML",
          "CSS",
          "SQL",
          "Git",
        ],

        correctAnswer: 1,

        explanation:
          "CSS controls visual presentation, including colors, spacing, and layout.",
      },

      {
        id: "q3",

        question:
          "Which technology can respond to a button click?",

        options: [
          "Only HTML",
          "Only CSS",
          "JavaScript",
          "A database alone",
        ],

        correctAnswer: 2,

        explanation:
          "JavaScript can respond to user interactions and update a webpage.",
      },

      {
        id: "q4",

        question:
          "What does a frontend developer primarily build?",

        options: [
          "Only database tables",
          "The user-facing part of an application",
          "Only computer hardware",
          "Only network cables",
        ],

        correctAnswer: 1,

        explanation:
          "Frontend developers build the interface users see and interact with.",
      },

      {
        id: "q5",

        question:
          "Which HTML element creates a paragraph?",

        options: [
          "<heading>",
          "<paragraph>",
          "<p>",
          "<text>",
        ],

        correctAnswer: 2,

        explanation:
          "The p element represents a paragraph in HTML.",
      },
    ],
  },
];