# SkillSync-AI database

This PostgreSQL database is the relational foundation for employee skills, learning records, assessments, and future AI-enabled discovery. It deliberately stores only the profile data needed by the platform.

## Tables

`roles`, `users`, `skills`, and `competencies` hold reference and profile data. `employee_skills` records current proficiency and `skill_gaps` records calculated needs. `courses` and `course_skills` store course catalogue data, while `nssta_training` stores NSSTA/TPAC programmes independently. `learning_history` connects an employee to exactly one course or training programme. `assessments`, `assessment_questions`, and `assessment_results` preserve assessment activity. `recommendations` points to exactly one learning item. `learning_content_chunks` is reserved for future RAG content.

## ER diagram

```text
roles 1--* users 1--* employee_skills *--1 skills
                 1--* skill_gaps      *--1 skills
courses 1--* course_skills *--1 skills
users 1--* learning_history *--0..1 courses / nssta_training
users 1--* assessments 1--* assessment_questions *--0..1 skills
assessments 1--* assessment_results *--1 users
users 1--* recommendations *--0..1 courses / nssta_training
```

## Setup

Create a database, enable access for your PostgreSQL user, then run from the repository root:

```powershell
psql -U postgres -d skillsync_ai -f database/schema.sql
psql -U postgres -d skillsync_ai -f database/seed.sql
```

Copy `.env.example` to `.env` and set `DATABASE_URL` to the connection string used by your teammate or backend. Do not commit `.env`: passwords and database hosts are private.

`schema.sql` enables pgvector and includes nullable, dimension-free `vector` fields on courses, NSSTA training, and future content chunks. Once an embedding model is selected, migrations can add dimension-specific indexes and populate these fields. No RAG pipeline is implemented here.

If `CREATE EXTENSION vector` fails, install pgvector on the PostgreSQL server and ensure your database user has permission to create extensions. If `psql` is not found, add PostgreSQL's `bin` directory to `PATH` or use pgAdmin's query tool.
