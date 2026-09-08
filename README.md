# AI-Enabled Skill Intelligence and Learning Platform

## SIH Problem Statement 26101

An AI-enabled Skill Intelligence and Learning Platform for strengthening capacity building of officials engaged in India's Official Statistical System through personalized competency assessment, skill-gap analysis, learning recommendations, assessments, and integration with iGOT Karmayogi and NSSTA training programmes.

---

## 📌 Project Status

**Current Phase:** Project Structure Creation

The repository currently contains the initial project structure for collaborative development.

### Planned Features

* AI-based competency assessment
* Automated skill-gap analysis
* Personalized learning recommendations
* iGOT Karmayogi course integration
* NSSTA/TPAC training programme recommendations
* AI-generated MCQs and quizzes
* AI-powered learning assistant
* Employee dashboard
* Administrator dashboard
* Learning progress tracking
* Competency mapping
* Secure authentication and role-based access control
* PostgreSQL database
* AI/ML and NLP-based recommendation system

---

# 🏗️ Project Architecture

```text
                    USERS
                      │
                      ▼
              ┌───────────────┐
              │ React Frontend│
              └───────┬───────┘
                      │
                 REST APIs
                      │
                      ▼
              ┌───────────────┐
              │ FastAPI Backend│
              └───────┬───────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
 PostgreSQL        AI Engine      iGOT API
 + pgvector          │
                     │
              ┌──────┼──────┐
              ▼      ▼      ▼
             ML     NLP    LLM
                     │
                     ▼
              Recommendation
                  Engine
```

---

# 📂 Project Structure

```text
ai-skill-intelligence-platform/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SkillCard.jsx
│   │   │   ├── CourseCard.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── QuizCard.jsx
│   │   │   └── Chatbot.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── SkillGap.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── LearningPath.jsx
│   │   │   ├── Quiz.jsx
│   │   │   ├── Assistant.jsx
│   │   │   └── AdminDashboard.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── .gitkeep
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   │   └── .gitkeep
│   │
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── skills.py
│   │   │   ├── courses.py
│   │   │   ├── recommendations.py
│   │   │   ├── assessments.py
│   │   │   ├── chatbot.py
│   │   │   └── admin.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── competency.py
│   │   │   ├── course.py
│   │   │   ├── assessment.py
│   │   │   └── progress.py
│   │   │
│   │   ├── services/
│   │   │   ├── recommendation.py
│   │   │   ├── skill_gap.py
│   │   │   ├── mcq_generator.py
│   │   │   ├── chatbot.py
│   │   │   └── igot_service.py
│   │   │
│   │   ├── ai/
│   │   │   ├── embeddings.py
│   │   │   ├── rag.py
│   │   │   └── models.py
│   │   │
│   │   ├── database/
│   │   │   └── database.py
│   │   │
│   │   ├── utils/
│   │   │   └── .gitkeep
│   │   │
│   │   └── main.py
│   │
│   ├── uploads/
│   │   └── .gitkeep
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── datasets/
│   ├── employees.csv
│   ├── competencies.csv
│   ├── roles.csv
│   ├── courses.csv
│   ├── nssta_training.csv
│   ├── learning_history.csv
│   └── assessments.csv
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── README.md
│
├── docs/
│   ├── architecture.md
│   ├── api-documentation.md
│   ├── competency-framework.md
│   └── README.md
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

# 📁 Folder Responsibilities

## `frontend/`

Contains the complete React frontend.

### `components/`

Reusable UI components such as:

* Navbar
* Sidebar
* Skill cards
* Course cards
* Progress bars
* Quiz components
* AI chatbot

### `pages/`

Complete application pages:

* Login/Register
* Employee Dashboard
* Profile
* Skill Gap
* Recommendations
* Learning Path
* Quiz
* AI Assistant
* Admin Dashboard

### `services/`

Frontend API communication.

Example:

```text
frontend
   ↓
services/api.js
   ↓
FastAPI backend
```

---

# 📁 `backend/`

Contains the Python FastAPI backend.

## `routes/`

API endpoints.

Examples:

```text
/auth
/users
/skills
/courses
/recommendations
/assessments
/chatbot
/admin
```

## `models/`

Backend/database models.

## `services/`

Business logic:

* Skill-gap calculation
* Course recommendation
* MCQ generation
* Chatbot
* iGOT integration

## `ai/`

AI/ML functionality:

* Embeddings
* RAG
* ML models
* NLP
* LLM integration

## `database/`

Database connection and configuration.

---

# 📊 `datasets/`

This folder contains the datasets used for the prototype.

```text
employees.csv
```

Synthetic employee profiles.

```text
competencies.csv
```

Competency domains and skills.

```text
roles.csv
```

Job roles and required competencies.

```text
courses.csv
```

iGOT course catalogue data used by the prototype.

```text
nssta_training.csv
```

NSSTA/TPAC training programme information.

```text
learning_history.csv
```

Previous employee learning and course completion information.

```text
assessments.csv
```

Assessment/quiz-related prototype data.

> **Note:** Employee information used during development should be synthetic/demo data. Do not commit confidential or personally identifiable government employee data to this repository.

---

# 🗄️ `database/`

Contains database-related files.

```text
schema.sql
```

Database structure.

```text
seed.sql
```

Initial/sample database records.

---

# 📚 `docs/`

Project documentation.

### `architecture.md`

System architecture and technical design.

### `api-documentation.md`

Backend API documentation.

### `competency-framework.md`

Competency domains, skills, proficiency levels, and role mappings.

---

# 🛠️ Technology Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router
* Recharts

## Backend

* Python
* FastAPI
* SQLAlchemy
* JWT
* REST APIs

## Database

* PostgreSQL
* pgvector

## AI/ML

* Python
* Scikit-learn
* NLP
* Sentence Transformers
* LLM
* RAG
* Semantic Search

## Document Processing

* PyMuPDF / pypdf
* python-docx
* python-pptx

## Development Tools

* Git
* GitHub
* VS Code
* Postman
* Docker

---

# 🔄 Main System Flow

```text
Employee Login
      ↓
