export const initialLessons = [

// Product Design Lessons

// product design-lesson-1

  {
    id: "design-lesson-1",
    trackId: "track-product-design",

    title: "Introduction to Product Design",

    description:
      "Learn what product design means and how it helps solve real problems.",

    type: "lesson",

    duration: "10 minutes",

    published: true,

    content: `
# What is Product Design?

Product design is the process of understanding a problem and creating a useful solution.

Digital product designers work on products such as websites, mobile applications, and digital services.

## Why is product design important?

A product should help people complete tasks easily.

For example, a school website should help students find information without confusion.

## Important concepts

1. Users are the people who use a product.
2. User research helps us understand their needs.
3. Wireframes show the basic structure of a screen.
4. Prototypes demonstrate how a design may work.
5. Usability testing helps identify problems.

## Practical activity

Choose an application you use regularly.

Write down:
- What problem does it solve?
- Who uses it?
- What is easy to use?
- What would you improve?
`,
  },


  // product design-lesson-2

  {
    id: "design-lesson-2",
    trackId: "track-product-design",

    title: "Understanding Users",

    description:
      "Learn why designers need to understand the people using their products.",

    type: "lesson",

    duration: "12 minutes",

    published: true,

    content: `
# Understanding Users

Good design starts with understanding people.

Before designing a product, ask:

- Who will use it?
- What problem are they facing?
- What do they need to accomplish?
- What difficulties might they experience?

## Example

Imagine designing a school attendance application.

Teachers may need to record attendance quickly.

School administrators may need reports.

Students may need to see their attendance records.

These users have different needs.

## Practical activity

Imagine you are designing an online registration form.

List three problems a student might encounter when completing it.

Then suggest one improvement for each problem.
`,
  },



  // Frontend Development Lessons

  // frontend-lesson-1
  {
    id: "frontend-lesson-1",
    trackId: "track-frontend",

    title: "Introduction to Frontend Development",

    description:
      "Discover the technologies that make websites visible and interactive.",

    type: "lesson",

    duration: "10 minutes",

    published: true,

    content: `


1. What Is Frontend Development?

Frontend development is the process of creating the part of a website or web application that users can see and interact with.

Whenever you open a website, you see different things on the screen, such as text, images, buttons, menus, colours, forms, and videos. All these visible elements make up the user interface of the website.

Frontend development focuses on building this interface and making it work properly.

A person who creates and maintains the visible and interactive parts of websites is called a frontend developer.

For example, imagine visiting a school website. You might see:

* The school name and logo.
* Pictures of students and teachers.
* A menu containing Home, About Us, and Contact Us.
* A button for registering students.
* A form for entering your name and email address.

A frontend developer builds these elements and determines how they appear and behave when someone visits the website.

In simple words: Frontend development is about building the part of a website that people see, use, and interact with.

2. Understanding How Websites Work

To understand frontend development, you first need to understand that websites can contain different parts that work together.

Consider a website where students can register for a course.

When a student opens the website, they see the registration page. They enter their name, email address, and other required information before clicking the Register button.

The visible registration page is part of the frontend.

When the student submits the form, the website may send the information to a server, where the information can be processed and stored in a database.

The server and database are generally part of the backend system.

Therefore, web development is commonly divided into two major areas:

Frontend Development: This focuses on the visible parts of a website and the interactions users have with them.

Backend Development: This focuses on the behind-the-scenes operations, such as processing requests, managing accounts, and communicating with databases.

For example, on an online shopping website:

* The product pictures and prices displayed on the screen belong to the frontend.
* The process of adding a product to the shopping cart involves frontend interactions and may also require backend services.
* Processing an order and storing the purchase information are typically backend responsibilities.

Both frontend and backend development can work together to provide a complete website experience.

3. The Three Main Technologies of Frontend Development

Frontend development mainly relies on three important technologies: HTML, CSS, and JavaScript.

Each technology has a different responsibility.

A. HTML — HyperText Markup Language

HTML is used to create the structure and content of a webpage.

It tells the browser what elements should appear on the page.

These elements may include:

* Headings.
* Paragraphs.
* Images.
* Links.
* Buttons.
* Forms.
* Lists.

For example, imagine building a webpage that introduces CodeRise Academy.

You may want to display the heading:

Welcome to CodeRise Academy

You can use HTML to create that heading.

Example:

<h1>Welcome to CodeRise Academy</h1>
<p>Learn coding and build your future with technology.</p>
<button>Start Learning</button>

In this example:

* <h1> creates a main heading.
* <p> creates a paragraph.
* <button> creates a button.

HTML provides the content and structure of the webpage.

Think of HTML as the framework of a house. It determines where important parts of the house are located.

B. CSS — Cascading Style Sheets

CSS is used to control the appearance and layout of a webpage.

After creating the structure with HTML, you can use CSS to make the webpage attractive and easier to use.

CSS controls things such as:

* Text colours.
* Background colours.
* Font sizes.
* Spacing.
* Borders.
* Button designs.
* Page layouts.
* Responsive designs for different screen sizes.

For example, you can use CSS to change the heading colour to purple and give the button a purple background.

Example:

h1 {
  color: purple;
}
button {
  background-color: purple;
  color: white;
  padding: 10px 20px;
  border: none;
}

In this example:

* color: purple; makes the heading text purple.
* background-color: purple; gives the button a purple background.
* color: white; makes the button text white.
* padding: 10px 20px; adds space inside the button.
* border: none; removes the button’s default border.

CSS makes a webpage more attractive, organised, and user-friendly.

Think of CSS as the paint, decorations, and interior design of a house.

C. JavaScript

JavaScript is a programming language used to make webpages interactive and dynamic.

HTML creates the structure, and CSS controls the appearance, while JavaScript allows the webpage to respond to user actions and other events.

JavaScript can be used to:

* Display messages when a button is clicked.
* Open and close menus.
* Validate information entered into forms.
* Create quizzes and interactive games.
* Update information displayed on a webpage.
* Build interactive dashboards.
* Communicate with backend services.

For example, imagine a webpage with a button labelled “Click Me”.

You can use JavaScript to display a message whenever someone clicks the button.

Example:

<button onclick="alert('Welcome to CodeRise Academy!')">
  Click Me
</button>

When the user clicks the button, a message appears on the screen.

JavaScript gives the webpage the ability to respond to the user’s action.

Think of JavaScript as the electrical and control systems that make certain features of a house work.

Remember:

* HTML provides the structure.
* CSS controls the appearance.
* JavaScript adds interactivity.

These three technologies form the foundation of frontend development.

4. What Does a Frontend Developer Do?

A frontend developer performs several important tasks when building a website.

1. Builds webpage structures

The developer uses HTML to organise content into headings, paragraphs, images, links, buttons, and other elements.

2. Designs webpage layouts

The developer uses CSS to arrange content, select colours, adjust spacing, and create attractive page designs.

3. Adds interactive features

The developer uses JavaScript to make buttons, menus, forms, and other website elements respond to user actions.

4. Makes websites responsive

A website should work properly on different devices, including mobile phones, tablets, and computers.

A frontend developer uses responsive design techniques to help the website adjust to different screen sizes.

For example, a navigation menu that appears horizontally on a computer might become a collapsible menu on a mobile phone.

5. Tests and fixes errors

Frontend developers check their work to make sure webpages display correctly and interactive features behave as expected.

They also identify and fix problems that may prevent users from using the website properly.

6. Works with other developers

Frontend developers may work with backend developers, designers, and other team members to build complete digital products.

5. Tools Used in Frontend Development

Frontend developers use different tools to write code, test websites, and manage their projects.

Some important tools include:

A. Visual Studio Code (VS Code)

VS Code is a code editor that developers use to write and organise HTML, CSS, JavaScript, and other programming languages.

It provides useful features such as syntax highlighting, code completion, and extensions.

B. A Web Browser

A web browser is an application used to open and view websites.

Examples include Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari.

Frontend developers use browsers to view their webpages, test features, and identify errors.

C. Browser Developer Tools

Modern browsers include developer tools that help developers inspect webpage elements, test CSS changes, view error messages, and investigate problems.

D. Git and GitHub

Git is a version control system that helps developers track changes made to their code.

GitHub is an online platform where developers can store and share Git repositories, collaborate with others, and manage software projects.

E. Figma

Figma is a design tool used to create website and application designs before they are built.

Frontend developers may use these designs as references when writing their code.

6. Types of Websites Frontend Developers Can Build

Frontend developers can create many different types of websites and web applications.

Examples include:

1. Educational Websites

These websites provide information about schools, learning programmes, courses, and educational services.

Example: A CodeRise Academy website displaying courses, learning materials, and student registration pages.

2. Business Websites

These websites introduce businesses, display their services, and provide contact information.

3. E-commerce Websites

These websites allow users to browse products, view prices, and interact with shopping features.

4. Portfolio Websites

These websites allow developers, designers, photographers, and other professionals to display their work and skills.

5. Web Applications

These are interactive applications accessed through a web browser.

Examples include online assessment systems, student dashboards, learning platforms, and task management applications.

A frontend developer can work on all these projects, depending on their skills and experience.

7. Why Is Frontend Development Important?

Frontend development is important because it determines how users experience and interact with a website.

A website may contain useful information and powerful features, but users may struggle to use it if the interface is confusing or poorly designed.

Good frontend development helps to achieve the following:

Easy navigation: Users can find information and move between pages without unnecessary difficulty.

Better user experience: Websites become easier and more comfortable to use.

Clear presentation: Information is organised in a way that users can understand.

Mobile accessibility: Responsive websites can adapt to different screen sizes.

User interaction: Buttons, forms, menus, and other elements allow users to perform tasks.

Professional appearance: A well-structured and consistent interface helps a website look more professional.

For example, imagine two educational websites.

The first website has tiny text, confusing menus, and buttons that do not work.

The second website has readable text, clear menus, well-organised lessons, and working buttons.

Most users would find the second website easier to use.

This demonstrates why frontend development is an important part of building successful websites.

8. What You Will Learn as a Beginner Frontend Developer

Frontend development is a skill that can be learned gradually through practice.

As a beginner, you should focus on understanding the fundamentals before moving to advanced tools and frameworks.

Your learning journey can follow these stages:

Stage 1: HTML Fundamentals

You will learn how to create headings, paragraphs, links, images, lists, tables, and forms.

You will also learn how to organise the content of a webpage.

Stage 2: CSS Fundamentals

You will learn how to style webpages using colours, fonts, spacing, borders, layouts, and backgrounds.

You will also learn how to make webpages responsive.

Stage 3: JavaScript Fundamentals

You will learn variables, data types, operators, conditions, loops, functions, events, and DOM manipulation.

These concepts will help you create interactive webpages.

Stage 4: Responsive Web Design

You will learn how to make websites adjust to different screen sizes and devices.

Stage 5: Git and GitHub

You will learn how to track changes in your code and store your projects online.

Stage 6: Frontend Frameworks and Libraries

After developing a good foundation, you can progress to tools such as React, which helps developers build interfaces using reusable components.

Stage 7: Practical Projects

You will apply what you have learned by building projects such as personal portfolios, landing pages, calculators, quizzes, and dashboards.

The most important thing is to understand the fundamentals and practise consistently.

You do not need to master everything at once.

9. Summary

Frontend development is the process of building the visible and interactive parts of websites and web applications.

A frontend developer works with different technologies and tools to create webpages that are attractive, functional, accessible, and responsive.

The three main technologies you must understand are:

* HTML: Creates the structure and content of a webpage.
* CSS: Controls the appearance and layout of a webpage.
* JavaScript: Adds interactivity and dynamic behaviour.

Other useful tools include VS Code, web browsers, browser developer tools, Git, GitHub, and Figma.

As you progress in frontend development, you will learn how to build complete websites and interactive web applications.

Remember that becoming a frontend developer takes time, practice, and patience. Start with the basics, practise what you learn, and gradually move to more advanced topics.

⸻



Before writing any code, identify which technology you would use for each task.

* Which technology would you use to create the heading and paragraph?
* Which technology would you use to give the button a purple background?
* Which technology would you use to make the button display a message when clicked?

Learning outcome: By completing this activity, you should understand the different responsibilities of HTML, CSS, and JavaScript before beginning your first practical coding lesson.
`,
  },



  // frontend-lesson-2
  // HTML Fundamentals

  {
    id: "frontend-lesson-2",
    trackId: "track-frontend",

    title: "HTML Fundamentals",

    description:
      "Learn the basic structure of an HTML document.",

    type: "lesson",

    duration: "15 minutes",

    published: true,

    content: `
# HTML Fundamentals


1. Introduction to HTML

HTML stands for HyperText Markup Language. It is the standard markup language used to create the structure of webpages.

HTML tells a web browser how to organise and display content, such as headings, paragraphs, images, links, and lists.

For example, when you visit a school website, you may see the school’s name, pictures of students, information about the school, and links to different pages. HTML helps developers organise these elements on the webpage.

HTML is the foundation of frontend development. Before learning how to make websites beautiful or interactive, you should first understand how to structure their content.

Frontend development has three important technologies:

* HTML: Creates the structure of a webpage.
* CSS: Controls the appearance and layout of a webpage.
* JavaScript: Adds interactive features to a webpage.

For example, if you want to create a button on a webpage, HTML can create the button, CSS can style it, and JavaScript can make it respond when someone clicks it.

2. Understanding HTML Tags and Elements

HTML uses tags to identify different types of content.

A tag is written inside angle brackets (< >).

For example:

<h1>Welcome to My Website</h1>

This code contains three important parts:

* <h1> is the opening tag.
* Welcome to My Website is the content.
* </h1> is the closing tag.

Together, these parts form an HTML element.

Most HTML elements have opening and closing tags. The closing tag contains a forward slash (/) before the tag name.

For example:

<p>I am learning HTML.</p>

Here, <p> opens the paragraph, while </p> closes it.

Some elements, such as <img> and <br>, do not require closing tags.

Understanding tags and elements is important because you will use them whenever you write HTML code.

3. The Basic Structure of an HTML Document

Every beginner should know how to create a complete HTML document.

A basic HTML document follows a standard structure that helps the browser understand the page.

Example:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Website</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>This is my first webpage.</p>
</body>
</html>

Explanation of the code

<!DOCTYPE html>

This tells the browser to interpret the document using modern HTML standards.

<html lang="en">

This is the root element of the webpage. The lang="en" attribute indicates that the main language of the page is English.

<head>

The head contains information about the webpage, such as its title and settings.

<title>

This sets the title that usually appears in the browser tab.

<body>

The body contains the main content that visitors see on the webpage.

<h1>

This creates the main heading.

<p>

This creates a paragraph.

Why is this structure important?

Without a proper document structure, your HTML code may be difficult to organise and maintain.

Whenever you start a new HTML project, begin with the basic document structure and place your visible content inside the <body> element.

4. HTML Headings

Headings are used to introduce topics and organise information on a webpage.

HTML provides six heading levels, from <h1> to <h6>.

Example:

<h1>CodeRise Academy</h1>
<h2>Our Courses</h2>
<h3>Frontend Development</h3>
<h4>HTML Fundamentals</h4>

The <h1> element represents the highest heading level, while <h6> represents the lowest.

For example, on an academy website:

* The academy name could be the main heading.
* “Our Courses” could be a section heading.
* “Frontend Development” could be a subsection heading.

Headings help organise information and make webpages easier to understand.

Practice: Create a webpage containing your name as the main heading, your school name as a second-level heading, and three subjects as third-level headings.

5. HTML Paragraphs and Text Formatting

Paragraphs are used to display sentences and blocks of text.

The <p> tag creates a paragraph.

Example:

<h1>About Me</h1>
<p>My name is David.</p>
<p>I am a student at CodeRise Academy.</p>
<p>I am learning how to build websites using HTML.</p>

Each paragraph is displayed as a separate block of text.

HTML also provides elements for emphasising or highlighting text.

Bold importance:

<strong>HTML is important.</strong>

The <strong> element indicates that the text has strong importance.

Emphasis:

<em>Practise coding every day.</em>

The <em> element indicates emphasis.

Line break:

<p>
    CodeRise Academy<br>
    Frontend Development
</p>

The <br> element moves the following content to a new line without starting a new paragraph.

These elements help you organise and present text clearly.

6. HTML Links

Links allow visitors to move from one webpage to another or open another destination.

HTML uses the <a> element to create links.

Example:

<a href="https://www.google.com">Visit Google</a>

In this example, “Visit Google” is the clickable text.

The href attribute specifies the destination.

There are two common types of links.

External links: These take visitors to another website.

<a href="https://www.wikipedia.org">Visit Wikipedia</a>

Internal links: These connect pages within your own website.

<a href="about.html">About Us</a>

For the internal link to work, the about.html file must exist at the specified location.

Links are important because they help visitors navigate between pages and access additional information.

Practice: Create a link to Google and another link to an about.html page in your project.

7. Adding Images to a Webpage

Images make webpages more interesting and help communicate information visually.

HTML uses the <img> element to display images.

Example:

<img src="student.jpg" alt="A student learning HTML">

This element contains two important attributes.

* src specifies the location of the image.
* alt provides alternative text describing the image.

The image file must exist at the location specified by src.

For example, suppose your project has this folder structure:

my-website/
├── index.html
└── images/
    └── school.jpg

You can display the image using:

<img src="images/school.jpg" alt="School building">

The src value must match the actual file location.

The alt attribute is important because it helps people using screen readers understand the image and provides alternative text when the image cannot be displayed.

Practice: Create a webpage about your school and add a picture of the school.

8. HTML Lists

Lists allow you to organise related information.

HTML provides two common types of lists: ordered lists and unordered lists.

A. Unordered lists

An unordered list displays items with bullet points by default.

It uses the <ul> element, while each item uses the <li> element.

Example:

<h2>Our Courses</h2>
<ul>
    <li>Frontend Development</li>
    <li>Backend Development</li>
    <li>Product Design</li>
</ul>

This creates a list of three courses.

B. Ordered lists

An ordered list displays items in a sequence, usually with numbers.

It uses the <ol> element.

Example:

<h2>Steps to Build a Website</h2>
<ol>
    <li>Plan the website.</li>
    <li>Write the HTML code.</li>
    <li>Add CSS styling.</li>
    <li>Test the website.</li>
</ol>

The browser displays the items in numbered order.

Practice: Create an unordered list of five favourite foods and an ordered list showing five steps you follow when preparing for school.

9. Introduction to HTML Tables

Tables are used to display information in rows and columns.

For example, a school can use a table to display students’ names, subjects, and scores.

HTML provides several elements for creating tables.

* <table> creates the table.
* <tr> creates a row.
* <th> creates a header cell.
* <td> creates a regular data cell.

Example:

<table>
    <tr>
        <th>Student Name</th>
        <th>Subject</th>
        <th>Score</th>
    </tr>
    <tr>
        <td>David</td>
        <td>HTML</td>
        <td>85</td>
    </tr>
    <tr>
        <td>Sarah</td>
        <td>HTML</td>
        <td>90</td>
    </tr>
</table>

The first row contains the column headings, while the following rows contain student information.

HTML creates the table structure. CSS can later be used to add borders, colours, spacing, and other styles.

Practice: Create a table containing four students, their courses, and their assessment scores.

10. Introduction to HTML Forms

Forms allow websites to collect information from users.

For example, a registration form might ask a student to enter their name, email address, and preferred course.

The <form> element groups the form controls.

Example:

<form>
    <label for="fullname">Full Name:</label>
    <input type="text" id="fullname" name="fullname">
    <br><br>
    <label for="email">Email Address:</label>
    <input type="email" id="email" name="email">
    <br><br>
    <button type="submit">Submit</button>
</form>

Understanding the form elements

<form> groups the fields used to collect information.

<label> describes the purpose of a field.

<input> creates a field where users can enter or select information.

type="text" creates a text input.

type="email" creates an input intended for an email address.

<button> creates a button that can submit the form.

The for attribute in a label should match the id of its corresponding input.

Important: HTML can create the form, but a working registration system that stores student details requires appropriate backend processing or a configured external service.

Practice: Create a simple form that collects a student’s name, email address, and preferred course.

11. Your First HTML Project

Now that you understand the basic HTML elements, you can combine them to create a simple webpage.

Project: My Personal Webpage

Objective: Build a webpage that introduces you to visitors.

Your webpage should contain:

1. Your name as the main heading.
2. An About Me section.
3. Two paragraphs about yourself.
4. An image.
5. A list of your favourite subjects.
6. A table showing three skills you want to learn.
7. A link to an educational website.
8. A footer containing your name.

Starter Code

Create a file named index.html and enter the following code:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Personal Webpage</title>
</head>
<body>
    <h1>My Name Is David</h1>
    <h2>About Me</h2>
    <p>I am a student learning frontend development.</p>
    <p>I want to learn how to create my own websites.</p>
    <h2>My Favourite Subjects</h2>
    <ul>
        <li>Mathematics</li>
        <li>English</li>
        <li>Computer Studies</li>
    </ul>
    <h2>My Learning Goals</h2>
    <table>
        <tr>
            <th>Skill</th>
            <th>Status</th>
        </tr>
        <tr>
            <td>HTML</td>
            <td>Learning</td>
        </tr>
        <tr>
            <td>CSS</td>
            <td>Not Started</td>
        </tr>
        <tr>
            <td>JavaScript</td>
            <td>Not Started</td>
        </tr>
    </table>
    <h2>Learn More</h2>
    <a href="https://developer.mozilla.org/en-US/docs/Learn_web_development">
        Learn Web Development
    </a>
    <footer>
        <p>Created by David.</p>
    </footer>
</body>
</html>

Project Instructions

After entering the code:

1. Replace David’s name with your own name.
2. Write your own paragraphs.
3. Change the subjects to your favourites.
4. Add an image of your choice.
5. Update the learning goals table.
6. Save the file.
7. Open it in a browser to see your webpage.

Challenge: Add a new section called “My Hobbies” and include at least three hobbies in an unordered list.

The goal is to understand how different HTML elements work together to form a complete webpage.



13. Lesson Summary

HTML is used to create the structure of webpages.

In this lesson, you learned how to:

* Create a basic HTML document.
* Use headings and paragraphs.
* Add links and images.
* Create ordered and unordered lists.
* Display information using tables.
* Create simple forms.
* Combine HTML elements to build a personal webpage.

The most important thing is to practise writing your own code. Start with simple webpages and gradually add more elements as your understanding improves.

Next Lesson: CSS Fundamentals — Learn How to Style Your HTML Webpages.
`,
  },


  // frontend-lesson-3
  // CSS Fundamentals

  {
    id: "frontend-lesson-3",
    trackId: "track-frontend",

    title: "CSS Fundamentals",

    description:
      "Learn how CSS styles the structure created with HTML.",

    type: "lesson",

    duration: "15 minutes",

    published: true,

    content: `
# Introduction to CSS
CSS FUNDAMENTALS

Course: Frontend Development
Level: Beginner
Module: Introduction to CSS

1. Introduction to CSS

CSS stands for Cascading Style Sheets. It is a language used to style and design web pages created with HTML.

HTML provides the structure of a webpage, while CSS controls how that webpage looks.

For example:

* HTML creates a heading.
* CSS changes the heading’s colour, size, and position.
* HTML creates a button.
* CSS adds a background colour, border, and spacing to the button.

Example

HTML:

<h1>Welcome to CodeRise Academy</h1>
<p>Learn coding and build amazing projects.</p>

Without CSS, the webpage will have a simple appearance.

CSS:

h1 {
  color: purple;
  font-size: 32px;
}
p {
  color: gray;
  font-size: 18px;
}

The heading will appear purple and larger, while the paragraph will appear gray.

2. How to Add CSS to HTML

There are three main ways to add CSS to an HTML document.

A. Inline CSS

Inline CSS is written directly inside an HTML element using the style attribute.

Example:

<h1 style="color: purple;">My First Website</h1>

This makes the heading purple.

Inline CSS is useful for small examples, but it is not the best choice for styling an entire website.

B. Internal CSS

Internal CSS is written inside a <style> element in the HTML document’s <head> section.

Example:

<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <style>
    h1 {
      color: purple;
    }
    p {
      font-size: 18px;
    }
  </style>
</head>
<body>
  <h1>Welcome!</h1>
  <p>This is my first webpage.</p>
</body>
</html>

C. External CSS

External CSS is written in a separate file and connected to the HTML document.

For example, a project may contain two files:

* index.html
* style.css

Inside index.html, connect the CSS file within the <head> section:

<link rel="stylesheet" href="style.css">

Inside style.css, write:

h1 {
  color: purple;
}
p {
  font-size: 18px;
}

External CSS is recommended for most projects because it keeps HTML and CSS separate and makes the code easier to organise.

3. Understanding CSS Syntax

CSS follows a simple structure called a rule.

Example:

h1 {
  color: blue;
  font-size: 30px;
}

A CSS rule contains three important parts:

* Selector: h1 identifies the HTML element to style.
* Property: color specifies what you want to change.
* Value: blue specifies the colour to apply.

The property and value are written inside curly braces { }.

Each declaration usually ends with a semicolon ;.

4. CSS Selectors

Selectors allow you to choose which HTML elements should receive a particular style.

A. Element Selector

An element selector targets all elements of a particular type.

p {
  color: green;
}

This makes all paragraphs green.

B. Class Selector

A class selector targets elements with a particular class name. It begins with a dot (.).

HTML:

<p class="highlight">This is an important message.</p>

CSS:

.highlight {
  color: orange;
  font-weight: bold;
}

The paragraph with the highlight class will have orange, bold text.

A class can be used on multiple HTML elements.

C. ID Selector

An ID selector targets an element with a particular ID. It begins with a hash (#).

HTML:

<h1 id="main-heading">My Website</h1>

CSS:

#main-heading {
  color: purple;
}

An ID should be unique within an HTML page.

5. Changing Text Appearance

CSS provides properties for controlling how text looks.

Colour

The color property changes text colour.

h1 {
  color: purple;
}

Font Size

The font-size property controls the size of text.

p {
  font-size: 18px;
}

Font Family

The font-family property determines which typeface is used.

body {
  font-family: Arial, sans-serif;
}

Font Weight

The font-weight property controls how thick or bold text appears.

h1 {
  font-weight: bold;
}

Text Alignment

The text-align property controls horizontal text alignment.

h1 {
  text-align: center;
}

Common values include left, center, and right.

6. Background Colours and Images

CSS allows you to add background colours and images to elements.

Background Colour

Use background-color to change an element’s background.

body {
  background-color: lightgray;
}

You can also style individual sections:

header {
  background-color: purple;
  color: white;
}

Background Image

Use background-image to place an image behind an element’s content.

body {
  background-image: url("background.jpg");
  background-size: cover;
  background-position: center;
}

The image file must be available at the specified path.

7. The CSS Box Model

Every HTML element is treated as a rectangular box. Understanding this concept helps you control spacing and layout.

The CSS box model has four main parts:

1. Content: The text, image, or other content inside the element.
2. Padding: Space between the content and its border.
3. Border: The line surrounding the padding and content.
4. Margin: Space outside the border that separates the element from other elements.

Example:

.card {
  padding: 20px;
  border: 2px solid purple;
  margin: 15px;
}

This creates space inside the card, adds a purple border, and separates the card from surrounding elements.

A useful setting for most projects is:

* {
  box-sizing: border-box;
}

This makes the declared width and height include the element’s padding and border.

8. Styling Borders, Width, and Height

CSS allows you to control an element’s dimensions and borders.

Example:

.card {
  width: 300px;
  height: 200px;
  border: 2px solid black;
  border-radius: 10px;
}

Here:

* width sets the element’s width.
* height sets its height.
* border adds a border.
* border-radius rounds the corners.

You can also use max-width to prevent an element from becoming too wide.

9. Styling Buttons and Links

Buttons and links are common parts of websites. CSS can make them more attractive and easier to use.

HTML:

<a href="#" class="button">Get Started</a>

CSS:

.button {
  display: inline-block;
  background-color: purple;
  color: white;
  padding: 12px 20px;
  text-decoration: none;
  border-radius: 6px;
}
.button:hover {
  background-color: darkviolet;
}

The :hover selector applies a style when the user moves the mouse pointer over the element.

10. Introduction to CSS Layout

CSS layout properties help arrange elements on a webpage.

A. Display

The display property determines how an element participates in the layout.

.card {
  display: block;
}

Common values include block, inline, inline-block, flex, and grid.

B. Flexbox

Flexbox helps arrange elements in a row or column.

Example:

.container {
  display: flex;
  justify-content: center;
  gap: 20px;
}

This arranges the container’s children in a row, centres them horizontally, and adds space between them.

C. Grid

CSS Grid helps arrange content in rows and columns.

.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

This creates three equal-width columns, making it useful for cards, galleries, and course listings.

11. Responsive Design

Responsive design means creating websites that work well on different screen sizes, including phones, tablets, and computers.

A website should not require users to zoom in constantly or scroll sideways to read its content.

Example: Media Query

.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}
@media (max-width: 600px) {
  .container {
    grid-template-columns: 1fr;
  }
}

On wider screens, the content appears in three columns. On screens that are 600 pixels wide or narrower, it changes to one column.

For responsive images, you can use:

img {
  max-width: 100%;
  height: auto;
}

This helps images fit within their containers without becoming wider than the available space.

12. Practical Project: Design a Personal Profile Card

Now that you understand the basics, create a simple profile card using HTML and CSS.

Step 1: Create Your Files

Create a folder called profile-card.

Inside it, create:

* index.html
* style.css

Step 2: Write the HTML

Inside index.html, add:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Profile Card</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card">
    <h1>My Name</h1>
    <p class="role">Frontend Developer</p>
    <p>I am learning HTML and CSS to build amazing websites.</p>
    <a href="#" class="button">Contact Me</a>
  </div>
</body>
</html>

Step 3: Write the CSS

Inside style.css, add:

* {
  box-sizing: border-box;
}
body {
  font-family: Arial, sans-serif;
  background-color: #f2f2f2;
  margin: 0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.card {
  background-color: white;
  width: 100%;
  max-width: 350px;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.card h1 {
  color: purple;
}
.role {
  color: gray;
  font-weight: bold;
}
.button {
  display: inline-block;
  background-color: purple;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  text-decoration: none;
}
.button:hover {
  background-color: darkviolet;
}

Step 4: Open Your Project

Open index.html in your web browser.

You should see a profile card centred on a light-gray background, with a purple heading and a Contact Me button.

Step 5: Improve Your Project

Make the project your own by completing these tasks:

1. Replace “My Name” with your real name or a name of your choice.
2. Change the purple colour to another colour.
3. Increase or decrease the card’s padding.
4. Add a profile image.
5. Change the background colour.
6. Make sure the card looks good on a mobile phone.



Practical Assessment

Create a personal profile card that contains:

* Your name.
* Your profile image.
* Your role or area of interest.
* A short introduction.
* A contact button.

Use CSS to style the background, text, spacing, borders, and button. Your card must also fit properly on a mobile screen.

14. Lesson Summary

In this lesson, you learned that CSS controls the appearance and layout of webpages. You explored CSS syntax, selectors, text styling, backgrounds, the box model, buttons, Flexbox, Grid, and responsive design.

You also created a profile card using separate HTML and CSS files.

Next Lesson: CSS Styling and Layout Practice — you will practise combining CSS properties to create more attractive webpages and organise content into professional layouts.
`,
  },



  // frontend-lesson-4
  // CSS Styling and Layout Practice
  {
    id: "frontend-lesson-4",
    trackId: "track-frontend",
    title:" CSS Styling and Layout Practice",
    description: "Practice combining CSS properties to create attractive webpages and organise content into professional layouts.",
    type: "lesson",
    duration: "15 minutes",
    published: true,
    content: `
    

1. Introduction

In the previous lesson, you learned that CSS is used to style HTML webpages. You also learned about colours, fonts, borders, spacing, Flexbox, Grid, and responsive design.

In this lesson, you will learn how to combine these CSS properties to create attractive and organised webpages.

By the end of this lesson, you should be able to:

* Style a webpage using colours and fonts.
* Add spacing between elements.
* Design attractive cards and buttons.
* Arrange content using Flexbox and Grid.
* Add hover effects.
* Create a simple responsive webpage.

2. Understanding CSS Colours

Colours help make a webpage attractive and improve the appearance of its content.

CSS provides different ways to specify colours.

A. Colour Names

You can use standard colour names.

h1 {
  color: purple;
}
body {
  background-color: white;
}

B. Hexadecimal Colours

Hexadecimal colours begin with the # symbol.

h1 {
  color: #6c2bd9;
}
body {
  background-color: #f5f5f5;
}

Here, #6c2bd9 is a shade of purple, while #f5f5f5 is a light gray.

C. RGB Colours

RGB stands for Red, Green, and Blue.

p {
  color: rgb(50, 50, 50);
}

RGB allows you to combine different amounts of red, green, and blue to create colours.

Practice: Create a webpage with a purple heading, a light-gray background, and dark text.

3. Working with Fonts and Text

Text styling makes a webpage easier to read and gives it a consistent appearance.

Font Size

The font-size property controls the size of text.

h1 {
  font-size: 36px;
}
p {
  font-size: 16px;
}

Font Family

The font-family property determines the typeface used for text.

body {
  font-family: Arial, sans-serif;
}

Font Weight

The font-weight property controls how thick the text appears.

h2 {
  font-weight: bold;
}

Line Height

The line-height property controls the space between lines of text.

p {
  line-height: 1.6;
}

A suitable line height makes paragraphs more comfortable to read.

Text Decoration

The text-decoration property controls decorative lines on text.

a {
  text-decoration: none;
}

This removes the default underline from links.

4. Understanding Margin and Padding

Margin and padding are important for creating space in a webpage.

Margin creates space outside an element’s border.

Padding creates space between an element’s content and its border.

Example:

.card {
  margin: 20px;
  padding: 25px;
  background-color: white;
}

In this example:

* margin: 20px separates the card from surrounding elements.
* padding: 25px creates space inside the card.

You can also control each side individually.

.card {
  margin-top: 20px;
  padding-left: 15px;
}

Practice: Create a paragraph with padding and margin. Observe how the spacing changes the appearance of the webpage.

5. Creating Attractive Cards

A card is a container used to display related information in a neat, organised format.

Cards are commonly used for:

* Course information.
* Product descriptions.
* User profiles.
* Blog posts.
* Services.

HTML

<div class="card">
  <h2>Frontend Development</h2>
  <p>Learn how to build websites using HTML, CSS, and JavaScript.</p>
  <button>Start Learning</button>
</div>

CSS

.card {
  width: 300px;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.card h2 {
  color: purple;
}
.card button {
  background-color: purple;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}

The card has a white background, rounded corners, a shadow, and a purple button.

The box-shadow property adds a shadow around the card, while cursor: pointer changes the mouse pointer when it moves over the button.

Important: CSS can style a button, but it does not automatically make the button perform an action. JavaScript or another suitable mechanism is needed for interactive behaviour.

6. Using Flexbox to Arrange Elements

Flexbox is a CSS layout system that helps you arrange elements in rows or columns.

For example, you can use Flexbox to place three course cards beside one another.

HTML

<div class="container">
  <div class="card">HTML Fundamentals</div>
  <div class="card">CSS Fundamentals</div>
  <div class="card">JavaScript Fundamentals</div>
</div>

CSS

.container {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 20px;
  flex-wrap: wrap;
}
.card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  flex: 1 1 200px;
}

Explanation

* display: flex activates Flexbox.
* justify-content: center centres the items along the main axis.
* align-items: stretch allows items to stretch along the cross axis when appropriate.
* gap: 20px creates space between the items.
* flex-wrap: wrap allows items to move onto another line when necessary.
* flex: 1 1 200px allows cards to grow or shrink while aiming for a base width of 200 pixels.

Flexbox is useful for navigation bars, button groups, and rows of cards.

7. Using CSS Grid

CSS Grid is another layout system. It is particularly useful when arranging content in rows and columns.

HTML

<div class="course-container">
  <div class="course">HTML</div>
  <div class="course">CSS</div>
  <div class="course">JavaScript</div>
  <div class="course">React</div>
</div>

CSS

.course-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.course {
  background-color: #eee5ff;
  padding: 25px;
  text-align: center;
  border-radius: 8px;
}

Explanation

* display: grid activates CSS Grid.
* grid-template-columns: repeat(2, 1fr) creates two equal-width columns.
* gap: 20px adds space between the grid items.
* text-align: center centres the text.

Grid is useful for image galleries, product displays, course listings, and dashboards.

8. Adding Hover Effects

A hover effect changes the appearance of an element when a mouse pointer moves over it.

For example:

button {
  background-color: purple;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
button:hover {
  background-color: darkviolet;
}

The button changes colour when the user hovers over it.

The transition property makes the colour change smoother.

You can also add hover effects to cards.

.card {
  transition: transform 0.3s ease;
}
.card:hover {
  transform: translateY(-5px);
}

This moves the card slightly upwards when hovered over.

On touchscreens, hover effects may not work in the same way as they do with a mouse, so important information should not depend on hover alone.

9. Making a Webpage Responsive

A responsive webpage adjusts its layout to fit different screen sizes.

A layout that looks good on a laptop may not fit properly on a mobile phone. Responsive CSS helps solve this problem.

Example: Responsive Course Cards

.course-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
@media (max-width: 768px) {
  .course-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .course-container {
    grid-template-columns: 1fr;
  }
}

This layout displays:

* Three columns on wider screens.
* Two columns on screens 768 pixels wide or narrower.
* One column on screens 480 pixels wide or narrower.

A media query allows CSS rules to apply only when certain conditions are met.

Practice: Change the screen width in your browser’s developer tools and observe how the cards rearrange themselves.

10. Practical Project: Build a Course Listing Page

You will now combine what you have learned to create a simple course listing webpage.

Project Requirements

Your webpage should contain:

* A heading introducing your courses.
* A short description.
* Three course cards.
* A button on each card.
* Attractive colours and spacing.
* A responsive layout.

Step 1: Create Your Files

Create a folder called course-page.

Inside it, create:

* index.html
* style.css

Step 2: HTML Code

Add the following to index.html:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Course Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="header">
    <h1>Learn New Skills</h1>
    <p>Choose a course and begin your learning journey.</p>
  </header>
  <main class="course-container">
    <article class="course-card">
      <h2>HTML Fundamentals</h2>
      <p>Learn how to structure webpages using HTML.</p>
      <button>View Course</button>
    </article>
    <article class="course-card">
      <h2>CSS Fundamentals</h2>
      <p>Learn how to style webpages using CSS.</p>
      <button>View Course</button>
    </article>
    <article class="course-card">
      <h2>JavaScript Fundamentals</h2>
      <p>Learn how to add interactive features to websites.</p>
      <button>View Course</button>
    </article>
  </main>
</body>
</html>

Step 3: CSS Code

Add the following to style.css:

* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f3fa;
  color: #292333;
}
.header {
  background-color: #6c2bd9;
  color: white;
  text-align: center;
  padding: 40px 20px;
}
.header h1 {
  margin-top: 0;
  font-size: 32px;
}
.header p {
  line-height: 1.6;
}
.course-container {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
}
.course-card {
  background-color: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}
.course-card:hover {
  transform: translateY(-5px);
}
.course-card h2 {
  color: #6c2bd9;
  font-size: 22px;
}
.course-card p {
  line-height: 1.6;
}
.course-card button {
  background-color: #6c2bd9;
  color: white;
  padding: 12px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.course-card button:hover {
  background-color: #5420ad;
}
@media (max-width: 768px) {
  .course-container {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 520px) {
  .course-container {
    grid-template-columns: 1fr;
    margin-top: 25px;
  }
  .header h1 {
    font-size: 26px;
  }
}

Step 4: Run Your Project

1. Save both files.
2. Open index.html in your browser.
3. Check that all three course cards appear.
4. Move your mouse over a card to see its hover effect.
5. Reduce the browser width to see how the layout changes.

The buttons are currently visual elements. You can make them open course pages or perform other actions in a future lesson.



13. Lesson Summary

In this lesson, you learned how to combine CSS properties to design better webpages.

You practised:

* Styling colours and text.
* Controlling spacing with margin and padding.
* Creating cards and buttons.
* Arranging content with Flexbox and Grid.
* Adding hover effects.
* Making layouts responsive using media queries.

You also built a responsive course listing page using HTML and CSS.


    `

  },


  // frontend-lesson-5
  // CSS Positioning and Navigation Bars
  {
    id: "frontend-lesson-5",
    trackId: "track-frontend",
    title: "css positioning and navigation bars",
    description: "Learn how to position elements on a webpage and create navigation bars.",
    type: "lesson",
    duration: "15 minutes",
    published: true,
    content: `
    CSS POSITIONING AND NAVIGATION BARS



1. Introduction

In previous lessons, you learned how to use CSS to style webpages, change colours, control spacing, create cards, and arrange content using Flexbox and Grid.

However, designing a webpage involves more than changing colours and adding spacing. You also need to control where elements appear on the page.

CSS positioning allows you to control the placement of elements such as images, buttons, menus, and other webpage components.

In this lesson, you will learn how to position elements and create a navigation bar for a website.

Learning Objectives

By the end of this lesson, you should be able to:

* Explain what CSS positioning means.
* Identify the five common CSS position values.
* Use top, right, bottom, and left to position elements.
* Create a simple website navigation bar.
* Use Flexbox to arrange navigation links.
* Build a simple webpage with a navigation bar and content section.

2. What Is CSS Positioning?

CSS positioning is a technique used to control where an HTML element appears on a webpage.

For example, you may want to:

* Place a notification badge on an image.
* Keep a navigation bar at the top of the screen.
* Position a button inside a card.
* Display a small label over an image.

CSS provides five common values for the position property:

1. static
2. relative
3. absolute
4. fixed
5. sticky

Each value controls an element’s position differently.

3. Static Positioning

static is the default positioning of HTML elements.

Elements appear in the normal order of the webpage, one after another according to the document’s layout.

Example:

<h1>Welcome</h1>
<p>This is my first paragraph.</p>

CSS:

h1 {
  position: static;
}
p {
  position: static;
}

The heading appears before the paragraph because that is their order in the HTML.

With static positioning, properties such as top, right, bottom, and left do not reposition the element.

Remember: You do not usually need to write position: static because it is already the default.

4. Relative Positioning

The relative value allows you to move an element away from its normal position.

The element still keeps its original space in the webpage layout.

Example:

<div class="box">My Box</div>

CSS:

.box {
  width: 150px;
  height: 100px;
  background-color: purple;
  color: white;
  position: relative;
  top: 20px;
  left: 30px;
}

Explanation

* position: relative allows the element to be positioned relative to its normal location.
* top: 20px moves it 20 pixels downward.
* left: 30px moves it 30 pixels to the right.

The box moves, but the space it originally occupied remains reserved.

When is relative positioning useful?

It is useful when you want to adjust an element’s position slightly or establish a reference point for an absolutely positioned child.

5. Absolute Positioning

The absolute value allows you to position an element using the top, right, bottom, and left properties.

An absolutely positioned element is removed from the normal document flow. This means it no longer reserves its original space.

It is generally positioned relative to its nearest ancestor that establishes a positioning context, such as an ancestor with position: relative. If no such ancestor exists, it uses the initial containing block.

Example

HTML:

<div class="card">
  <span class="badge">NEW</span>
  <h2>HTML Fundamentals</h2>
  <p>Learn the basics of HTML.</p>
</div>

CSS:

.card {
  position: relative;
  width: 300px;
  padding: 25px;
  background-color: #f3e8ff;
  border-radius: 10px;
}
.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: purple;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
}

Explanation

The card has position: relative, which establishes a positioning context.

The badge has position: absolute, so its location is controlled relative to the card.

The badge appears near the top-right corner of the card.

Important: If you want to position a small element inside a container, setting the container to position: relative is often a useful starting point.

6. Fixed Positioning

The fixed value positions an element relative to the browser’s viewport in typical cases.

The element stays in the same viewport position as the user scrolls the page.

Example

HTML:

<button class="help-button">Help</button>

CSS:

.help-button {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background-color: purple;
  color: white;
  padding: 12px 18px;
  border: none;
  border-radius: 8px;
}

The button appears near the bottom-right corner of the screen.

When the user scrolls, the button remains in that position.

Where Is Fixed Positioning Used?

It can be used for:

* Floating help buttons.
* Chat buttons.
* Back-to-top buttons.
* Certain navigation bars.

Use fixed positioning carefully so that it does not cover important content, especially on mobile screens.

7. Sticky Positioning

The sticky value allows an element to behave normally until it reaches a specified position while scrolling. It can then remain stuck within the boundaries of its scrolling container.

Example

HTML:

<nav class="navigation">
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Courses</a>
</nav>

CSS:

.navigation {
  position: sticky;
  top: 0;
  background-color: purple;
  padding: 15px;
}

The navigation bar behaves normally until it reaches the top of the viewport. It can then remain at the top as the user scrolls.

For sticky positioning to work as expected, the element must have an appropriate inset value, such as top: 0, and its scrolling container must allow it to stick.

Fixed vs Sticky

Fixed	Sticky
Stays in a fixed viewport position.	Behaves normally before sticking.
Is removed from normal document flow.	Keeps its normal layout space.
Can remain visible while scrolling the page.	Sticks within the boundaries of its scrolling container.

8. Understanding the Z-Index Property

Sometimes two elements overlap. The z-index property helps control which positioned element appears in front of another.

Example:

.box-one {
  position: relative;
  z-index: 1;
}
.box-two {
  position: relative;
  z-index: 2;
}

When these elements overlap within the same stacking context, box-two will generally appear in front of box-one.

The z-index property does not work in the same way in every stacking context, so a higher number does not always place an element above every other element on the page.

9. What Is a Navigation Bar?

A navigation bar, often called a navbar, is a section of a webpage that contains links to important pages or sections of a website.

A typical navigation bar may contain:

* A website name or logo.
* A Home link.
* An About link.
* A Courses link.
* A Contact link.

For example, the CodeRise Academy website could have a navigation bar containing its name and links to Home, Free Learning, Video Courses, and Full Program.

A navigation bar helps users find their way around a website.

10. Creating a Navigation Bar with HTML

HTML provides the elements needed to create the structure of a navigation bar.

Example:

<header>
  <nav>
    <a href="#" class="logo">CodeRise Academy</a>
    <div class="nav-links">
      <a href="#">Home</a>
      <a href="#">About</a>
      <a href="#">Courses</a>
      <a href="#">Contact</a>
    </div>
  </nav>
</header>

Explanation

* <header> represents the introductory section of the page.
* <nav> identifies a section containing navigation links.
* The first <a> element represents the website name.
* The nav-links container groups the navigation links together.
* Each href specifies where a link should take the user.

The # character is a placeholder here. In a real website, replace it with the correct page URL or section ID.

11. Styling the Navigation Bar with CSS

The HTML provides the structure, while CSS controls the appearance.

Add this CSS:

* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: purple;
  padding: 18px 30px;
}
.logo {
  color: white;
  font-size: 22px;
  font-weight: bold;
  text-decoration: none;
}
.nav-links {
  display: flex;
  gap: 20px;
}
.nav-links a {
  color: white;
  text-decoration: none;
}
.nav-links a:hover {
  color: #e9d5ff;
}

Explanation

* display: flex places the logo and links in a flexible layout.
* justify-content: space-between pushes the logo and link group apart.
* align-items: center aligns them along the cross axis.
* padding creates space inside the navigation bar.
* gap: 20px separates the navigation links.
* text-decoration: none removes the default link underline.
* :hover changes the link colour when a mouse pointer moves over it.

You now have a basic horizontal navigation bar.

12. Making the Navigation Bar Responsive

A navigation bar that works on a laptop may become crowded on a small mobile screen.

For this beginner project, we will allow the links to wrap onto another line on smaller screens.

Add the following CSS to the end of your stylesheet:

@media (max-width: 600px) {
  nav {
    flex-wrap: wrap;
    gap: 15px;
    padding: 15px;
  }
  .nav-links {
    flex-wrap: wrap;
    gap: 12px;
  }
  .logo {
    font-size: 20px;
  }
}

Explanation

The media query applies these rules when the viewport is 600 pixels wide or narrower.

* flex-wrap: wrap allows items to move onto another line.
* A smaller padding value creates more available space.
* A smaller gap keeps the links from becoming too widely separated.

This is a simple responsive solution. Later, students can learn how to create a mobile menu with a toggle button and JavaScript.

13. Practical Project: Create a Simple Website Homepage

Now, combine your knowledge of CSS positioning and navigation bars to build a simple homepage.

Project Requirements

Your webpage must contain:

1. A navigation bar.
2. A website name.
3. At least four navigation links.
4. A welcome section.
5. A call-to-action button.
6. A fixed help button.
7. A responsive layout.

Step 1: Create Your Project Folder

Create a folder called my-homepage.

Inside the folder, create these two files:

* index.html
* style.css

Step 2: HTML Code

Add this code to index.html:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <nav>
      <a href="#" class="logo">My Website</a>
      <div class="nav-links">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#courses">Courses</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
  </header>
  <main>
    <section class="hero" id="home">
      <span class="badge">Welcome</span>
      <h1>Build Your Future with Technology</h1>
      <p>
        Learn new skills, practise what you learn,
        and build your first website.
      </p>
      <a href="#courses" class="button">Explore Courses</a>
    </section>
    <section class="content" id="about">
      <h2>About Us</h2>
      <p>We help learners develop useful digital skills.</p>
    </section>
    <section class="content" id="courses">
      <h2>Our Courses</h2>
      <p>Explore HTML, CSS, and other technology courses.</p>
    </section>
    <section class="content" id="contact">
      <h2>Contact Us</h2>
      <p>Get in touch to learn more about our programmes.</p>
    </section>
  </main>
  <button class="help-button">Help</button>
</body>
</html>

Step 3: CSS Code

Add this code to style.css:

* {
  box-sizing: border-box;
}
html {
  scroll-behavior: smooth;
}
body {
  margin: 0;
  font-family: Arial, sans-serif;
  color: #292333;
  background-color: #f8f7fc;
}
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  background-color: #6c2bd9;
  padding: 18px 30px;
}
.logo {
  color: white;
  font-size: 22px;
  font-weight: bold;
  text-decoration: none;
}
.nav-links {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.nav-links a {
  color: white;
  text-decoration: none;
}
.nav-links a:hover {
  color: #e9d5ff;
}
.hero {
  position: relative;
  max-width: 900px;
  margin: 50px auto;
  padding: 70px 25px;
  text-align: center;
  background-color: #eee5ff;
  border-radius: 15px;
}
.badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: #6c2bd9;
  color: white;
  padding: 7px 12px;
  border-radius: 5px;
}
.hero h1 {
  color: #5420ad;
  font-size: 38px;
}
.hero p {
  max-width: 550px;
  margin: 15px auto 25px;
  line-height: 1.7;
}
.button {
  display: inline-block;
  background-color: #6c2bd9;
  color: white;
  padding: 13px 20px;
  border-radius: 6px;
  text-decoration: none;
}
.button:hover {
  background-color: #5420ad;
}
.content {
  max-width: 900px;
  margin: 25px auto;
  padding: 30px;
  background-color: white;
  border-radius: 10px;
}
.help-button {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background-color: #6c2bd9;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
}
@media (max-width: 600px) {
  nav {
    flex-direction: column;
    align-items: flex-start;
    padding: 18px;
  }
  .nav-links {
    gap: 12px;
  }
  .hero {
    margin: 20px 15px;
    padding: 65px 20px 40px;
  }
  .hero h1 {
    font-size: 28px;
  }
  .content {
    margin: 20px 15px;
    padding: 20px;
  }
}

Step 4: Run Your Project

1. Save both files.
2. Open index.html in your browser.
3. Check that the navigation bar appears at the top.
4. Click each navigation link to see whether it moves to the correct section.
5. Scroll down the page and observe the Help button.
6. Resize the browser to check the mobile layout.

The Help button is currently only a visual element. JavaScript can be used in a later lesson to make it perform an action.


16. Lesson Summary

In this lesson, you learned how to control the position of elements using CSS. You explored static, relative, absolute, fixed, and sticky positioning, as well as the z-index property.

You also learned how to create and style a navigation bar, arrange links with Flexbox, and make a webpage responsive.

Finally, you applied these skills by building a simple website homepage.

What Comes Next?

You have now covered the essential HTML and CSS foundations needed to begin learning JavaScript.

Next Module: Introduction to JavaScript

    `


  },


  // frontend-lesson-6
  // introduction to javascript
{
    id: "frontend-lesson-6",
    trackId: "track-frontend",
    title: "Introduction to JavaScript",
    description: "Learn the basics of JavaScript, a programming language that adds interactivity to websites.",
    type: "lesson",
    duration: "15 minutes",
    published: true,
    content: `
    

1. What Is JavaScript?

JavaScript is a programming language used to make websites interactive and responsive to user actions.

HTML provides the structure of a webpage, CSS controls its appearance, and JavaScript makes it possible for the webpage to perform actions.

For example:

* HTML creates a button.
* CSS gives the button colour and style.
* JavaScript makes the button display a message when clicked.

JavaScript can also be used to create image sliders, interactive menus, calculators, quizzes, games, and form validation.

2. Why Do We Need JavaScript?

Without JavaScript, a webpage can still display text, images, links, and styled content. However, JavaScript allows developers to create more interactive experiences.

JavaScript can be used to:

1. Display messages when users click buttons.
2. Perform calculations.
3. Check information entered into forms.
4. Show and hide webpage content.
5. Create interactive games and quizzes.
6. Update webpage content without reloading the entire page.
7. Build interactive applications.

Example: Imagine creating a button labelled Click Me. When a user clicks it, a message appears on the screen. JavaScript makes this possible.

3. How JavaScript Works with HTML and CSS

The three main frontend technologies work together.

Technology	Main Purpose	Example
HTML	Structure	Creates a button
CSS	Styling	Makes the button purple
JavaScript	Interactivity	Displays a message when the button is clicked

Consider this example:

<button>Click Me</button>

The code creates a button, but it does not define any special action when the button is clicked.

JavaScript can add that action:

<button onclick="alert('Welcome to CodeRise Academy!')">
  Click Me
</button>

When the user clicks the button, a message appears.

The onclick attribute tells the browser to run JavaScript when the button is clicked. Although this example is useful for learning, larger projects commonly use JavaScript event listeners instead.

4. How to Add JavaScript to an HTML Page

There are three common ways to add JavaScript to a webpage.

A. Inline JavaScript

Inline JavaScript is written directly inside an HTML element using an event attribute.

Example:

<button onclick="alert('Hello Student!')">
  Click Me
</button>

When the button is clicked, the browser displays an alert message.

Inline JavaScript is useful for understanding basic examples, but it is generally better to separate JavaScript from HTML as projects grow.

B. Internal JavaScript

Internal JavaScript is written inside a <script> element in an HTML document.

Example:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My JavaScript Page</title>
</head>
<body>
  <h1>Welcome to JavaScript</h1>
  <script>
    alert("Welcome to CodeRise Academy!");
  </script>
</body>
</html>

When the browser runs this page, an alert message appears.

C. External JavaScript

External JavaScript is written in a separate file, usually with the .js extension.

For example, create two files:

index.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JavaScript Introduction</title>
</head>
<body>
  <h1>My First JavaScript Page</h1>
  <button id="welcomeButton">Click Me</button>
  <script src="script.js"></script>
</body>
</html>

script.js

document.getElementById("welcomeButton").addEventListener("click", function() {
  alert("Welcome to CodeRise Academy!");
});

When the button is clicked, JavaScript displays the welcome message.

Explanation:

* document represents the webpage.
* getElementById() finds an HTML element using its ID.
* "welcomeButton" is the ID of the button.
* addEventListener() listens for a particular event.
* "click" specifies the event to listen for.
* alert() displays a message in a browser dialog.

External JavaScript is a good approach for organising code in real projects.

5. JavaScript Statements

A JavaScript statement is an instruction that tells the browser or JavaScript engine to perform an action.

Example:

alert("Hello World!");

This statement instructs JavaScript to display an alert message.

Another example:

console.log("I am learning JavaScript");

This displays a message in the browser’s developer console.

The console is useful when testing code and checking information while developing a website.

6. Displaying Information with JavaScript

JavaScript provides different ways to display information.

Using alert()

alert("Welcome to CodeRise Academy!");

This displays a message in a browser dialog.

Using console.log()

console.log("My name is a frontend developer.");

This displays information in the browser’s developer console.

Changing HTML Content

JavaScript can change what is displayed on a webpage.

Example:

<h2 id="message">Hello Student</h2>
<script>
  document.getElementById("message").textContent = "Welcome to JavaScript!";
</script>

The heading changes from Hello Student to Welcome to JavaScript!

The textContent property changes the text inside the selected HTML element.

7. JavaScript Variables

A variable is a named place used to store information that a program can use.

For example, a student may have a name, age, and course. JavaScript variables can store these values.

Example:

let studentName = "David";
let age = 15;
let course = "Frontend Development";

In this example:

* studentName stores "David".
* age stores 15.
* course stores "Frontend Development".

The let Keyword

Use let when declaring a variable whose value may change.

Example:

let score = 10;
score = 20;
console.log(score);

Output:

20

The value changes from 10 to 20.

The const Keyword

Use const when a variable should not be reassigned.

Example:

const academyName = "CodeRise Academy";
console.log(academyName);

Output:

CodeRise Academy

You cannot reassign a new value to a const variable.

The var Keyword

var is an older way to declare variables. Beginners should generally start with let and const because they provide clearer rules for variable scope.

8. JavaScript Data Types

A data type describes the kind of information stored in a value.

A. String

A string is text enclosed in quotation marks.

let studentName = "David";

Here, "David" is a string.

B. Number

A number represents a numerical value.

let age = 15;
let price = 2500;

Both values are numbers.

C. Boolean

A Boolean represents either true or false.

let isStudent = true;
let hasSubmittedProject = false;

These values can help a program make decisions.

D. Undefined

A variable declared without an assigned value has the value undefined.

let studentScore;
console.log(studentScore);

Output:

undefined

E. Null

null represents an intentionally empty value.

let selectedCourse = null;

This indicates that no course has been selected yet.

9. JavaScript Operators

Operators are symbols used to perform calculations, comparisons, and other operations.

Arithmetic Operators

These operators perform mathematical calculations.

Operator	Meaning	Example	Result
+	Addition	5 + 3	8
-	Subtraction	5 - 3	2
*	Multiplication	5 * 3	15
/	Division	6 / 3	2
%	Remainder	7 % 3	1

Example:

let firstNumber = 10;
let secondNumber = 5;
console.log(firstNumber + secondNumber);

Output:

15

Comparison Operators

Comparison operators compare values and return a Boolean result.

Operator	Meaning	Example	Result
>	Greater than	10 > 5	true
<	Less than	3 < 8	true
===	Strict equality	5 === 5	true
!==	Strict inequality	5 !== 3	true
>=	Greater than or equal to	5 >= 5	true
<=	Less than or equal to	3 <= 5	true

Example:

let score = 80;
console.log(score >= 50);

Output:

true

The expression is true because 80 is greater than or equal to 50.

10. JavaScript Functions

A function is a reusable block of code designed to perform a particular task.

Instead of writing the same instructions repeatedly, you can put them inside a function and call that function whenever needed.

Example:

function greetStudent() {
  console.log("Welcome to CodeRise Academy!");
}
greetStudent();

Output:

Welcome to CodeRise Academy!

Understanding the Code

* function declares a function.
* greetStudent is the function’s name.
* The curly braces contain the instructions.
* greetStudent() calls the function and runs its instructions.

Functions become particularly useful when building interactive websites, calculators, games, and quizzes.

11. JavaScript Events

An event is something that happens in a webpage, such as a button click or a key press.

JavaScript can respond to these events.

Common events include:

Event	Meaning
click	The user clicks an element
input	The value of an input field changes
change	A control’s value is changed and committed
submit	A form is submitted
mouseover	The pointer moves over an element

Example:

<button id="greetButton">Greet Me</button>
<script>
  document.getElementById("greetButton").addEventListener("click", function() {
    alert("Hello! Keep learning.");
  });
</script>

When the button is clicked, the message appears.

This is an example of JavaScript making a webpage interactive.

12. Comments in JavaScript

Comments are notes written in code for developers to read. JavaScript ignores them when executing the program.

Single-Line Comment

Use // to write a single-line comment.

// This displays a welcome message
console.log("Welcome!");

Multi-Line Comment

Use /* and */ to write a comment across multiple lines.

/*
This is a multi-line comment.
It explains what the code does.
*/
console.log("Learning JavaScript");

Comments help developers understand and maintain their code.

13. Practical Project: Interactive Welcome Page

In this project, students will create a webpage with a button. When the button is clicked, the webpage will display a welcome message.

Project Folder

Create a folder called javascript-welcome-page.

Inside it, create these files:

javascript-welcome-page/
├── index.html
└── script.js

Step 1: Write the HTML

Open index.html and write:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First JavaScript Project</title>
</head>
<body>
  <h1>Welcome to My Website</h1>
  <p id="welcomeMessage">Click the button to receive a message.</p>
  <button id="welcomeButton">Click Me</button>
  <script src="script.js"></script>
</body>
</html>

Step 2: Write the JavaScript

Open script.js and write:

const button = document.getElementById("welcomeButton");
const message = document.getElementById("welcomeMessage");
button.addEventListener("click", function() {
  message.textContent = "Welcome to CodeRise Academy! Keep learning.";
});

Step 3: Run the Project

1. Save both files.
2. Open index.html in a web browser.
3. Find the button labelled Click Me.
4. Click the button.
5. Observe the message displayed on the page.

What Have You Learned?

In this project, you have learned how to:

* Connect an external JavaScript file to HTML.
* Select HTML elements using their IDs.
* Listen for a button click.
* Change webpage text using JavaScript.

Project Challenge: Change the button text to Show My Name and make it display your name when clicked.

⸻


15. Lesson Summary

In this lesson, you learned that JavaScript is a programming language used to make webpages interactive.

You learned about:

* The relationship between HTML, CSS, and JavaScript.
* Inline, internal, and external JavaScript.
* JavaScript statements and output.
* Variables and data types.
* Arithmetic and comparison operators.
* Functions and events.
* Comments.
* Creating an interactive welcome page.

Next Lesson: JavaScript Variables, Data Types, and Operators

In the next lesson, students will study these concepts in greater detail and practise using them to solve simple programming problems.
    
    `

},


// frontend-lesson-7
// JavaScript Variables, Data Types, and Operators

{
  id: "frontend-lesson-7",
  trackId: "track-frontend",
  title: "JavaScript Variables, Data Types, and Operators",
  description: "Learn how to use variables, data types, and operators in JavaScript to store and manipulate information.",
  type: "lesson",
  duration: "15 minutes",
  published: true,
  content: `
  JavaScript Variables, Data Types, and Operators



1. Introduction

JavaScript variables, data types, and operators are important concepts every beginner must understand.

Variables allow us to store information, data types describe the kind of information we are working with, and operators help us perform calculations and compare values.

For example, a website may use JavaScript to store a student’s name, calculate their score, and determine whether they passed an examination.

let studentName = "David";
let score = 85;
let passed = true;
console.log(studentName);
console.log(score);
console.log(passed);

Output:

David
85
true

In this lesson, you will learn how to create variables, identify data types, and use operators in JavaScript.

2. What Is a Variable?

A variable is a named container used to store information that a program can use later.

Think of a variable as a labelled box. The label tells you what is inside the box.

For example:

let name = "David";

In this example:

* let tells JavaScript that we are declaring a variable.
* name is the variable’s name.
* = assigns a value to the variable.
* "David" is the value stored in the variable.

You can use the variable whenever you need its value.

let name = "David";
console.log(name);

Output:

David

2.1 Declaring Variables

JavaScript provides three keywords for declaring variables:

* let
* const
* var

A. The let Keyword

Use let when you expect a variable’s value to change.

let age = 15;
console.log(age);
age = 16;
console.log(age);

Output:

15
16

The value changes from 15 to 16.

Notice that we did not write let again when updating the variable.

B. The const Keyword

Use const when a variable should not be reassigned to a different value.

const schoolName = "CodeRise Academy";
console.log(schoolName);

Output:

CodeRise Academy

If you try to reassign the variable, JavaScript will produce an error.

const schoolName = "CodeRise Academy";
schoolName = "Another School";

This produces an error because a variable declared with const cannot be reassigned.

Important: A const variable must be given an initial value when it is declared.

C. The var Keyword

var is an older way of declaring variables.

var country = "Nigeria";
console.log(country);

Output:

Nigeria

Although var still works, beginners should generally use let and const because their behaviour is easier to manage in modern JavaScript.

2.2 Difference Between let, const, and var

Keyword	Can the variable be reassigned?	Recommended use
let	Yes	Values that may change
const	No	Values that should not be reassigned
var	Yes	Older JavaScript code

Example:

let score = 50;
score = 70;
const subject = "JavaScript";
console.log(score);
console.log(subject);

Output:

70
JavaScript

2.3 Rules for Naming Variables

JavaScript has rules for naming variables.

Rule 1: A variable name must not begin with a number.

Incorrect:

let 2students = 20;

Correct:

let students2 = 20;

Rule 2: Do not use spaces in variable names.

Incorrect:

let student name = "David";

Correct:

let studentName = "David";

Rule 3: Variable names are case-sensitive.

let age = 15;
let Age = 20;
console.log(age);
console.log(Age);

Output:

15
20

JavaScript treats age and Age as two different variables.

Rule 4: Do not use JavaScript reserved keywords as variable names.

For example, words such as let, const, and if already have special meanings in JavaScript.

Rule 5: Use meaningful variable names.

Less clear:

let x = "David";

Clearer:

let studentName = "David";

Meaningful names make your code easier to understand.

⸻

3. What Are Data Types?

A data type describes the kind of value stored in a variable.

For example, a person’s name is text, their age is a number, and their answer to a yes-or-no question may be a Boolean value.

JavaScript has several data types. This lesson focuses on the basic types you will use most often as a beginner.

3.1 String

A string is text enclosed in quotation marks.

You can use single quotes or double quotes.

let firstName = "David";
let country = 'Nigeria';
console.log(firstName);
console.log(country);

Output:

David
Nigeria

Strings can contain letters, numbers, spaces, and symbols.

let message = "Welcome to CodeRise Academy!";

Although "25" looks like a number, JavaScript treats it as a string because it is enclosed in quotation marks.

let age = "25";
console.log(typeof age);

Output:

string

3.2 Number

The number data type represents numeric values.

It can be used for whole numbers and decimal numbers.

let age = 16;
let price = 2500;
let temperature = 32.5;
console.log(age);
console.log(price);
console.log(temperature);

Output:

16
2500
32.5

Numbers can be used in calculations.

let firstNumber = 10;
let secondNumber = 5;
console.log(firstNumber + secondNumber);

Output:

15

3.3 Boolean

A Boolean has only two possible values:

* true
* false

Boolean values are useful when making decisions.

let isStudent = true;
let isAbsent = false;
console.log(isStudent);
console.log(isAbsent);

Output:

true
false

For example, a website might use a Boolean value to determine whether a student has completed a lesson.

let lessonCompleted = true;
console.log(lessonCompleted);

3.4 Undefined

A variable has the value undefined when it has been declared but has not been assigned a value.

let studentName;
console.log(studentName);

Output:

undefined

The variable exists, but no value has been assigned to it.

3.5 Null

null represents an intentional absence of a value.

let selectedCourse = null;
console.log(selectedCourse);

Output:

null

This could mean that a student has not selected a course yet.

Difference Between undefined and null

* undefined: A variable has not been given a value.
* null: A value has deliberately been set to indicate that nothing is currently assigned.

Example:

let studentName;
let selectedCourse = null;
console.log(studentName);
console.log(selectedCourse);

Output:

undefined
null

3.6 Checking Data Types with typeof

JavaScript provides the typeof operator to check the type of a value.

let name = "David";
let age = 16;
let isStudent = true;
console.log(typeof name);
console.log(typeof age);
console.log(typeof isStudent);

Output:

string
number
boolean

You can also check other values:

console.log(typeof "Hello");
console.log(typeof 100);
console.log(typeof false);
console.log(typeof undefined);

Output:

string
number
boolean
undefined

Note: JavaScript has a historical behaviour where typeof null returns "object". Although this is unusual, it is normal JavaScript behaviour.

⸻

4. What Are Operators?

Operators are symbols that tell JavaScript to perform an operation on one or more values.

For example, the + operator adds numbers, while the > operator checks whether one number is greater than another.

JavaScript has different categories of operators.

In this lesson, we will study:

1. Arithmetic operators
2. Assignment operators
3. Comparison operators
4. Logical operators

5. Arithmetic Operators

Arithmetic operators are used to perform mathematical calculations.

Operator	Name	Example	Result
+	Addition	10 + 5	15
-	Subtraction	10 - 5	5
*	Multiplication	10 * 5	50
/	Division	10 / 5	2
%	Remainder	10 % 3	1
**	Exponentiation	2 ** 3	8

5.1 Addition

The addition operator adds two values.

let a = 10;
let b = 5;
console.log(a + b);

Output:

15

5.2 Subtraction

The subtraction operator finds the difference between values.

let a = 20;
let b = 8;
console.log(a - b);

Output:

12

5.3 Multiplication

The multiplication operator multiplies values.

let price = 500;
let quantity = 3;
console.log(price * quantity);

Output:

1500

This could represent the total cost of three items costing ₦500 each.

5.4 Division

The division operator divides one value by another.

let totalMarks = 180;
let numberOfSubjects = 3;
console.log(totalMarks / numberOfSubjects);

Output:

60

5.5 Remainder Operator

The % operator returns the remainder after division.

console.log(10 % 3);

Output:

1

This is because 3 goes into 10 three times, leaving a remainder of 1.

The remainder operator can help you determine whether a number is even or odd.

let number = 8;
console.log(number % 2);

Output:

0

If a number divided by 2 has a remainder of 0, it is even.

5.6 Exponentiation

The ** operator raises a number to a power.

console.log(2 ** 3);

Output:

8

This means 2 × 2 × 2 = 8.

⸻

6. Assignment Operators

Assignment operators assign values to variables or update their existing values.

6.1 The Basic Assignment Operator

The = operator assigns a value to a variable.

let score = 50;
console.log(score);

Output:

50

Remember that = assigns a value. It does not check whether two values are equal.

6.2 Addition Assignment

The += operator adds a value to the current variable value.

let score = 50;
score += 10;
console.log(score);

Output:

60

This is equivalent to:

score = score + 10;

6.3 Other Assignment Operators

Operator	Example	Equivalent operation
+=	score += 5	score = score + 5
-=	score -= 5	score = score - 5
*=	score *= 2	score = score * 2
/=	score /= 2	score = score / 2

Example:

let number = 20;
number -= 5;
console.log(number);

Output:

15

The value decreases from 20 to 15.

⸻

7. Comparison Operators

Comparison operators compare two values. The result is usually a Boolean value: true or false.

Operator	Meaning	Example	Result
===	Strictly equal	5 === 5	true
!==	Strictly not equal	5 !== 3	true
>	Greater than	10 > 5	true
<	Less than	3 < 8	true
>=	Greater than or equal to	5 >= 5	true
<=	Less than or equal to	4 <= 6	true

7.1 Checking Equality

Use === to check whether two values are equal in both value and data type.

console.log(10 === 10);
console.log(10 === 5);
console.log(10 === "10");

Output:

true
false
false

The last result is false because the first value is a number, while the second is a string.

7.2 Checking Whether Values Are Different

The !== operator checks whether two values are not strictly equal.

console.log(10 !== 5);

Output:

true

7.3 Greater Than and Less Than

let age = 18;
console.log(age > 15);
console.log(age < 15);

Output:

true
false

The first result is true because 18 is greater than 15.

The second result is false because 18 is not less than 15.

Important: Beginners should generally use === and !== instead of == and !=, because strict comparisons avoid unexpected type conversions.

⸻

8. Logical Operators

Logical operators combine or reverse conditions. They are useful when a program needs to make decisions based on multiple requirements.

The three main logical operators are:

* && — AND
* || — OR
* ! — NOT

8.1 The AND Operator (&&)

The AND operator returns true when both conditions are true.

let age = 20;
let hasRegistered = true;
console.log(age >= 18 && hasRegistered === true);

Output:

true

Both conditions are true:

* The person’s age is at least 18.
* The person has registered.

If either condition is false, the entire expression evaluates to false.

8.2 The OR Operator (||)

The OR operator returns true when at least one condition is true.

let hasEmail = true;
let hasPhoneNumber = false;
console.log(hasEmail || hasPhoneNumber);

Output:

true

The result is true because at least one condition is true.

8.3 The NOT Operator (!)

The NOT operator reverses a Boolean value.

let isAbsent = false;
console.log(!isAbsent);

Output:

true

The original value was false. Using ! reverses it to true.

⸻

9. Combining Variables, Data Types, and Operators

You can combine these concepts to build useful JavaScript programs.

Consider a student who scores marks in three subjects.

let htmlScore = 80;
let cssScore = 75;
let javascriptScore = 90;
let totalScore = htmlScore + cssScore + javascriptScore;
let averageScore = totalScore / 3;
console.log("Total Score:", totalScore);
console.log("Average Score:", averageScore);

Output:

Total Score: 245
Average Score: 81.66666666666667

The program uses:

* Variables to store the marks.
* Arithmetic operators to calculate the total and average.
* Strings to display labels in the output.

You can also use a comparison operator to check whether the student reached a target score.

let averageScore = 81.67;
console.log(averageScore >= 50);

Output:

true

The result is true because the average score is greater than or equal to 50.

⸻

10. Common Mistakes to Avoid

Mistake 1: Using a variable before declaring it

Incorrect:

console.log(studentName);
let studentName = "David";

This produces an error because the variable is accessed before its declaration.

Correct:

let studentName = "David";
console.log(studentName);

Mistake 2: Forgetting quotation marks around text

Incorrect:

let name = David;

JavaScript will treat David as an identifier rather than a string.

Correct:

let name = "David";

Mistake 3: Reassigning a const variable

Incorrect:

const score = 50;
score = 80;

Correct:

let score = 50;
score = 80;
console.log(score);

Use let when you need to reassign the variable.

Mistake 4: Confusing assignment with comparison

let score = 80;

Here, = assigns a value.

console.log(score === 80);

Here, === checks whether the value is strictly equal to 80.

Mistake 5: Confusing numbers with strings

console.log(5 + 5);
console.log("5" + "5");

Output:

10
55

The first statement adds two numbers. The second joins two strings together.

⸻

11. Practical Project: Student Score Calculator

Build a simple JavaScript program that stores a student’s marks, calculates the total and average, and checks whether the student has passed.

Step 1: Create the Variables

let studentName = "David";
let htmlScore = 70;
let cssScore = 80;
let javascriptScore = 90;

Step 2: Calculate the Total

let totalScore = htmlScore + cssScore + javascriptScore;

Step 3: Calculate the Average

let averageScore = totalScore / 3;

Step 4: Check the Result

Assume the student passes when the average score is at least 50.

let hasPassed = averageScore >= 50;

Step 5: Display the Results

console.log("Student:", studentName);
console.log("Total Score:", totalScore);
console.log("Average Score:", averageScore);
console.log("Passed:", hasPassed);

Complete Code

let studentName = "David";
let htmlScore = 70;
let cssScore = 80;
let javascriptScore = 90;
let totalScore = htmlScore + cssScore + javascriptScore;
let averageScore = totalScore / 3;
let hasPassed = averageScore >= 50;
console.log("Student:", studentName);
console.log("Total Score:", totalScore);
console.log("Average Score:", averageScore);
console.log("Passed:", hasPassed);

Expected Output:

Student: David
Total Score: 240
Average Score: 80
Passed: true

Try changing the student’s name and marks. Run the code again and observe how the output changes.

⸻


Conclusion

Variables allow JavaScript to store information. Data types describe the kind of information being stored, while operators allow JavaScript to calculate values, compare information, and evaluate conditions.

Understanding these concepts will help you write more useful JavaScript programs and prepare you for the next topics in your frontend development journey.
  
  `

},




// frontend-lesson-8
// JavaScript condition, loops and functions
{
  id: "frontend-lesson-8",
  trackId: "track-frontend",
  title: "JavaScript condition, loops and functions",
  description: "Learn how to use conditionals, loops, and functions in JavaScript to control the flow of your programs and create reusable code.",
  type: "lesson",
  duration: "15 minutes",
  published: true,
  content: `
  JavaScript Conditions, Loops, and Functions

CodeRise Academy — Beginner Level

1. Introduction

JavaScript allows websites to do more than display information. It can make decisions, repeat tasks, and organise instructions into reusable blocks of code.

For example:

* Conditions allow a program to decide whether a student has passed or failed an examination.
* Loops allow a program to repeat an instruction several times.
* Functions allow a program to organise instructions that can be used whenever they are needed.

These three concepts are important because they help developers write useful programs without repeating the same code unnecessarily.

By the end of this lesson, you should understand how to use conditions, loops, and functions to build simple JavaScript programs.

⸻

PART ONE: JAVASCRIPT CONDITIONS

2. What Are Conditions?

Conditions allow JavaScript to make decisions based on whether something is true or false.

Think about a school examination. If a student scores 50 marks or more, the student passes. If the student scores below 50, the student fails.

JavaScript can use conditions to make this decision automatically.

For example:

let score = 75;
if (score >= 50) {
    console.log("You passed!");
}

Output:

You passed!

In this example:

* let score = 75 stores the student’s score.
* if tells JavaScript to check a condition.
* score >= 50 checks whether the score is at least 50.
* console.log() displays the message when the condition is true.

Because the student’s score is 75, the condition is true, and the message appears.

3. The if Statement

The if statement executes a block of code only when a condition is true.

Syntax

if (condition) {
    // Code to execute if the condition is true
}

The condition is written inside parentheses. The code that should run is placed inside curly braces.

Example

let age = 20;
if (age >= 18) {
    console.log("You are an adult.");
}

Output:

You are an adult.

If the age were 15, the condition would be false, so the message would not appear.

4. The if...else Statement

Sometimes a program needs to choose between two possible actions.

The if...else statement allows JavaScript to execute one block of code when a condition is true and another block when it is false.

Example

let score = 40;
if (score >= 50) {
    console.log("You passed!");
} else {
    console.log("You failed.");
}

Output:

You failed.

The score is below 50, so JavaScript executes the else block.

The else statement does not need a separate condition. It runs when the if condition is false.

5. The if...else if...else Statement

Sometimes a program needs to check several conditions.

For example, a school may use different grades for examination results.

Score	Grade
80–100	A
70–79	B
60–69	C
50–59	D
Below 50	F

JavaScript can use if...else if...else to assign these grades.

Example

let score = 75;
if (score >= 80) {
    console.log("Grade A");
} else if (score >= 70) {
    console.log("Grade B");
} else if (score >= 60) {
    console.log("Grade C");
} else if (score >= 50) {
    console.log("Grade D");
} else {
    console.log("Grade F");
}

Output:

Grade B

JavaScript checks the conditions from top to bottom.

Since 75 is not at least 80 but is at least 70, JavaScript displays Grade B and skips the remaining conditions.

Important: Arrange conditions carefully. If you check score >= 50 first, a score of 85 will match that condition, and the program may display the wrong grade.

6. The switch Statement

The switch statement is useful when you want to compare one value against several possible options.

For example, a website might display a message based on the day selected.

let day = "Monday";
switch (day) {
    case "Monday":
        console.log("Start of the working week.");
        break;
    case "Friday":
        console.log("The weekend is near.");
        break;
    case "Sunday":
        console.log("Enjoy your rest.");
        break;
    default:
        console.log("Have a great day!");
}

Output:

Start of the working week.

Understanding the Code

* switch (day) tells JavaScript which value to check.
* case defines a possible matching value.
* break stops the switch statement from continuing into the next case.
* default runs when none of the cases match.

The default section is optional, but it is useful when you want to handle unexpected values.

7. The Ternary Operator

The ternary operator provides a shorter way to write a simple if...else decision.

Example Using if...else

let age = 20;
let message;
if (age >= 18) {
    message = "You can register.";
} else {
    message = "You are too young to register.";
}
console.log(message);

The Same Example Using the Ternary Operator

let age = 20;
let message = age >= 18
    ? "You can register."
    : "You are too young to register.";
console.log(message);

Output:

You can register.

The ternary operator uses three parts:

1. The condition.
2. The value to use if the condition is true, after ?.
3. The value to use if the condition is false, after :.

Use it for simple decisions. For more complicated decisions, if...else is often easier to read.

⸻

PART TWO: JAVASCRIPT LOOPS

8. What Are Loops?

A loop allows JavaScript to repeat a block of code.

Imagine that you want to display the numbers from 1 to 5.

Without a loop, you might write:

console.log(1);
console.log(2);
console.log(3);
console.log(4);
console.log(5);

This works, but imagine displaying 1,000 numbers. Writing every instruction separately would be inefficient.

A loop allows you to repeat the instruction automatically.

for (let i = 1; i <= 5; i++) {
    console.log(i);
}

Output:

1
2
3
4
5

JavaScript repeats the instruction until the loop’s condition is no longer true.

9. The for Loop

The for loop is useful when you know how many times you want to repeat an instruction or can define a clear counting condition.

Syntax

for (initialization; condition; update) {
    // Code to repeat
}

A for loop has three main parts.

1. Initialization

This sets up the starting value.

let i = 1;

2. Condition

This determines whether the loop should continue.

i <= 5;

3. Update

This changes the counter after each repetition.

i++;

The i++ expression increases i by 1.

Complete Example

for (let i = 1; i <= 5; i++) {
    console.log("Welcome to CodeRise Academy!");
}

Output:

Welcome to CodeRise Academy!
Welcome to CodeRise Academy!
Welcome to CodeRise Academy!
Welcome to CodeRise Academy!
Welcome to CodeRise Academy!

The message appears five times because the loop runs five times.

Counting Backwards

A for loop can also count backwards.

for (let i = 5; i >= 1; i--) {
    console.log(i);
}

Output:

5
4
3
2
1

The i-- expression decreases the counter by 1.

10. The while Loop

A while loop repeats a block of code as long as its condition remains true.

It is useful when you want to repeat an action until a particular condition changes.

Syntax

while (condition) {
    // Code to repeat
}

Example

let number = 1;
while (number <= 5) {
    console.log(number);
    number++;
}

Output:

1
2
3
4
5

How It Works

1. JavaScript starts with number = 1.
2. It checks whether number <= 5.
3. If the condition is true, it displays the number.
4. The number++ statement increases the number by 1.
5. JavaScript checks the condition again.
6. The loop stops when the number becomes 6.

Important: Make sure the condition can eventually become false. Otherwise, you may create an infinite loop that continues running and makes your program unresponsive.

For example, forgetting number++ in the example above would cause the loop to keep displaying 1.

11. The do...while Loop

The do...while loop is similar to the while loop, but it executes the code block at least once before checking the condition.

Example

let number = 1;
do {
    console.log(number);
    number++;
} while (number <= 5);

Output:

1
2
3
4
5

Difference Between while and do...while

A while loop checks the condition before running its code.

A do...while loop runs the code first and checks the condition afterwards.

Consider this example:

let number = 10;
while (number < 5) {
    console.log("Hello");
}

Nothing appears because the condition is false from the beginning.

Now consider:

let number = 10;
do {
    console.log("Hello");
} while (number < 5);

Output:

Hello

The message appears once because a do...while loop always executes its code block at least once.

12. The break Statement

The break statement stops a loop immediately.

Example

for (let i = 1; i <= 10; i++) {
    if (i === 5) {
        break;
    }
    console.log(i);
}

Output:

1
2
3
4

When i becomes 5, the break statement stops the loop. The number 5 is not displayed.

13. The continue Statement

The continue statement skips the current repetition and moves to the next one.

Example

for (let i = 1; i <= 5; i++) {
    if (i === 3) {
        continue;
    }
    console.log(i);
}

Output:

1
2
4
5

When i is 3, JavaScript skips the console.log() instruction for that repetition and continues with 4.

Difference Between break and continue

* break stops the entire loop.
* continue skips the current repetition but allows the loop to continue.

⸻

PART THREE: JAVASCRIPT FUNCTIONS

14. What Is a Function?

A function is a reusable block of code designed to perform a particular task.

For example, if you want to display a welcome message in several places on a website, you can create one function and call it whenever you need it.

Without a function, you might repeat the same code:

console.log("Welcome to CodeRise Academy!");
console.log("Welcome to CodeRise Academy!");
console.log("Welcome to CodeRise Academy!");

Using a function makes the code easier to reuse.

function welcomeMessage() {
    console.log("Welcome to CodeRise Academy!");
}
welcomeMessage();
welcomeMessage();
welcomeMessage();

Output:

Welcome to CodeRise Academy!
Welcome to CodeRise Academy!
Welcome to CodeRise Academy!

The function is written once but called three times.

15. Declaring and Calling a Function

Creating a function is called function declaration. Using the function is called calling the function.

Function Declaration

function greet() {
    console.log("Hello!");
}

This creates a function named greet.

However, the message will not appear until the function is called.

Calling the Function

greet();

Output:

Hello!

The parentheses () tell JavaScript to call the function.

Complete Example

function greet() {
    console.log("Hello! Welcome to JavaScript.");
}
greet();

Output:

Hello! Welcome to JavaScript.

16. Functions with Parameters

A parameter is a variable listed inside a function’s parentheses. It allows the function to receive information when it is called.

For example, a greeting function can receive a person’s name.

function greet(name) {
    console.log("Hello, " + name);
}
greet("David");
greet("Sarah");

Output:

Hello, David
Hello, Sarah

In this example:

* name is the parameter.
* "David" and "Sarah" are arguments supplied when calling the function.
* The function uses the supplied value to create the message.

Another Example

function addNumbers(a, b) {
    console.log(a + b);
}
addNumbers(5, 3);
addNumbers(10, 20);

Output:

8
30

The function receives two values and adds them together.

17. Functions with the return Statement

The return statement sends a result back from a function to the code that called it.

Consider this example:

function addNumbers(a, b) {
    return a + b;
}
let result = addNumbers(5, 3);
console.log(result);

Output:

8

The function calculates the sum and returns it. The returned value is then stored in the result variable.

Difference Between console.log() and return

console.log() displays information in the console.

return sends a value back to the code that called the function.

For example:

function multiply(a, b) {
    return a * b;
}
let answer = multiply(4, 5);
let finalAnswer = answer + 10;
console.log(finalAnswer);

Output:

30

The function returns 20. JavaScript then adds 10 to the returned value.

A function that uses return can be useful when you need to reuse its result in another calculation.

18. Functions with Conditions

Functions can contain conditions to make decisions.

Example: Checking Whether a Student Passed

function checkResult(score) {
    if (score >= 50) {
        return "You passed!";
    } else {
        return "You failed.";
    }
}
console.log(checkResult(75));
console.log(checkResult(40));

Output:

You passed!
You failed.

The function receives a score and returns the appropriate message.

This example combines two concepts:

* Functions receive information and perform a task.
* Conditions allow the function to make a decision.

19. Function Expressions

A function can also be stored in a variable. This is called a function expression.

const greet = function() {
    console.log("Hello from CodeRise Academy!");
};
greet();

Output:

Hello from CodeRise Academy!

Here, the function is assigned to the greet variable and called using greet().

20. Arrow Functions

Arrow functions provide a shorter way to write many function expressions.

They use the => symbol.

Regular Function Expression

const addNumbers = function(a, b) {
    return a + b;
};
console.log(addNumbers(5, 3));

Arrow Function

const addNumbers = (a, b) => {
    return a + b;
};
console.log(addNumbers(5, 3));

Both examples produce:

8

For a function that contains only one expression to return, you can use an even shorter form.

const addNumbers = (a, b) => a + b;
console.log(addNumbers(5, 3));

Output:

8

The shorter form automatically returns the expression’s value.

Arrow functions are common in modern JavaScript, especially when working with arrays and interactive websites.

⸻

PART FOUR: COMBINING CONDITIONS, LOOPS, AND FUNCTIONS

21. Using All Three Concepts Together

JavaScript becomes more useful when you combine different concepts to solve a problem.

Imagine that CodeRise Academy wants to check the examination results of several students.

We can use:

* A function to check a student’s result.
* A condition to determine whether the student passed.
* A loop to check several students.

Example

function checkResult(score) {
    if (score >= 50) {
        return "Passed";
    } else {
        return "Failed";
    }
}
let scores = [80, 45, 60, 35, 90];
for (let i = 0; i < scores.length; i++) {
    console.log(
        "Score: " + scores[i] + " - " + checkResult(scores[i])
    );
}

Output:

Score: 80 - Passed
Score: 45 - Failed
Score: 60 - Passed
Score: 35 - Failed
Score: 90 - Passed

Understanding the Code

The function:

function checkResult(score) {
    if (score >= 50) {
        return "Passed";
    } else {
        return "Failed";
    }
}

This function checks an individual score and returns a result.

The array:

let scores = [80, 45, 60, 35, 90];

An array stores multiple values in one variable.

The loop:

for (let i = 0; i < scores.length; i++) {
    // Instructions
}

The loop repeats the instructions for each score in the array.

The result:

checkResult(scores[i])

This sends the current score to the function and receives either "Passed" or "Failed".

This is a simple example of how JavaScript can process information automatically.

⸻

PART FIVE: PRACTICAL PROJECT

22. Project: Student Grade Checker

Build a program that accepts a student’s score, calculates the grade, and displays whether the student passed or failed.

Project Requirements

Your program should:

1. Store a student’s name.
2. Store the student’s score.
3. Use a function to calculate the grade.
4. Use conditions to determine the grade.
5. Display the student’s name, score, grade, and result.

Complete Code

let studentName = "David";
let score = 75;
function calculateGrade(score) {
    if (score < 0 || score > 100) {
        return "Invalid score";
    } else if (score >= 80) {
        return "A";
    } else if (score >= 70) {
        return "B";
    } else if (score >= 60) {
        return "C";
    } else if (score >= 50) {
        return "D";
    } else {
        return "F";
    }
}
function checkResult(score) {
    if (score >= 50 && score <= 100) {
        return "Passed";
    } else if (score >= 0 && score < 50) {
        return "Failed";
    } else {
        return "Invalid score";
    }
}
console.log("Student Name:", studentName);
console.log("Score:", score);
console.log("Grade:", calculateGrade(score));
console.log("Result:", checkResult(score));

Expected Output

Student Name: David
Score: 75
Grade: B
Result: Passed

How the Project Works

The studentName variable stores the student’s name, while score stores the examination mark.

The calculateGrade() function uses conditions to determine the appropriate grade.

The checkResult() function checks whether the score is valid and whether the student passed.

Finally, console.log() displays the information.

Practice task: Change the student’s name and score. Test the program with scores of 95, 65, 40, 0, and 105. Observe how the grade and result change.

⸻

PART SIX: COMMON MISTAKES

23. Mistakes Beginners Should Avoid

Mistake 1: Forgetting the Condition’s Parentheses

Incorrect:

if score >= 50 {
    console.log("Passed");
}

Correct:

if (score >= 50) {
    console.log("Passed");
}

Mistake 2: Using = Instead of === in a Comparison

Incorrect:

if (score = 50) {
    console.log("Score is 50");
}

This assigns 50 to score instead of checking whether the score equals 50.

Correct:

if (score === 50) {
    console.log("Score is 50");
}

Mistake 3: Creating an Infinite Loop

Incorrect:

let number = 1;
while (number <= 5) {
    console.log(number);
}

The number never changes, so the condition remains true.

Correct:

let number = 1;
while (number <= 5) {
    console.log(number);
    number++;
}

Mistake 4: Forgetting to Call a Function

function greet() {
    console.log("Hello!");
}

This declares the function but does not execute it.

To run it, write:

greet();

Mistake 5: Forgetting to Return a Value

function addNumbers(a, b) {
    a + b;
}
console.log(addNumbers(5, 3));

Output:

undefined

The function calculates an expression but does not return its result.

Correct:

function addNumbers(a, b) {
    return a + b;
}
console.log(addNumbers(5, 3));

Output:

8

⸻




⸻

25. Conclusion

Conditions, loops, and functions are essential parts of JavaScript programming.

Conditions help programs make decisions based on specific requirements.

Loops allow programs to repeat instructions without writing the same code repeatedly.

Functions allow developers to organise code into reusable blocks that perform particular tasks.

When you combine these concepts, you can build programs that make decisions, process information, and perform tasks automatically.

These skills provide a strong foundation for learning more advanced JavaScript concepts and building interactive websites.

What Comes Next?

You have now covered the three foundational JavaScript lessons in this beginner sequence:

1. Introduction to JavaScript.
2. Variables, Data Types, and Operators.
3. Conditions, Loops, and Functions.

Recommended next step: Practise these concepts by building small projects before moving to DOM manipulation, which allows JavaScript to interact with HTML elements and change webpage content.
  `

},

// backend-lesson-1
// Introduction to Backend Development
  {
    id: "backend-lesson-1",
    trackId: "track-backend",

    title: "Introduction to Backend Development",

    description:
      "Understand what happens behind the scenes when an application works.",

    type: "lesson",

    duration: "12 minutes",

    published: true,

    content: `
# Introduction to Backend Development

Backend development focuses on the server-side systems that support applications.

When a user signs in to a website, backend systems can check their credentials and retrieve account information.

## Common backend responsibilities

- Processing requests.
- Validating data.
- Communicating with databases.
- Managing permissions.
- Providing APIs.
- Supporting authentication.

## What is a database?

A database stores information in an organized way.

For example, a school system may store student profiles, courses, and examination results.

## Practical activity

Think about a school management application.

List five types of information the application might need to store.
`,
  },
];