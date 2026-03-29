# SmartPrep AI Documentation

## Project Summary

SmartPrep AI is a web-based exam preparation platform built for two types of users:

- `students`, who practice tests, view results, and track progress
- `admins`, who manage questions, tests, users, and platform analytics

The application is designed to support the full learning cycle:

1. user registration and login
2. test discovery
3. test taking
4. result review
5. performance analytics
6. admin-side content creation and management

In simple business language, this project is an online test practice and exam management system with AI-assisted content generation.

## Main Goal Of The Project

The goal of SmartPrep AI is to help students prepare for exams in a structured way while giving administrators a controlled system to manage educational content.

For students, the system provides:

- practice tests
- timed test experience
- saved test history
- detailed answer review
- score and progress analytics

For admins, the system provides:

- question creation
- AI-based question generation
- test creation
- user visibility
- system-wide analytics

## Target Users

### Student

A student uses the platform to:

- create an account
- log in securely
- browse available tests
- take tests
- submit answers
- review results
- monitor improvement over time

### Admin

An admin uses the platform to:

- access an admin-only dashboard
- create and manage question content
- generate new questions with AI
- build tests from question rules
- view users
- check system analytics

Important:

- admin users are not created from the public registration page
- admin users must be created manually in MongoDB

## Project Architecture

### Frontend

The project uses:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components

The frontend is responsible for:

- page rendering
- forms
- test-taking interaction
- dashboards
- navigation
- charts and visual analytics

### Backend

The backend is implemented through Next.js API routes.

It handles:

- authentication
- user session validation
- question CRUD operations
- test CRUD operations
- attempt creation and retrieval
- analytics generation
- AI-assisted workflows

### Database

The application uses MongoDB for persistent storage.

This means the system permanently stores:

- users
- questions
- tests
- attempts

This is important because test results and analytics are not temporary. They remain saved across sessions.

## Authentication And Security

The app uses secure cookie-based authentication.

In simple terms:

- when a user logs in, the system creates a secure session
- that session is stored in an HTTP-only cookie
- the app uses this cookie to know who the user is
- protected pages check whether the user is signed in
- admin pages also check whether the user has the `admin` role

### Authentication Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Authentication Rules

- public signup creates only `student` users
- login redirects users based on role
- admins go to `/dashboard/admin`
- students go to `/dashboard/student`

## Main Collections In Database

The project stores data mainly in the following collections:

### `users`

Stores:

- name
- email
- password hash
- role
- created date

### `questions`

Stores:

- exam type
- subject
- difficulty
- question text
- answer options
- correct answer
- explanation

### `tests`

Stores:

- title
- description
- exam type
- sections
- question IDs
- time limit
- passing score
- total points
- status

### `attempts`

Stores:

- student ID
- test ID
- submitted answers
- score
- percentage
- time spent
- status
- feedback

## Complete Page-By-Page Documentation

## 1. Landing Page

Route: `/`

### Purpose

This is the public-facing home page of the product. It introduces the platform and encourages visitors to sign in or register.

### What The User Sees

- product name and branding
- top navigation with `Sign In` and `Get Started`
- hero section describing the platform
- feature highlights
- statistics section
- how-it-works section
- call-to-action section
- footer

### Business Meaning

This page works like a marketing and entry page. Its job is to explain the value of the platform before a user logs in.

### Non-Technical Explanation

If you explain this to a non-technical person, say:

"This page is the introduction page of the product. It tells new visitors what SmartPrep AI does and encourages them to create an account or sign in."

## 2. Login Page

Route: `/auth/login`

### Purpose

This page allows existing users to access their account.

### What Happens On This Page

- the user enters email and password
- the form validates that the fields are not empty
- the system sends credentials to the login API
- if login succeeds, the user is redirected to the right dashboard

### Role-Based Redirection

- student goes to `/dashboard/student`
- admin goes to `/dashboard/admin`

### Non-Technical Explanation

"This is the secure entry point for existing users. After successful login, the system takes the user to the correct dashboard based on whether they are a student or admin."

## 3. Register Page

Route: `/auth/register`

### Purpose

This page allows a new student to create an account.

### What Happens On This Page