Employee Profile
      ↓
Competency Assessment
      ↓
Skill Gap Analysis
      ↓
AI Recommendation Engine
      ↓
iGOT Courses + NSSTA Training
      ↓
Personalized Learning Path
      ↓
Learning
      ↓
Assessment / Quiz
      ↓
Performance Evaluation
      ↓
Competency Score Update
      ↓
New Recommendations
```

---

# 🤖 AI Features

## 1. Competency Assessment

The system evaluates an employee's current competencies based on profile information, previous training, assessments, and learning history.

## 2. Skill Gap Analysis

Current competency levels are compared with competency requirements for the employee's job role.

```text
Required Level - Current Level = Skill Gap
```

## 3. Personalized Recommendations

The recommendation engine considers:

* Job role
* Current competency
* Skill gaps
* Previous learning
* Department requirements
* Career progression
* Course relevance

## 4. AI MCQ Generation

Learning materials such as PDF, PPT and DOCX can be processed to generate MCQs and quizzes using NLP/LLM techniques.

## 5. AI Learning Assistant

An AI assistant provides learning support and answers questions based on relevant learning content.

## 6. RAG / Semantic Search

Relevant learning materials, competency information, courses and training programmes can be retrieved before generating AI responses.

---

# 🔌 API Structure

Planned backend endpoints:

```text
POST   /api/auth/login
POST   /api/auth/register

GET    /api/users/profile
PUT    /api/users/profile

GET    /api/competencies
GET    /api/skills
GET    /api/skill-gaps

GET    /api/courses
GET    /api/recommendations
GET    /api/learning-path

POST   /api/assessments/generate
POST   /api/assessments/submit

POST   /api/chat

GET    /api/admin/dashboard

GET    /api/igot/courses
GET    /api/igot/progress
```

These endpoints are planned and will be implemented during development.

---

# 👥 Team Development

To avoid conflicts, each team member should work mainly inside their assigned folder/module.

```text
Frontend Team
    ↓
frontend/

Backend Team
    ↓
backend/routes/
backend/models/
backend/services/

AI/ML Team
    ↓
backend/ai/
backend/services/recommendation.py
backend/services/skill_gap.py
backend/services/mcq_generator.py

Database/Data Team
    ↓
datasets/
database/

Documentation/Integration
    ↓
docs/
backend/services/igot_service.py
```

Before modifying another member's module, communicate with the team and pull the latest changes.

---

# 🚀 How to Get the Project

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project:

```bash
cd ai-skill-intelligence-platform
```

Then open the project in VS Code:

```bash
code .
```

---

# 🌿 Git Workflow

Before starting work:

```bash
git pull origin main
```

Create a separate branch:

```bash
git checkout -b feature/<your-feature-name>
```

Example:

```bash
git checkout -b feature/frontend-dashboard
```

After making changes:

```bash
git add .
git commit -m "Add employee dashboard structure"
git push origin feature/frontend-dashboard
```

Then create a Pull Request on GitHub.

---

# ⚠️ Important Rules

1. Do not directly modify another teammate's module without communication.
2. Do not commit passwords, API keys, tokens, or `.env` files.
3. Use `.env.example` for environment variable documentation.
4. Do not upload confidential government data.
5. Use synthetic data during development unless authorized data is officially provided.
6. Pull the latest `main` branch before starting work.
7. Use meaningful commit messages.
8. Test your changes before creating a Pull Request.
9. Keep frontend and backend responsibilities separate.
10. Do not commit unnecessary generated files.

---

# 📌 Development Status

### Phase 1 — Structure

* [x] Project folders created
* [x] Frontend structure created
* [x] Backend structure created
* [x] Dataset structure created
* [x] Database structure created
* [x] Documentation structure created

### Phase 2 — Development

* [ ] Frontend UI
* [ ] Authentication
* [ ] Database
* [ ] Backend APIs
* [ ] Competency framework
* [ ] Skill-gap engine
* [ ] Recommendation engine
* [ ] iGOT integration
* [ ] NSSTA training integration
* [ ] AI MCQ generation
* [ ] AI assistant
* [ ] Employee dashboard
* [ ] Admin dashboard

### Phase 3 — Testing & Deployment

* [ ] API testing
* [ ] Integration testing
* [ ] Security testing
* [ ] Docker setup
* [ ] Cloud deployment
* [ ] Final SIH demonstration

---

## 🎯 Project Goal

The goal is to build a secure, scalable and AI-enabled learning platform that identifies competency gaps, provides personalized learning recommendations, supports continuous assessment, and helps create a future-ready workforce for India's Official Statistical System.
