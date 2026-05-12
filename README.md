TaskFlow — Mini Project Management App
A full-stack project management app where users can create projects, manage tasks, and track progress — built with React, Node.js/Express, and MongoDB.

Features

JWT Authentication — Register, login, protected routes
Projects Dashboard — Create, edit, delete projects with task counts
Kanban Board — Tasks organised in To Do / In Progress / Done columns
Task Management — Add, edit, delete tasks; change status inline
Search & Filter — Search by title, filter by status in real time
Form Validation — Both client-side and server-side
Loading & Empty States — Smooth UX throughout


Tech Stack
LayerTechFrontendReact 18, React Router v6StylingPlain CSS (custom design)BackendNode.js + Express.jsDatabaseMongoDB + MongooseAuthJWT + bcryptjsValidationexpress-validator

Project Structure
project-mgmt/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── ProjectModal.js
    │   │   └── TaskModal.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   └── ProjectDetail.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