- user enters full name
- user enters email
- user enters password
- user confirms password
- the form checks for empty fields
- the form checks password match
- the form checks minimum password length
- after successful registration, the user is moved into the student dashboard

### Important Rule

- this page creates only student accounts
- it does not create admins

### Non-Technical Explanation

"This page is where a new student joins the platform. It collects the basic details needed to create a learning account."

## 4. Forgot Password Page

Route: `/auth/forgot-password`

### Purpose

This page is intended to support password reset requests.

### Current State

- the page exists
- the interface works
- the reset flow is currently mocked
- it simulates sending a reset email, but there is no full backend reset system yet

### Non-Technical Explanation

"The page is ready in the interface, but the actual password reset backend is still a placeholder."

## 5. Student Dashboard

Route: `/dashboard/student`

### Purpose

This is the main home page for a student after login.

### What The Page Shows

- welcome message with the student’s name
- average score
- number of tests taken
- total study time
- number of available published tests
- recent attempts
- available tests list
- progress card with analytics shortcut

### Functional Role

This page combines three things:

- performance summary
- recent activity
- next learning actions

### Why This Page Matters

It gives students a quick understanding of:

- how they are performing
- what they have already completed
- what they can take next

### Non-Technical Explanation

"This page is the student’s main control panel. It gives a quick summary of progress, recent test attempts, and currently available practice tests."

## 6. Practice Tests Page

Route: `/dashboard/student/practice`

### Purpose

This page lets students browse all published tests available for practice.

### What The Page Shows

- list of tests
- category-based filtering
- test title
- description
- number of questions
- time limit
- passing score
- category
- button to start a test

### Functional Role

This works like a searchable or filterable test catalog.

### Non-Technical Explanation

"This page helps students find the right practice test. It acts like a library of available tests."

## 7. My Tests Page

Route: `/dashboard/student/tests`

### Purpose

This page shows the student’s saved test attempts.

### What The Page Shows

- previous attempts
- attempt date and time
- status
- score for graded attempts
- total answers saved
- time spent
- button to open detailed result

### Functional Role

This is the student’s test history page.

### Non-Technical Explanation

"This page keeps a record of the tests the student has already taken. It lets them revisit older attempts and open the result details."

## 8. Single Test Page

Route: `/dashboard/student/tests/[id]`

### Purpose

This page opens one selected test and runs the actual test-taking experience.

### Stage 1: Test Introduction

Before the test starts, the page shows:

- test title
- description
- time limit
- total questions
- passing score
- category
- instructions

This helps the student understand the test before beginning.

### Stage 2: Live Test Player

Once the student clicks `Start Test`, the live test interface opens.

### What The Student Can Do During The Test

- view one question at a time
- answer MCQ questions
- answer numerical questions
- answer multi-correct style text inputs
- move to previous and next question
- mark a question for review
- see total progress
- jump directly to a question from the sidebar
- see the live countdown timer

### Important Functional Behavior

When the test is submitted:

- all answers are collected
- time spent is calculated
- the attempt is saved in the database
- the user is redirected to the results page

### Non-Technical Explanation

"This is the actual exam screen. It guides the student through the test, tracks time, saves answers, and submits the result at the end."

## 9. Result Page

Route: `/dashboard/student/results/[id]`

### Purpose

This page shows the complete outcome of a submitted test.

### What The Page Shows

- pass or fail status
- final score
- passing score requirement
- time spent
- number of questions answered
- feedback
- detailed answer-by-answer review
- student answer
- correct answer
- explanation for each question

### Functional Role

This page is not only a score display. It is also a learning review page.

### Why It Matters

Students can understand:

- what they got right
- what they got wrong
- why the correct answer is correct

### Non-Technical Explanation

"This page turns a test into a learning experience. Instead of just showing marks, it shows where the student made mistakes and explains the correct answers."

## 10. Student Analytics Page

Route: `/dashboard/student/analytics`

### Purpose

This page gives a detailed performance overview for the student.

### What The Page Shows

- average score
- highest score
- lowest score
- total study time
- score progress chart
- category performance chart
- passing rate
- average time per test
- total tests taken

### Functional Role

This page helps students look at long-term trends instead of only one test result.

