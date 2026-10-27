export const initialLessons = [
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
# Introduction to Frontend Development

Frontend development is the part of web development concerned with what users see and interact with.

Frontend developers build things such as navigation menus, forms, buttons, and page layouts.

## The three foundations

### HTML

HTML defines the structure of a webpage.

Examples include headings, paragraphs, images, and buttons.

### CSS

CSS controls appearance.

It can change colors, spacing, fonts, and layouts.

### JavaScript

JavaScript adds behavior.

It can respond to button clicks, validate forms, and update page content.

## Practical activity

Create a folder called my-first-webpage.

Inside it, create:

- index.html
- style.css
- script.js

Your first task is to display a heading and a paragraph using HTML.
`,
  },

  {
    id: "frontend-lesson-2",
    trackId: "track-frontend",

    title: "Understanding HTML",

    description:
      "Learn the basic structure of an HTML document.",

    type: "lesson",

    duration: "15 minutes",

    published: true,

    content: `
# Understanding HTML

HTML stands for HyperText Markup Language.

It tells a browser how webpage content is organized.

## A simple HTML document

<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First Webpage</title>
</head>
<body>
  <h1>Welcome to My Webpage</h1>
  <p>I am learning HTML.</p>
</body>
</html>

## Important elements

- h1 creates a main heading.
- p creates a paragraph.
- title sets the browser tab title.
- body contains visible page content.
- head contains document information.

## Practical activity

Create a webpage containing:

1. Your name as a heading.
2. A paragraph introducing yourself.
3. A list of three things you want to learn.
`,
  },

  {
    id: "frontend-lesson-3",
    trackId: "track-frontend",

    title: "Introduction to CSS",

    description:
      "Learn how CSS styles the structure created with HTML.",

    type: "lesson",

    duration: "15 minutes",

    published: true,

    content: `
# Introduction to CSS

CSS stands for Cascading Style Sheets.

It controls how HTML content looks.

## Example

h1 {
  color: purple;
  font-size: 32px;
}

This CSS changes the heading color to purple and sets its font size to 32 pixels.

## Three ways to add CSS

1. Inline CSS
2. Internal CSS
3. External CSS

External CSS is useful for keeping styles separate from HTML.

## Practical activity

Style your first webpage.

Change:
- The heading color.
- The page background.
- The paragraph font size.
- The spacing around the content.
`,
  },

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