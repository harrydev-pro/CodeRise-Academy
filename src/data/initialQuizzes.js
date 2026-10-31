export const initialQuizzes = [
  // frontend-quiz-1
  // introduction to frontend development
  {
    id: "frontend-quiz-1",
    lessonId: "frontend-lesson-1",

    title: "introduction to frontend development",

    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",
        question: "What is frontend development?",
        options: [
          "Creating the physical parts of a computer",
          "Building the part of a website that users see and interact with",
          "Managing a computer’s operating system",
          "Repairing damaged computer hardware",
        ],
        correctAnswer: 1,
        explanation:
          "Frontend development focuses on creating the visible and interactive parts of websites, such as navigation bars, buttons, images, forms, and page layouts.",
      },
      {
        id: "q2",
        question:
          "Which three technologies form the foundation of frontend development?",
        options: [
          "Python, Java, and C++",
          "HTML, CSS, and JavaScript",
          "Microsoft Word, Excel, and PowerPoint",
          "PHP, SQL, and Python",
        ],
        correctAnswer: 1,
        explanation:
          "HTML provides webpage structure, CSS controls its appearance, and JavaScript adds interactive behaviour.",
      },
      {
        id: "q3",
        question: "What is the primary purpose of HTML?",
        options: [
          "To create the structure and content of a webpage",
          "To protect a computer from viruses",
          "To change the computer’s operating system",
          "To connect a computer to the internet",
        ],
        correctAnswer: 0,
        explanation:
          "HTML defines webpage elements such as headings, paragraphs, images, links, and forms.",
      },
      {
        id: "q4",
        question: "What is the primary purpose of CSS?",
        options: [
          "To store information in a database",
          "To create computer programs that control hardware",
          "To style and arrange webpage elements",
          "To send emails automatically",
        ],
        correctAnswer: 2,
        explanation:
          "CSS controls the appearance of webpages, including colours, fonts, spacing, borders, and layouts.",
      },
      {
        id: "q5",
        question: "What is JavaScript mainly used for in frontend development?",
        options: [
          "Creating interactive behaviour on webpages",
          "Replacing the computer’s operating system",
          "Designing computer processors",
          "Printing documents",
        ],
        correctAnswer: 0,
        explanation:
          "JavaScript can respond to button clicks, validate forms, update page content, and create interactive features.",
      },
      {
        id: "q6",
        question: "Which of the following is an example of a frontend feature?",
        options: [
          "A website’s visible navigation menu",
          "A computer’s internal power supply",
          "A network router’s physical casing",
          "A computer’s motherboard",
        ],
        correctAnswer: 0,
        explanation:
          "A navigation menu is displayed on a webpage and allows users to move between different pages or sections.",
      },
      {
        id: "q7",
        question:
          "Which software is commonly used to write HTML, CSS, and JavaScript code?",
        options: [
          "Calculator",
          "Visual Studio Code",
          "Windows Media Player",
          "Microsoft Paint",
        ],
        correctAnswer: 1,
        explanation:
          "Visual Studio Code is a code editor that supports HTML, CSS, JavaScript, and many other programming languages.",
      },
      {
        id: "q8",
        question:
          "Which application is commonly used to view and test a webpage?",
        options: [
          "A web browser",
          "A spreadsheet application",
          "A music player",
          "A file compression application",
        ],
        correctAnswer: 0,
        explanation:
          "Browsers such as Chrome, Firefox, Safari, and Edge interpret webpage code and display the resulting pages.",
      },
      {
        id: "q9",
        question: "Which of the following is a web browser?",
        options: [
          "Visual Studio Code",
          "GitHub Desktop",
          "Google Chrome",
          "Microsoft Excel",
        ],
        correctAnswer: 2,
        explanation:
          "Google Chrome is a web browser used to visit websites and test locally developed webpages.",
      },
      {
        id: "q10",
        question: "What does a website’s user interface refer to?",
        options: [
          "The visible elements users interact with",
          "The computer’s electrical wiring",
          "The website’s internet connection speed only",
          "The physical keyboard used by the developer",
        ],
        correctAnswer: 0,
        explanation:
          "A user interface includes elements such as buttons, menus, forms, links, and other visible controls.",
      },
      {
        id: "q11",
        question:
          "Which HTML element is commonly used for the main heading of a webpage?",
        options: ["<p>", "<h1>", "<img>", "<a>"],
        correctAnswer: 1,
        explanation:
          "The <h1> element represents a top-level heading. It is commonly used for the main heading of a webpage.",
      },
      {
        id: "q12",
        question:
          "Which technology would you use to change a webpage’s background colour?",
        options: [
          "HTML alone",
          "CSS",
          "A web browser’s address bar",
          "A file manager",
        ],
        correctAnswer: 1,
        explanation:
          "CSS uses the background-color property to change the background colour of an element.",
      },
      {
        id: "q13",
        question:
          "Which technology would you use to make a button display a message when clicked?",
        options: [
          "JavaScript",
          "HTML comments",
          "CSS alone",
          "A file extension",
        ],
        correctAnswer: 0,
        explanation:
          "JavaScript can respond to a click event and display a message. HTML creates the button, while CSS can style it.",
      },
      {
        id: "q14",
        question: "What is a webpage?",
        options: [
          "A single document displayed in a web browser",
          "A computer’s physical screen",
          "A type of computer keyboard",
          "A device used to connect to Wi-Fi",
        ],
        correctAnswer: 0,
        explanation:
          "A webpage is a document that a browser can display. It may contain text, images, links, forms, and interactive elements.",
      },
      {
        id: "q15",
        question: "What is a website?",
        options: [
          "A collection of related webpages and resources",
          "A single computer component",
          "A type of programming keyboard",
          "A software error",
        ],
        correctAnswer: 0,
        explanation:
          "A website commonly contains several connected pages, such as Home, About, Courses, and Contact.",
      },
      {
        id: "q16",
        question: "What is the purpose of a navigation bar?",
        options: [
          "To make a computer run faster",
          "To help users move around a website",
          "To change the browser’s language automatically",
          "To create images without code",
        ],
        correctAnswer: 1,
        explanation:
          "Navigation bars contain links that help visitors access different pages or sections of a website.",
      },
      {
        id: "q17",
        question: "Which of the following is a frontend development project?",
        options: [
          "Creating a personal portfolio webpage",
          "Replacing a computer’s processor",
          "Repairing a broken television screen",
          "Installing a physical network cable",
        ],
        correctAnswer: 0,
        explanation:
          "A personal portfolio webpage displays information about a person, their skills, and their projects.",
      },
      {
        id: "q18",
        question: "What does responsive web design mean?",
        options: [
          "Designing webpages that adapt to different screen sizes",
          "Making every webpage use the same background colour",
          "Creating websites that work only on desktop computers",
          "Making a webpage contain no images",
        ],
        correctAnswer: 0,
        explanation:
          "Responsive design helps a webpage display appropriately on mobile phones, tablets, laptops, and desktop computers.",
      },
      {
        id: "q19",
        question:
          "Which device is important for testing whether a website works on mobile screens?",
        options: [
          "A mobile phone",
          "A printer only",
          "A television remote",
          "A computer speaker",
        ],
        correctAnswer: 0,
        explanation:
          "Testing on a mobile phone helps developers identify layout problems and usability issues on smaller screens.",
      },
      {
        id: "q20",
        question: "What is the purpose of a link on a webpage?",
        options: [
          "To connect users to another page, resource, or location",
          "To change the computer’s physical size",
          "To increase the monitor’s brightness",
          "To remove the internet connection",
        ],
        correctAnswer: 0,
        explanation:
          "Links allow users to navigate between webpages, open resources, or move to a section of a page.",
      },
      {
        id: "q",
        question: "What is a frontend developer primarily responsible for?",
        options: [
          "Building and maintaining the user-facing parts of websites or applications",
          "Manufacturing computer screens",
          "Repairing electrical wiring in buildings",
          "Producing computer keyboards",
        ],
        correctAnswer: 0,
        explanation:
          "Frontend developers implement webpage layouts, interfaces, interactions, and responsive behaviour.",
      },
      {
        id: "",
        question: "Which of these is an example of website content?",
        options: [
          "A paragraph describing a course",
          "A computer’s power cable",
          "A desk used by a developer",
          "A physical computer mouse",
        ],
        correctAnswer: 0,
        explanation:
          "Website content includes text, images, videos, links, and other information presented to users.",
      },
      {
        id: "q23",
        question: "What does HTML stand for?",
        options: [
          "HyperText Markup Language",
          "High Technology Machine Language",
          "Hyper Transfer Management Link",
          "Home Tool Markup Level",
        ],
        correctAnswer: 0,
        explanation:
          "HTML stands for HyperText Markup Language. It is the standard markup language used to structure webpages.",
      },
      {
        id: "q24",
        question: "What does CSS stand for?",
        options: [
          "Computer Styling System",
          "Cascading Style Sheets",
          "Creative Software Structure",
          "Coded Screen Settings",
        ],
        correctAnswer: 1,
        explanation:
          "CSS stands for Cascading Style Sheets. It is used to control the visual presentation of HTML documents.",
      },
      {
        id: "q25",
        question: "What does JavaScript allow a webpage to do?",
        options: [
          "Respond to user actions and update content dynamically",
          "Replace the physical screen",
          "Manufacture computer parts",
          "Increase the size of a keyboard",
        ],
        correctAnswer: 0,
        explanation:
          "JavaScript can respond to events and change webpage content without requiring the entire page to reload.",
      },
      {
        id: "q26",
        question: "Which of the following is an example of a website form?",
        options: [
          "A registration form asking for a user’s name and email",
          "A computer monitor stand",
          "A desktop wallpaper",
          "A physical notebook",
        ],
        correctAnswer: 0,
        explanation:
          "Forms collect information from users through fields such as text inputs, email inputs, and buttons.",
      },
      {
        id: "q27",
        question:
          "Why should a developer organise their code into suitable files?",
        options: [
          "To make the project easier to understand and maintain",
          "To prevent the browser from opening",
          "To remove all webpage content",
          "To stop users from accessing websites",
        ],
        correctAnswer: 0,
        explanation:
          "Organising HTML, CSS, and JavaScript into appropriate files makes projects easier to manage, debug, and update.",
      },
      {
        id: "q28",
        question: "Which file extension is commonly used for an HTML document?",
        options: [".jpg", ".mp3", ".html", ".pdf"],
        correctAnswer: 2,
        explanation:
          "HTML documents commonly use the .html extension, such as index.html.",
      },
      {
        id: "q29",
        question: "What is debugging?",
        options: [
          "Finding and fixing problems in code",
          "Designing a computer’s outer case",
          "Changing the physical shape of a monitor",
          "Printing a webpage on paper",
        ],
        correctAnswer: 0,
        explanation:
          "Debugging involves identifying errors, understanding their causes, and correcting them so the program works as expected.",
      },
      {
        id: "q30",
        question:
          "Which is a sensible order for learning the core frontend technologies?",
        options: [
          "JavaScript, HTML, then CSS, without learning their foundations",
          "HTML, CSS, then JavaScript",
          "CSS only, without learning HTML",
          "JavaScript only, without learning HTML or CSS",
        ],
        correctAnswer: 1,
        explanation:
          "Beginners can first learn HTML to structure webpages, CSS to style them, and JavaScript to introduce interaction. Students can later practise all three together.",
      },
    ],
  },

  {
    id: "frontend-quiz-2",
    lessonId: "frontend-lesson-2",
    title: "HTML Fundamentals",
    passMark: 60,
    published: true,
    questions: [
      {
        id: "q1",
        question: "What does HTML stand for?",
        options: [
          "HyperText Markup Language",
          "HighText Machine Language",
          "Hyper Transfer Main Link",
          "Home Tool Management Language",
        ],
        correctAnswer: 0,
        explanation:
          "HTML is the standard markup language used to structure content on webpages.",
      },
      {
        id: "q2",
        question: "Which declaration identifies an HTML5 document?",
        options: ["<html5>", "<doctype>", "<!DOCTYPE html>", "<document html>"],
        correctAnswer: 2,
        explanation:
          "The doctype declaration tells the browser to interpret the document using modern HTML standards.",
      },
      {
        id: "q3",
        question:
          "Which element contains the main content of an HTML document?",
        options: ["<body>", "<title>", "<head>", "<meta>"],
        correctAnswer: 0,
        explanation:
          "The <body> element contains the content displayed in the webpage, such as headings, paragraphs, images, and links.",
      },
      {
        id: "q4",
        question:
          "Which element contains metadata and links to resources such as stylesheets?",
        options: ["<footer>", "<head>", "<main>", "<section>"],
        correctAnswer: 1,
        explanation:
          "The <head> element contains document information, metadata, the title, and references to resources such as CSS files.",
      },
      {
        id: "q5",
        question: "Which element defines the title shown in a browser tab?",
        options: ["<heading>", "<h1>", "<title>", "<caption>"],
        correctAnswer: 2,
        explanation:
          "The <title> element specifies the document title displayed in the browser tab and used in other contexts such as search results.",
      },
      {
        id: "q6",
        question:
          "Which element creates the largest standard HTML heading level?",
        options: ["<h6>", "<head>", "<h1>", "<heading>"],
        correctAnswer: 2,
        explanation:
          "HTML provides six heading levels, from <h1> to <h6>. The <h1> element represents the highest-level heading.",
      },
      {
        id: "q7",
        question: "Which element is used to create a paragraph?",
        options: ["<para>", "<p>", "<text>", "<paragraph>"],
        correctAnswer: 1,
        explanation: "The <p> element represents a paragraph of text.",
      },
      {
        id: "q8",
        question: "Which element creates a hyperlink?",
        options: ["<linkto>", "<href>", "<a>", "<url>"],
        correctAnswer: 2,
        explanation:
          "The <a> element creates a hyperlink. Its href attribute specifies the destination.",
      },
      {
        id: "q9",
        question: "Which attribute specifies the destination of a hyperlink?",
        options: ["src", "href", "alt", "class"],
        correctAnswer: 1,
        explanation:
          "The href attribute specifies the URL or page location that a link opens.",
      },
      {
        id: "q10",
        question: "Which element displays an image in HTML?",
        options: ["<picturefile>", "<image>", "<img>", "<photo>"],
        correctAnswer: 2,
        explanation: "The <img> element embeds an image in a webpage.",
      },
      {
        id: "q11",
        question: "Which attribute specifies an image’s file location?",
        options: ["href", "src", "alt", "title"],
        correctAnswer: 1,
        explanation:
          "The src attribute tells the browser where to find the image file.",
      },
      {
        id: "q12",
        question: "What is the purpose of the alt attribute on an image?",
        options: [
          "To add alternative text describing the image",
          "To change the image’s background colour",
          "To create a hyperlink automatically",
          "To increase the image’s file size",
        ],
        correctAnswer: 0,
        explanation:
          "Alternative text helps people using screen readers understand an image and can be displayed when an image cannot be loaded. Decorative images can use an empty alt value.",
      },
      {
        id: "q13",
        question: "Which element creates an unordered list?",
        options: ["<ol>", "<ul>", "<li>", "<list>"],
        correctAnswer: 1,
        explanation:
          "The <ul> element creates an unordered list, which browsers commonly display with bullet points.",
      },
      {
        id: "q14",
        question: "Which element creates an ordered list?",
        options: ["<ol>", "<ul>", "<order>", "<li>"],
        correctAnswer: 0,
        explanation:
          "The <ol> element creates an ordered list, usually displayed with numbers or another ordered marker.",
      },
      {
        id: "q15",
        question: "Which element represents an individual list item?",
        options: ["<item>", "<list>", "<li>", "<ul>"],
        correctAnswer: 2,
        explanation:
          "The <li> element represents a list item inside an ordered or unordered list.",
      },
      {
        id: "q16",
        question: "Which element creates a table row?",
        options: ["<td>", "<tr>", "<th>", "<table-row>"],
        correctAnswer: 1,
        explanation: "The <tr> element defines a row in an HTML table.",
      },
      {
        id: "q17",
        question: "Which element represents a standard table data cell?",
        options: ["<td>", "<tr>", "<th>", "<data-row>"],
        correctAnswer: 0,
        explanation:
          "The <td> element represents a regular data cell in a table.",
      },
      {
        id: "q18",
        question: "Which element is commonly used for a table header cell?",
        options: ["<theadcell>", "<td>", "<th>", "<header>"],
        correctAnswer: 2,
        explanation:
          "The <th> element identifies a header cell in a table, such as a column heading.",
      },
      {
        id: "q19",
        question: "Which HTML element creates a form?",
        options: ["<input>", "<form>", "<fieldset>", "<label>"],
        correctAnswer: 1,
        explanation:
          "The <form> element groups controls used to collect and submit information from users.",
      },
      {
        id: "q20",
        question: "Which input type is designed for email addresses?",
        options: [
          'type="mailbox"',
          'type="textmail"',
          'type="email"',
          'type="address"',
        ],
        correctAnswer: 2,
        explanation:
          "The email input type provides a field intended for email addresses and enables basic browser validation of the input format.",
      },
      {
        id: "q21",
        question:
          "Which input type hides the characters a user enters by default?",
        options: [
          'type="text"',
          'type="password"',
          'type="visible"',
          'type="hidden-text"',
        ],
        correctAnswer: 1,
        explanation:
          "Password inputs mask the characters as they are entered. This does not, by itself, securely store or transmit a password.",
      },
      {
        id: "q22",
        question: "Which element creates a button?",
        options: ["<click>", "<button>", "<press>", "<inputbutton>"],
        correctAnswer: 1,
        explanation:
          "The <button> element creates a button that can be used for actions such as submitting a form or triggering JavaScript.",
      },
      {
        id: "q23",
        question: "Which element is used to label a form field?",
        options: ["<label>", "<caption>", "<title>", "<name>"],
        correctAnswer: 0,
        explanation:
          "The <label> element provides a text label for a form control. Connecting it to the control improves usability and accessibility.",
      },
      {
        id: "q24",
        question:
          "Which attribute gives an HTML element a unique identifier within a page?",
        options: ["class", "style", "id", "nameclass"],
        correctAnswer: 2,
        explanation:
          "The id attribute identifies an element. IDs should be unique within an HTML document.",
      },
      {
        id: "q25",
        question:
          "Which attribute can be shared by multiple HTML elements for styling?",
        options: ["class", "unique", "only", "single"],
        correctAnswer: 0,
        explanation:
          "A class allows developers to group elements and apply the same CSS rules to them.",
      },
      {
        id: "q26",
        question:
          "Which HTML element represents the main content of a webpage?",
        options: ["<main>", "<title>", "<head>", "<meta>"],
        correctAnswer: 0,
        explanation:
          "The <main> element represents the dominant content of the document. It helps organise the page semantically.",
      },
      {
        id: "q27",
        question:
          "Which element is used to group introductory or navigational content for a page or section?",
        options: ["<header>", "<footer>", "<br>", "<img>"],
        correctAnswer: 0,
        explanation:
          "A <header> commonly contains introductory content, headings, logos, or navigation-related elements.",
      },
      {
        id: "q28",
        question: "Which element represents navigation links?",
        options: ["<navigate>", "<nav>", "<links>", "<menu-link>"],
        correctAnswer: 1,
        explanation:
          "The <nav> element identifies a section containing important navigation links.",
      },
      {
        id: "q29",
        question: "Which element creates a line break within text?",
        options: ["<break>", "<lb>", "<br>", "<line>"],
        correctAnswer: 2,
        explanation:
          "The <br> element inserts a line break. It should not be used simply to create large amounts of spacing between sections.",
      },
      {
        id: "q30",
        question:
          "Which of the following is a correctly structured basic HTML document?",
        options: [
          "<html><body><h1>Welcome</h1></body></html>",
          '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>My Page</title></head><body><h1>Welcome</h1></body></html>',
          "<head><h1>Welcome</h1></head>",
          "<body><head><title>My Page</title></body>",
        ],
        correctAnswer: 1,
        explanation:
          "Option B includes the doctype, the root <html> element, a <head> section containing metadata and the title, and a <body> section containing the visible content.",
      },
    ],
  },

  // frontend-quiz-3
  // CSS Fundamentals
  {
    id: "frontend-quiz-3",
    lessonId: "frontend-lesson-3",
    title: "CSS Fundamentals",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",
        question: "What does CSS stand for?",
        options: [
          "Creative Style System",
          "Cascading Style Sheets",
          "Computer Styling Software",
          "Cascading Structure System",
        ],
        correctAnswer: 1,
        explanation:
          "CSS is used to control the visual appearance and layout of HTML documents.",
      },
      {
        id: "q2",
        question: "What is the main purpose of CSS?",
        options: [
          "To style HTML elements",
          "To create database tables",
          "To repair computer hardware",
          "To replace a web browser",
        ],
        correctAnswer: 0,
        explanation:
          "CSS controls features such as colours, fonts, spacing, borders, and element positioning.",
      },
      {
        id: "q3",
        question: "Which of the following is an example of inline CSS?",
        options: [
          "<h1>Welcome</h1>",
          '<h1 style="color: purple;">Welcome</h1>',
          "h1 { color: purple; }",
          '<link rel="stylesheet" href="style.css">',
        ],
        correctAnswer: 1,
        explanation:
          "Inline CSS is written inside an HTML element using the style attribute.",
      },
      {
        id: "q4",
        question: "Where is internal CSS usually written?",
        options: [
          "Inside a <style> element",
          "Inside an image file",
          "Inside a browser’s address bar",
          "Inside the <img> element",
        ],
        correctAnswer: 0,
        explanation:
          "Internal CSS is placed inside a <style> element, usually within the HTML document’s <head> section.",
      },
      {
        id: "q5",
        question: "Which HTML element connects an external CSS stylesheet?",
        options: ["<css>", "<stylelink>", "<link>", "<stylesheet>"],
        correctAnswer: 2,
        explanation:
          'A <link> element with rel="stylesheet" and an appropriate href connects an external CSS file.',
      },
      {
        id: "q6",
        question:
          "Which is the correct way to connect style.css to an HTML document?",
        options: [
          '<link rel="stylesheet" href="style.css">',
          '<style href="style.css">',
          '<css src="style.css">',
          '<link src="style.css">',
        ],
        correctAnswer: 0,
        explanation:
          'The rel="stylesheet" attribute identifies the linked resource as a stylesheet, and href specifies the file location.',
      },
      {
        id: "q7",
        question: "What is a CSS selector?",
        options: [
          "A tool for selecting computer hardware",
          "A pattern used to identify which HTML elements to style",
          "A type of image file",
          "A browser setting",
        ],
        correctAnswer: 1,
        explanation:
          "CSS selectors identify the elements that should receive particular styling rules.",
      },
      {
        id: "q8",
        question: "Which selector targets all paragraph elements?",
        options: [".p", "#p", "p", "paragraph()"],
        correctAnswer: 2,
        explanation:
          "The element selector p targets all <p> elements in the document.",
      },
      {
        id: "q9",
        question: "Which symbol begins a CSS class selector?",
        options: ["#", ".", "@", "&"],
        correctAnswer: 1,
        explanation:
          "A dot is used to select HTML elements by class name, such as .highlight.",
      },
      {
        id: "q10",
        question: "Which symbol begins a CSS ID selector?",
        options: [".", "*", "#", "%"],
        correctAnswer: 2,
        explanation:
          "A hash symbol selects an element by its ID, such as #main-heading.",
      },
      {
        id: "q11",
        question: "Which CSS property changes the text colour?",
        options: ["background", "font-style", "color", "text-size"],
        correctAnswer: 2,
        explanation: "The color property sets the foreground colour of text.",
      },
      {
        id: "q12",
        question: "Which property changes an element’s background colour?",
        options: [
          "background-color",
          "text-color",
          "font-color",
          "element-colour",
        ],
        correctAnswer: 0,
        explanation:
          "The background-color property sets the background colour of an element.",
      },
      {
        id: "q13",
        question: "Which property controls the size of text?",
        options: ["text-weight", "font-size", "font-colour", "text-height"],
        correctAnswer: 1,
        explanation:
          "The font-size property controls how large or small text appears.",
      },
      {
        id: "q14",
        question: "Which property controls the typeface used for text?",
        options: [
          "font-family",
          "font-shape",
          "text-family",
          "font-style-name",
        ],
        correctAnswer: 0,
        explanation:
          "The font-family property specifies the typeface, such as Arial or another available font.",
      },
      {
        id: "q15",
        question: "Which CSS declaration makes text bold?",
        options: [
          "font-weight: bold;",
          "text-style: bold;",
          "font-size: bold;",
          "text-weight: strong;",
        ],
        correctAnswer: 0,
        explanation:
          "The font-weight property controls the thickness of text. The value bold makes it bold.",
      },
      {
        id: "q16",
        question:
          "Which property centres text horizontally within its containing block?",
        options: ["font-align", "text-align", "align-font", "text-position"],
        correctAnswer: 1,
        explanation:
          "The declaration text-align: center; centres inline content such as text within its containing block.",
      },
      {
        id: "q17",
        question: "Which CSS rule makes all paragraph text green?",
        options: [
          "p { color: green; }",
          "p { background: green; }",
          "green { text: p; }",
          "p { font-size: green; }",
        ],
        correctAnswer: 0,
        explanation:
          "The selector p targets paragraph elements, while color: green changes their text colour.",
      },
      {
        id: "q18",
        question: "What are curly braces used for in CSS?",
        options: [
          "To contain the declarations in a CSS rule",
          "To create an image",
          "To open a new browser tab",
          "To define an HTML hyperlink",
        ],
        correctAnswer: 0,
        explanation:
          "CSS declarations are written between { and } after the selector.",
      },
      {
        id: "q19",
        question:
          "Which character normally separates a CSS property from its value?",
        options: ["Comma", "Colon", "Question mark", "Forward slash"],
        correctAnswer: 1,
        explanation:
          "A colon separates the property name from its value, as in color: purple;.",
      },
      {
        id: "q20",
        question: "Which character normally ends a CSS declaration?",
        options: ["Period", "Colon", "Semicolon", "Exclamation mark"],
        correctAnswer: 2,
        explanation:
          "A semicolon separates CSS declarations and is conventionally placed at the end of each declaration.",
      },
      {
        id: "q21",
        question:
          "What does the following CSS do? h1 { color: purple; font-size: 32px; }",
        options: [
          "It changes every image to purple",
          "It makes headings purple and sets their font size to 32 pixels",
          "It creates a new HTML heading",
          "It changes the webpage’s title in the browser tab",
        ],
        correctAnswer: 1,
        explanation:
          "The rule targets <h1> elements, setting their text colour to purple and their font size to 32 pixels.",
      },
      {
        id: "q22",
        question: "What is the purpose of the margin property?",
        options: [
          "To create space outside an element’s border",
          "To change text colour",
          "To create a hyperlink",
          "To change an image’s file type",
        ],
        correctAnswer: 0,
        explanation:
          "Margin controls the space outside an element’s border, helping separate it from neighbouring elements.",
      },
      {
        id: "q23",
        question: "What is the purpose of the padding property?",
        options: [
          "To create space inside an element, between its content and border",
          "To change the text’s language",
          "To add a hyperlink",
          "To create a JavaScript function",
        ],
        correctAnswer: 0,
        explanation: "Padding adds internal space around an element’s content.",
      },
      {
        id: "q24",
        question: "Which CSS property adds a border to an element?",
        options: ["outline-text", "border", "line-style", "edge"],
        correctAnswer: 1,
        explanation:
          "The border property controls the border’s width, style, and colour.",
      },
      {
        id: "q25",
        question: "Which property rounds the corners of an element?",
        options: [
          "corner-style",
          "border-radius",
          "round-border-text",
          "curve",
        ],
        correctAnswer: 1,
        explanation: "The border-radius property rounds an element’s corners.",
      },
      {
        id: "q26",
        question: "What is the purpose of background-image?",
        options: [
          "To set an image as an element’s background",
          "To change an image into text",
          "To add an image to a database",
          "To create an HTML heading",
        ],
        correctAnswer: 0,
        explanation:
          "The background-image property lets you display an image behind an element’s content.",
      },
      {
        id: "q27",
        question: "Which declaration removes the underline from links?",
        options: [
          "text-decoration: none;",
          "font-weight: none;",
          "link-style: off;",
          "underline: false;",
        ],
        correctAnswer: 0,
        explanation:
          "The text-decoration property controls decorative lines on text. Setting it to none removes the default underline from links.",
      },
      {
        id: "q28",
        question: "Why is external CSS useful?",
        options: [
          "It allows styles to be stored separately from HTML",
          "It prevents websites from using images",
          "It removes the need for HTML",
          "It automatically creates databases",
        ],
        correctAnswer: 0,
        explanation:
          "External CSS separates presentation from document structure, making styles easier to maintain and reuse across multiple pages.",
      },
      {
        id: "q29",
        question:
          "Which CSS declaration changes the mouse pointer to a pointer when hovering over a button?",
        options: [
          "mouse: hand;",
          "cursor: pointer;",
          "pointer: cursor;",
          "hover: mouse;",
        ],
        correctAnswer: 1,
        explanation:
          "The cursor property controls the appearance of the pointer. The pointer value commonly indicates that an element is clickable.",
      },
      {
        id: "q30",
        question:
          "What happens when you write this CSS? p { font-size: 18px; }",
        options: [
          "Every paragraph targeted by the rule uses an 18-pixel font size",
          "Every paragraph becomes 18 pixels wide",
          "Every paragraph changes into a heading",
          "Every paragraph receives an 18-pixel border",
        ],
        correctAnswer: 0,
        explanation:
          "The font-size property controls text size, not the width or border of the paragraph element.",
      },
    ],
  },

  // frontend-quiz-4
  // CSS Styling and Layout Practice
  {
    id: "frontend-quiz-4",
    lessonId: "frontend-lesson-4",
    title: "CSS Styling and Layout Practice",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",
        question: "What is the purpose of CSS styling?",
        options: [
          "To improve the appearance and presentation of webpages",
          "To manufacture computer components",
          "To replace the internet",
          "To create physical documents only",
        ],
        correctAnswer: 0,
        explanation:
          "CSS styling controls how webpage elements look, including their colours, fonts, backgrounds, and spacing.",
      },
      {
        id: "q2",
        question: "Which CSS property changes the colour of text?",
        options: ["background-color", "color", "font-size", "border"],
        correctAnswer: 1,
        explanation:
          "The color property changes the foreground colour of text.",
      },
      {
        id: "q3",
        question: "Which hexadecimal colour represents pure white?",
        options: ["#000000", "#FF0000", "#FFFFFF", "#0000FF"],
        correctAnswer: 2,
        explanation:
          "In hexadecimal colour notation, #FFFFFF represents full red, green, and blue intensity, producing white.",
      },
      {
        id: "q4",
        question: "Which CSS property changes the thickness of text?",
        options: ["font-weight", "font-family", "text-align", "line-height"],
        correctAnswer: 0,
        explanation:
          "The font-weight property controls how thick or bold text appears.",
      },
      {
        id: "q5",
        question: "What does line-height control?",
        options: [
          "The horizontal width of a webpage",
          "The vertical spacing between lines of text",
          "The thickness of a border",
          "The background colour of a paragraph",
        ],
        correctAnswer: 1,
        explanation:
          "line-height controls the height of a line box, affecting the vertical spacing between lines of text.",
      },
      {
        id: "q6",
        question:
          "Which property is commonly used to remove the underline from a link?",
        options: [
          "font-weight: none;",
          "text-decoration: none;",
          "text-align: none;",
          "background: underline;",
        ],
        correctAnswer: 1,
        explanation:
          "The text-decoration property controls text decorations such as underlines.",
      },
      {
        id: "q7",
        question: "Which property adds space inside an element’s border?",
        options: ["margin", "padding", "outline", "position"],
        correctAnswer: 1,
        explanation:
          "Padding creates space between the element’s content and its border.",
      },
      {
        id: "q8",
        question: "Which property adds space outside an element’s border?",
        options: ["padding", "font-size", "margin", "background-color"],
        correctAnswer: 2,
        explanation: "Margin separates an element from neighbouring elements.",
      },
      {
        id: "q9",
        question: "What is a CSS card?",
        options: [
          "A container used to present related information in a structured block",
          "A physical payment card",
          "A type of HTML file extension",
          "A computer’s graphics card",
        ],
        correctAnswer: 0,
        explanation:
          "A card is a visual component commonly used to display information about courses, products, profiles, or services.",
      },
      {
        id: "q10",
        question: "Which property adds rounded corners to a card?",
        options: [
          "border-radius",
          "corner-colour",
          "border-space",
          "rounding-size",
        ],
        correctAnswer: 0,
        explanation:
          "The border-radius property rounds the corners of the card’s border box.",
      },
      {
        id: "q11",
        question: "Which CSS property can add a shadow around a card?",
        options: [
          "text-shadow",
          "box-shadow",
          "card-shadow",
          "background-shadow",
        ],
        correctAnswer: 1,
        explanation:
          "box-shadow creates a shadow around an element’s box, helping the card stand out visually.",
      },
      {
        id: "q12",
        question: "What does display: flex do?",
        options: [
          "Activates Flexbox layout for an element’s children",
          "Makes all text bold",
          "Adds a border to every image",
          "Changes the webpage’s title",
        ],
        correctAnswer: 0,
        explanation:
          "Flexbox is a layout system that helps arrange items in rows or columns and control their spacing and alignment.",
      },
      {
        id: "q13",
        question:
          "Which Flexbox property controls the distribution of items along the main axis?",
        options: [
          "font-weight",
          "justify-content",
          "background-color",
          "border-radius",
        ],
        correctAnswer: 1,
        explanation:
          "justify-content controls how flex items are distributed along the main axis, which is horizontal by default when flex-direction is row.",
      },
      {
        id: "q14",
        question:
          "What does align-items: center do in a default row-oriented Flexbox container?",
        options: [
          "Centres items along the cross axis, normally vertically",
          "Centres the webpage’s title in the browser tab",
          "Changes the text to uppercase",
          "Adds space outside each element",
        ],
        correctAnswer: 0,
        explanation:
          "In a row-oriented Flexbox container, the cross axis is vertical, so align-items: center centres items vertically within the container’s cross-axis space.",
      },
      {
        id: "q15",
        question:
          "Which CSS property creates space between Flexbox or Grid items?",
        options: ["gap", "space-text", "item-margin-only", "border-spacing"],
        correctAnswer: 0,
        explanation:
          "The gap property defines spacing between rows and columns of items in Flexbox and Grid layouts.",
      },
      {
        id: "q16",
        question: "What does flex-wrap: wrap allow?",
        options: [
          "Flex items to move onto additional lines when needed",
          "Text to change into an image",
          "A background to become transparent",
          "A webpage to open a new browser",
        ],
        correctAnswer: 0,
        explanation:
          "When there is insufficient space, flex-wrap: wrap allows flex items to continue on additional lines rather than forcing everything onto one line.",
      },
      {
        id: "q17",
        question: "What is CSS Grid mainly used for?",
        options: [
          "Arranging content in rows and columns",
          "Creating HTML comments",
          "Changing text into links",
          "Writing JavaScript functions",
        ],
        correctAnswer: 0,
        explanation:
          "CSS Grid is a layout system designed to organise content into two-dimensional row-and-column arrangements.",
      },
      {
        id: "q18",
        question:
          "What does the following declaration create? grid-template-columns: repeat(3, 1fr);",
        options: [
          "Three equal-width grid columns",
          "Three different background images",
          "Three paragraphs",
          "Three borders around each element",
        ],
        correctAnswer: 0,
        explanation:
          "repeat(3, 1fr) defines three grid columns, each receiving one equal fraction of the available grid space.",
      },
      {
        id: "q19",
        question: "What does :hover represent in CSS?",
        options: [
          "A state applied when an element is hovered over",
          "A command that deletes an element",
          "A method of creating an HTML table",
          "A way to store information",
        ],
        correctAnswer: 0,
        explanation:
          "The :hover pseudo-class applies styles when an element is hovered over, commonly using a mouse pointer.",
      },
      {
        id: "q20",
        question: "Which property can make a hover colour change smoother?",
        options: ["transition", "font-weight", "padding", "border-style"],
        correctAnswer: 0,
        explanation:
          "The transition property controls how property changes occur over time, allowing smoother visual effects.",
      },
      {
        id: "q21",
        question: "What does transform: translateY(-5px) do?",
        options: [
          "Moves the element upward by 5 pixels relative to its transformed position",
          "Changes the element’s text to five words",
          "Increases the element’s width by five pixels",
          "Moves the element downward by five pixels",
        ],
        correctAnswer: 0,
        explanation:
          "A negative value for translateY() moves an element upward. The element’s original layout space remains reserved.",
      },
      {
        id: "q22",
        question: "What is responsive design?",
        options: [
          "Designing layouts that adapt to different screen sizes",
          "Creating websites that only work on large screens",
          "Using one font size for every element",
          "Removing all images from a website",
        ],
        correctAnswer: 0,
        explanation:
          "Responsive design adapts a website’s layout and content presentation to different viewport sizes and devices.",
      },
      {
        id: "q23",
        question:
          "Which CSS feature allows styles to apply only when certain conditions, such as viewport width, are met?",
        options: [
          "A media query",
          "An HTML comment",
          "An image attribute",
          "A browser bookmark",
        ],
        correctAnswer: 0,
        explanation:
          "Media queries allow CSS rules to apply conditionally, such as when the viewport is narrower than a specified width.",
      },
      {
        id: "q24",
        question:
          "What does the following CSS do? @media (max-width: 600px) { .container { grid-template-columns: 1fr; } }",
        options: [
          "Uses one grid column when the viewport is 600 pixels wide or narrower",
          "Creates six grid columns on every screen",
          "Makes the container disappear",
          "Changes the container into an image",
        ],
        correctAnswer: 0,
        explanation:
          "The media query applies the single-column layout when the viewport width is at most 600 pixels.",
      },
      {
        id: "q25",
        question: "Why is box-sizing: border-box useful?",
        options: [
          "It makes declared width and height include padding and borders",
          "It makes all elements circular",
          "It removes every margin from a webpage",
          "It automatically creates a responsive navigation bar",
        ],
        correctAnswer: 0,
        explanation:
          "With border-box, the declared width and height include the content, padding, and border, making layout dimensions easier to manage.",
      },
      {
        id: "q26",
        question:
          "Which CSS rule helps an image fit within its container without exceeding the container’s width?",
        options: [
          "img { max-width: 100%; height: auto; }",
          "img { width: 2000px; height: 2000px; }",
          "img { display: none; }",
          "img { color: purple; }",
        ],
        correctAnswer: 0,
        explanation:
          "max-width: 100% prevents the image from exceeding its container’s width, while height: auto preserves its aspect ratio.",
      },
      {
        id: "q27",
        question:
          "Which layout system is particularly useful for arranging items along one main axis?",
        options: [
          "Flexbox",
          "HTML tables for every layout",
          "Text decoration",
          "Font styling",
        ],
        correctAnswer: 0,
        explanation:
          "Flexbox is especially useful for one-dimensional layouts, such as navigation bars and rows of cards. Grid is particularly useful for two-dimensional layouts.",
      },
      {
        id: "q28",
        question:
          "Which layout system is especially suitable for a gallery arranged in rows and columns?",
        options: [
          "CSS Grid",
          "font-weight",
          "text-decoration",
          "border-radius",
        ],
        correctAnswer: 0,
        explanation:
          "CSS Grid is well suited to layouts that need control over both rows and columns.",
      },
      {
        id: "q29",
        question:
          "Why should a developer test a responsive page on different screen sizes?",
        options: [
          "To check that the content remains readable and the layout works correctly",
          "To change HTML into CSS automatically",
          "To make all text the same colour",
          "To remove every media query",
        ],
        correctAnswer: 0,
        explanation:
          "Testing helps developers identify issues such as overlapping content, narrow buttons, overflowing cards, and difficult navigation on smaller screens.",
      },
      {
        id: "q30",
        question:
          "Which combination is most suitable for creating a responsive course-card layout?",
        options: [
          "CSS Grid or Flexbox, appropriate spacing, and media queries when needed",
          "Only large fixed widths",
          "Only text decoration",
          "Only HTML comments",
        ],
        correctAnswer: 0,
        explanation:
          "Grid or Flexbox can arrange the cards, spacing properties help separate them, and media queries can adjust the layout for smaller screens.",
      },
    ],
  },

  // frontend-quiz-5
  // CSS Positioning and Navigation Bars
  {
    id: "frontend-quiz-5",
    lessonId: "frontend-lesson-5",
    title: "CSS Positioning and Navigation Bars",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",
        question: "What is CSS positioning used for?",
        options: [
          "Controlling where elements appear on a webpage",
          "Changing the computer’s operating system",
          "Creating database tables",
          "Replacing HTML elements with images",
        ],
        correctAnswer: 0,
        explanation:
          "CSS positioning helps developers control the placement of elements such as badges, navigation bars, and floating buttons.",
      },
      {
        id: "q2",
        question:
          "Which CSS position value is the default for most HTML elements?",
        options: ["absolute", "fixed", "static", "sticky"],
        correctAnswer: 2,
        explanation:
          "Elements use static positioning by default and appear in the normal document flow.",
      },
      {
        id: "q3",
        question: "What happens when an element uses position: static?",
        options: [
          "It follows the normal document flow",
          "It always remains at the top of the screen",
          "It automatically moves to the bottom-right corner",
          "It is always placed in front of other elements",
        ],
        correctAnswer: 0,
        explanation:
          "Static elements appear according to the normal layout. The top, right, bottom, and left properties do not reposition them.",
      },
      {
        id: "q4",
        question: "What does position: relative allow you to do?",
        options: [
          "Move an element relative to its normal position",
          "Remove an element from the HTML document",
          "Turn an element into a hyperlink",
          "Automatically make the element fixed to the viewport",
        ],
        correctAnswer: 0,
        explanation:
          "Relative positioning allows an element to be visually shifted from its normal position while retaining its original layout space.",
      },
      {
        id: "q5",
        question:
          "What happens when an element has position: relative; top: 20px;?",
        options: [
          "It moves 20 pixels upward",
          "It moves 20 pixels downward",
          "It moves 20 pixels to the left",
          "It becomes invisible",
        ],
        correctAnswer: 1,
        explanation:
          "A positive top value moves a relatively positioned element downward by the specified amount.",
      },
      {
        id: "q6",
        question:
          "Which positioning value removes an element from the normal document flow and allows it to be positioned relative to a suitable containing block?",
        options: ["static", "absolute", "inline", "normal"],
        correctAnswer: 1,
        explanation:
          "Absolutely positioned elements do not reserve their normal layout space and are positioned relative to their containing block.",
      },
      {
        id: "q7",
        question:
          "Which ancestor commonly provides the positioning reference for an absolutely positioned child?",
        options: [
          "An ancestor with position: relative",
          "An ancestor with color: red",
          "An ancestor with font-size: 20px",
          "An ancestor with text-align: center",
        ],
        correctAnswer: 0,
        explanation:
          "A positioned ancestor, commonly one with position: relative, can establish the containing block for an absolutely positioned descendant.",
      },
      {
        id: "q8",
        question:
          "Which positioning value is commonly used for a floating help button that remains visible while the page scrolls?",
        options: ["static", "relative", "fixed", "normal"],
        correctAnswer: 2,
        explanation:
          "Fixed positioning usually anchors an element to the viewport so it remains in the same screen position while the page scrolls.",
      },
      {
        id: "q9",
        question:
          "Which positioning value allows an element to scroll normally until it reaches a specified threshold and then stick?",
        options: ["static", "sticky", "absolute", "inline"],
        correctAnswer: 1,
        explanation:
          "Sticky positioning combines normal-flow behaviour with the ability to remain stuck at a specified position during scrolling.",
      },
      {
        id: "q10",
        question:
          "Which CSS declaration is commonly used to make a sticky navigation bar stick to the top?",
        options: [
          "position: sticky; top: 0;",
          "position: static; bottom: 100%;",
          "position: relative; left: 100%;",
          "position: normal; top: 0;",
        ],
        correctAnswer: 0,
        explanation:
          "position: sticky enables sticky behaviour, while top: 0 specifies the top threshold.",
      },
      {
        id: "q11",
        question: "What does the z-index property help control?",
        options: [
          "The stacking order of elements",
          "The text colour of a heading",
          "The width of a webpage",
          "The size of an image file",
        ],
        correctAnswer: 0,
        explanation:
          "z-index helps determine which elements appear in front of others within the relevant stacking contexts.",
      },
      {
        id: "q12",
        question:
          "Which HTML element is commonly used to group important navigation links?",
        options: ["<nav>", "<img>", "<title>", "<br>"],
        correctAnswer: 0,
        explanation:
          "The <nav> element identifies a section containing navigation links.",
      },
      {
        id: "q13",
        question: "What is the purpose of a website navigation bar?",
        options: [
          "To help visitors access pages and sections",
          "To change the computer’s screen resolution",
          "To create images automatically",
          "To replace the website’s HTML",
        ],
        correctAnswer: 0,
        explanation:
          "Navigation bars provide links to important destinations, making a website easier to explore.",
      },
      {
        id: "q14",
        question: "Which HTML element creates a clickable navigation link?",
        options: ["<a>", "<p>", "<h1>", "<table>"],
        correctAnswer: 0,
        explanation:
          "The anchor element creates a hyperlink. Its href attribute specifies the destination.",
      },
      {
        id: "q15",
        question:
          "Which attribute specifies where a navigation link should lead?",
        options: ["src", "href", "alt", "style"],
        correctAnswer: 1,
        explanation:
          "The href attribute specifies the target URL or page location for a hyperlink.",
      },
      {
        id: "q16",
        question:
          "Which CSS declaration is commonly used to place a logo and navigation links on opposite sides of a horizontal navigation bar?",
        options: [
          "display: flex; justify-content: space-between;",
          "display: none; color: purple;",
          "font-weight: bold; text-align: left;",
          "position: static; border-radius: 20px;",
        ],
        correctAnswer: 0,
        explanation:
          "Flexbox arranges the items, and justify-content: space-between distributes them with space between the logo and the link group.",
      },
      {
        id: "q17",
        question:
          "What does align-items: center do in a row-oriented Flexbox navigation bar?",
        options: [
          "Vertically aligns the flex items in the centre of the cross axis",
          "Moves all links to the bottom of the webpage",
          "Changes every link’s text colour",
          "Removes the navigation bar",
        ],
        correctAnswer: 0,
        explanation:
          "In a row-oriented Flexbox container, align-items: center aligns the items vertically within the available cross-axis space.",
      },
      {
        id: "q18",
        question:
          "Which declaration removes the underline from navigation links?",
        options: [
          "text-decoration: none;",
          "font-size: none;",
          "underline: false;",
          "border: underline;",
        ],
        correctAnswer: 0,
        explanation:
          "text-decoration: none removes the default underline from ordinary links.",
      },
      {
        id: "q19",
        question:
          "Which CSS pseudo-class can change a navigation link’s appearance when the pointer moves over it?",
        options: [":hover", ":clickonly", ":colour", ":pointer"],
        correctAnswer: 0,
        explanation:
          "The :hover pseudo-class applies styles while an element is hovered over.",
      },
      {
        id: "q20",
        question: "Why should navigation bars be designed responsively?",
        options: [
          "To make navigation usable on different screen sizes",
          "To force all users to use desktop computers",
          "To remove navigation links on every device",
          "To make the website’s text unreadable",
        ],
        correctAnswer: 0,
        explanation:
          "Responsive navigation helps links remain readable and usable on mobile phones, tablets, and desktop computers.",
      },
      {
        id: "q21",
        question:
          "What does flex-wrap: wrap do when used on a navigation link container?",
        options: [
          "Allows links to move onto another line when necessary",
          "Makes every link disappear",
          "Changes the links into images",
          "Fixes the navigation bar to the screen",
        ],
        correctAnswer: 0,
        explanation:
          "Flex wrapping allows items to move onto additional lines when there is insufficient horizontal space.",
      },
      {
        id: "q22",
        question:
          "Which media query targets viewports that are 600 pixels wide or narrower?",
        options: [
          "@media (max-width: 600px) { }",
          "@media (min-width: 600px) { }",
          "@media (height: 600px) { }",
          "@screen (max-width: 600px) { }",
        ],
        correctAnswer: 0,
        explanation:
          "max-width: 600px matches viewports whose width is at most 600 pixels.",
      },
      {
        id: "q23",
        question:
          "What is the main difference between fixed and sticky positioning?",
        options: [
          "Fixed positioning generally stays anchored to the viewport, while sticky positioning starts in normal flow and sticks when it reaches a threshold",
          "Fixed positioning only works with images, while sticky positioning only works with text",
          "Fixed positioning changes text colour, while sticky positioning changes font size",
          "There is no difference",
        ],
        correctAnswer: 0,
        explanation:
          "Fixed elements are removed from normal flow and usually remain anchored to the viewport. Sticky elements retain their normal layout space and stick within their scrolling container when the threshold is reached.",
      },
      {
        id: "q24",
        question: "What is the purpose of top: 0 in a sticky navigation bar?",
        options: [
          "It specifies the top position at which the element can stick",
          "It changes the navigation bar’s background colour",
          "It moves every link to the top of the HTML document",
          "It creates a new navigation link",
        ],
        correctAnswer: 0,
        explanation:
          "The top inset defines how far from the top of the relevant scrolling viewport the sticky element should remain when stuck.",
      },
      {
        id: "q25",
        question:
          "Which declaration is commonly used to position a floating help button 20 pixels from the right and bottom edges of the viewport?",
        options: [
          "position: fixed; right: 20px; bottom: 20px;",
          "position: static; left: 20px; top: 20px;",
          "position: relative; width: 20px; height: 20px;",
          "position: absolute; color: 20px;",
        ],
        correctAnswer: 0,
        explanation:
          "Fixed positioning anchors the button to the viewport, while right and bottom specify its distance from those edges.",
      },
      {
        id: "q26",
        question:
          "What does position: absolute do to an element’s normal layout space?",
        options: [
          "It removes the element from normal document flow",
          "It always reserves exactly the same space as a static element",
          "It automatically makes the element sticky",
          "It prevents the element from overlapping other elements",
        ],
        correctAnswer: 0,
        explanation:
          "An absolutely positioned element is removed from normal flow, so surrounding elements behave as though it does not occupy its original position.",
      },
      {
        id: "q27",
        question:
          "Which is a suitable CSS rule for a basic horizontal navigation bar?",
        options: [
          "nav { display: flex; align-items: center; justify-content: space-between; }",
          "nav { font-size: purple; width: bold; }",
          "nav { display: image; color: 20px; }",
          "nav { text-align: flex; position: colour; }",
        ],
        correctAnswer: 0,
        explanation:
          "Flexbox provides a suitable layout for arranging a logo and navigation links horizontally and aligning them.",
      },
      {
        id: "q28",
        question:
          "Why might an absolutely positioned badge use top: 10px and right: 10px inside a card?",
        options: [
          "To position the badge near the card’s top-right corner",
          "To change the badge’s text to ten words",
          "To make the badge occupy the entire webpage",
          "To move the badge into the browser’s address bar",
        ],
        correctAnswer: 0,
        explanation:
          "If the card establishes the containing block, the top and right offsets position the badge near its top-right corner.",
      },
      {
        id: "q29",
        question:
          "Which approach is most appropriate for a navigation bar that should remain visible near the top while scrolling but occupy space in the normal page layout?",
        options: [
          "Use position: sticky with top: 0",
          "Use position: static with bottom: 100%",
          "Use position: absolute with display: none",
          "Use position: relative with color: purple",
        ],
        correctAnswer: 0,
        explanation:
          "Sticky positioning allows the navigation bar to participate in normal flow and remain visible at the specified threshold while scrolling, subject to its container and layout conditions.",
      },
      {
        id: "q30",
        question:
          "Which combination of technologies is used in the navigation bar project to structure, style, and organise the content?",
        options: [
          "HTML for structure and links, CSS for appearance and layout",
          "CSS for all HTML content and a web browser for manufacturing hardware",
          "HTML only for colours and CSS only for hyperlinks",
          "JavaScript only for creating every part of the webpage",
        ],
        correctAnswer: 0,
        explanation:
          "HTML provides the navigation structure and links, while CSS controls the layout, colours, spacing, hover effects, and responsive behaviour. JavaScript can later be added for features such as a mobile menu toggle.",
      },
    ],
  },

  // frontend-quiz-6
  // CSS Flexbox and Grid
  {
    id: "frontend-quiz-6",
    lessonId: "frontend-lesson-6",
    title: "CSS Flexbox and Grid",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",

        question: "",

        options: ["", "", "", ""],

        correctAnswer: 0,

        explanation: "",
      },
    ],
  },

  // frontend-quiz-7
  // introduction to JavaScript
  {
    id: "frontend-quiz-7",
    lessonId: "frontend-lesson-7",
    title: "Introduction to JavaScript",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",

        question: "",

        options: ["", "", "", ""],

        correctAnswer: 0,

        explanation: "",
      },
    ],
  },
  {
    id: "frontend-quiz-2",
    lessonId: "frontend-lesson-2",
    title: "",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",

        question: "",

        options: ["", "", "", ""],

        correctAnswer: 0,

        explanation: "",
      },
    ],
  },
  {
    id: "frontend-quiz-2",
    lessonId: "frontend-lesson-2",
    title: "",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",

        question: "",

        options: ["", "", "", ""],

        correctAnswer: 0,

        explanation: "",
      },
    ],
  },

  {
    id: "frontend-quiz-2",
    lessonId: "frontend-lesson-2",
    title: "",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",

        question: "",

        options: ["", "", "", ""],

        correctAnswer: 0,

        explanation: "",
      },
    ],
  },

  {
    id: "frontend-quiz-3",
    lessonId: "frontend-lesson-3",
    title: "",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",

        question: "",

        options: ["", "", "", ""],

        correctAnswer: 0,

        explanation: "",
      },
    ],
  },
  {
    id: "frontend-quiz-4",
    lessonId: "frontend-lesson-4",
    title: "",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",

        question: "",

        options: ["", "", "", ""],

        correctAnswer: 0,

        explanation: "",
      },
    ],
  },

  {
    id: "frontend-quiz-5",
    lessonId: "frontend-lesson-5",
    title: "",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",

        question: "",

        options: ["", "", "", ""],

        correctAnswer: 0,

        explanation: "",
      },
    ],
  },
  {
    id: "frontend-quiz-6",
    lessonId: "frontend-lesson-6",
    title: "",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",

        question: "",

        options: ["", "", "", ""],

        correctAnswer: 0,

        explanation: "",
      },
    ],
  },
  {
    id: "frontend-quiz-7",
    lessonId: "frontend-lesson-7",
    title: "",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",

        question: "",

        options: ["", "", "", ""],

        correctAnswer: 0,

        explanation: "",
      },
    ],
  },

  {
    id: "frontend-quiz-8",
    lessonId: "frontend-lesson-8",
    title: "",
    passMark: 60,

    published: true,

    questions: [
      {
        id: "q1",

        question: "",

        options: ["", "", "", ""],

        correctAnswer: 0,

        explanation: "",
      },
    ],
  },
];