### Non-Technical Explanation

"This page helps the student understand progress over time. It shows whether scores are improving and where performance is strong or weak."

## 11. Admin Dashboard

Route: `/dashboard/admin`

### Purpose

This page is the main operational dashboard for administrators.

### What The Page Shows

- total users
- number of students
- number of questions
- number of published tests
- average score
- quick buttons for questions, tests, and users
- recent users
- system status summary

### Functional Role

This gives admins a top-level summary of platform activity and content status.

### Non-Technical Explanation

"This is the admin control panel. It gives a quick overview of how many users, questions, tests, and attempts exist in the system."

## 12. Admin Question Management Page

Route: `/dashboard/admin/questions`

### Purpose

This page manages the question bank.

It is one of the core admin pages in the project.

### Main Functions Available

- create questions manually
- choose exam type
- choose subject
- choose question type
- choose difficulty
- add question text
- add answer options
- define correct answer
- write explanation

### Additional Admin Tools

- create a new exam type
- create a new subject
- import questions using JSON
- generate questions using AI
- preview generated questions
- select which generated questions to keep
- attach generated questions to a target test
- create a quick target test from inside the AI workflow

### Functional Role

This page acts as the content engine of the platform.

It supports three content creation methods:

- manual creation
- bulk import
- AI-assisted generation

### Non-Technical Explanation

"This page is where admins build the question library for the platform. They can type questions manually, upload them in bulk, or let AI generate them and then approve the ones they want."

## 13. Admin Test Management Page

Route: `/dashboard/admin/tests`

### Purpose

This page is used to create and review tests.

### What The Admin Can Configure

- test title
- description
- exam type
- time limit
- passing score
- total points
- status
- multiple test sections

### What A Section Means

Each section defines:

- subject
- difficulty
- number of questions

### Important Functional Logic

The backend uses these section rules to automatically assign matching questions to the test.

This means the admin does not need to manually pick each question one by one.

### Additional Tools On This Page

- create new exam type
- create new subject
- view current test list
- see section breakdown for each test

### Non-Technical Explanation

"This page is where admins build complete tests from the question bank. Instead of selecting every question manually, they define rules like subject, difficulty, and number of questions, and the system prepares the test accordingly."

## 14. Admin User Management Page

Route: `/dashboard/admin/users`

### Purpose

This page gives admins a read-only view of all users in the system.

### What The Page Shows

- name
- email
- role
- joined date

### Current Limitation

- no edit controls
- no delete controls
- no UI-based role promotion

### Non-Technical Explanation

"This page allows the admin to see who is using the system, but not yet to fully manage accounts from the interface."

## 15. Admin Content Moderation Page

Route: `/dashboard/admin/content`

### Purpose

This page is reserved for future moderation workflows.

### Current Status

- placeholder page only
- no real moderation queue yet

### Non-Technical Explanation

"This page is included for future expansion. It is meant for approval and review workflows, but that part has not been implemented yet."

## 16. Admin Analytics Page

Route: `/dashboard/admin/analytics`

### Purpose

This page gives a system-wide analytics view for administrators.

### What The Page Shows

- user distribution by role
- score distribution by attempt range
- attempt score trend chart

### Functional Role

Unlike the student analytics page, this page focuses on the platform as a whole.

### Non-Technical Explanation

"This page helps the admin understand how the whole platform is performing, including user mix and overall score patterns."

## Role-Based Layout Behavior

## Student Layout

The student sidebar shows:

- Overview
- Practice Tests
- My Tests
- Analytics

If the logged-in user is an admin, the student sidebar also shows admin shortcuts:

- Admin Overview
- Questions
- Tests
- Users

## Admin Layout

The admin sidebar shows:

- Overview
- Student View
- Questions
- Tests
- User Management
- Content Moderation
- Analytics

## Test Workflow

This is the core student journey through the system.

### Step 1: Student Logs In

The student signs in and lands on the student dashboard.

### Step 2: Student Chooses A Test

The student selects a test either from:

- dashboard overview
- practice tests page

### Step 3: Student Starts The Test

The test details page opens and shows instructions.

### Step 4: Student Answers Questions

The live test interface handles:

- navigation between questions
- answer capture
- mark-for-review
- progress tracking
- timer tracking

### Step 5: Student Submits

The system:

- collects answers
- calculates time spent
- saves the attempt
- redirects to result page

### Step 6: Student Reviews Results

The student sees:

- score
- pass/fail
- explanations
- answer review

### Step 7: Analytics Are Updated

Because attempts are stored in the database, analytics pages can use real saved data.

## Admin Content Workflow

This is the main admin-side operational flow.

### Step 1: Admin Creates Questions

Questions can be created:

- manually
- by JSON import
- through AI generation

### Step 2: Admin Organizes Test Structure

The admin defines:

- exam type
- subject
- difficulty
- number of questions

### Step 3: Admin Creates Test

The system creates a test based on those rules.

### Step 4: Students See Published Tests

Once the test is published, students can see it in their available test lists.

## API Surface

### Authentication APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Question APIs

- `GET /api/questions`
- `POST /api/questions`
- `GET /api/questions/[id]`
- `PATCH /api/questions/[id]`
- `DELETE /api/questions/[id]`

### Test APIs

- `GET /api/tests`
- `POST /api/tests`
- `GET /api/tests/[id]`
- `PATCH /api/tests/[id]`
- `DELETE /api/tests/[id]`

### Attempt APIs

- `GET /api/attempts`
- `POST /api/attempts`
- `GET /api/attempts/[id]`

### Analytics APIs

- `GET /api/analytics/performance`

### User APIs

- `GET /api/users`

### AI APIs

- `POST /api/ai/generate-questions`
- `POST /api/ai/finalize-questions`
- `POST /api/ai/evaluate-answer`
- `POST /api/ai/generate-feedback`

## AI Functionality In The Project

The project includes AI-related endpoints and admin workflows.

### Where AI Is Used

- generating new questions
- evaluating answers
- generating feedback

### Practical Meaning

AI is used to assist content creation and feedback generation, especially on the admin side for faster question generation.

### Current Product Position

The UI and API support AI workflows, but the exact external AI provider behavior depends on the implementation inside the backend service.

## Important Current Limitations

The project is already functional, but some parts are still incomplete or basic.

### Current Limitations

- forgot password flow is mocked
- content moderation is a placeholder
- admin accounts are created manually in database
- user management is read-only in the UI
- some advanced edit and delete flows are not exposed strongly in the current UI

## What Is Fully Working In The Current Project

Based on the current code structure, these major features are implemented:

- landing page
- login
- register
- authenticated layouts
- student dashboard
- practice test browsing
- test attempt history
- live test player
- test submission
- result page with answer review
- student analytics
- admin dashboard
- admin question creation
- AI-assisted question generation flow
- admin test creation
- user listing
- admin analytics

## Short Explanation You Can Say To A Non-Technical Person

SmartPrep AI is an online learning and test practice platform. Students can create accounts, take timed tests, review detailed results, and track their progress. Admins can manage the entire question bank, create tests, generate questions with AI, and monitor platform activity. The system stores everything in a database, so user accounts, tests, attempts, and analytics are saved properly and can be reviewed anytime.

## One-Line Explanation Of Every Main Page

- `/` : public introduction page for the product
- `/auth/login` : sign in page for existing users
- `/auth/register` : sign up page for new students
- `/auth/forgot-password` : placeholder password reset page
- `/dashboard/student` : student overview dashboard
- `/dashboard/student/practice` : list of available practice tests
- `/dashboard/student/tests` : student attempt history
- `/dashboard/student/tests/[id]` : test instructions and live test player
- `/dashboard/student/results/[id]` : detailed test result review
- `/dashboard/student/analytics` : personal performance analytics
- `/dashboard/admin` : admin summary dashboard
- `/dashboard/admin/questions` : question bank management and AI generation
- `/dashboard/admin/tests` : test creation and test management
- `/dashboard/admin/users` : read-only user list
- `/dashboard/admin/content` : future moderation page
- `/dashboard/admin/analytics` : system-wide analytics dashboard

## File Location

This documentation file is stored at:

`/Users/rahulkumar/M4/test/PROJECT_DOCUMENTATION.md`
