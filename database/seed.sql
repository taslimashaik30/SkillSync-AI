-- Synthetic demo data only. Run after schema.sql.
INSERT INTO roles (id, name, description) VALUES
 (1, 'employee', 'Platform employee'), (2, 'admin', 'Platform administrator');
INSERT INTO users (id, name, email, password_hash, role_id, employee_code, department, designation) VALUES
 (1, 'Asha Demo', 'asha.demo@example.test', 'demo_hash_not_a_password', 1, 'DEMO-001', 'Data Analysis', 'Statistical Officer'),
 (2, 'Ravi Demo', 'ravi.demo@example.test', 'demo_hash_not_a_password', 1, 'DEMO-002', 'IT', 'Data Analyst'),
 (3, 'Admin Demo', 'admin.demo@example.test', 'demo_hash_not_a_password', 2, 'DEMO-003', 'Administration', 'Administrator');
INSERT INTO skills (id, name, category, description) VALUES
 (1, 'Python', 'Technical', 'Python programming'), (2, 'SQL', 'Technical', 'Relational data querying'),
 (3, 'Statistics', 'Statistical', 'Statistical methods'), (4, 'Data Analysis', 'Analytical', 'Data interpretation'),
 (5, 'Machine Learning', 'Technical', 'ML foundations'), (6, 'Data Visualization', 'Analytical', 'Visual communication'),
 (7, 'Communication', 'Professional', 'Professional communication');
INSERT INTO competencies (name, category, description) VALUES
 ('Statistical Analysis', 'Domain', 'Statistical analysis capability'), ('Data Management', 'Domain', 'Data management capability'),
 ('Digital Skills', 'Digital', 'Digital tools capability'), ('Leadership', 'Professional', 'Leadership capability'),
 ('Communication', 'Professional', 'Communication capability');
INSERT INTO employee_skills (user_id, skill_id, proficiency_level) VALUES
 (1, 1, 2), (1, 2, 3), (1, 3, 4), (1, 4, 3), (2, 1, 4), (2, 2, 2), (2, 6, 3), (2, 7, 4);
INSERT INTO courses (id, title, description, provider, source, external_course_id, category, difficulty, duration_minutes, url) VALUES
 (1, 'Python for Data Analysis', 'Synthetic catalogue course covering Python data analysis.', 'Demo Learning', 'iGOT', 'DEMO-IGOT-001', 'Data Analysis', 'beginner', 360, 'https://example.test/courses/python-data'),
 (2, 'SQL Fundamentals', 'Synthetic catalogue course covering SQL queries.', 'Demo Learning', 'iGOT', 'DEMO-IGOT-002', 'Data Management', 'beginner', 240, 'https://example.test/courses/sql'),
 (3, 'Statistical Methods', 'Synthetic catalogue course covering statistics.', 'Demo Learning', 'internal', 'DEMO-INT-001', 'Statistics', 'intermediate', 480, 'https://example.test/courses/statistics');
INSERT INTO course_skills (course_id, skill_id, relevance_score) VALUES
 (1, 1, 1.00), (1, 4, 0.80), (2, 2, 1.00), (3, 3, 1.00), (3, 4, 0.70);
INSERT INTO nssta_training (id, title, description, provider, programme_type, location, start_date, end_date, duration_minutes, eligibility, url) VALUES
 (1, 'Official Statistics Data Management Workshop', 'Synthetic NSSTA/TPAC-style workshop.', 'NSSTA Demo', 'Workshop', 'New Delhi', '2027-01-12', '2027-01-14', 1080, 'Officials working with statistical data.', 'https://example.test/nssta/data-management'),
 (2, 'Data Visualization Programme', 'Synthetic NSSTA/TPAC-style programme.', 'TPAC Demo', 'Programme', 'Pune', '2027-02-10', '2027-02-12', 1080, 'Officials with basic analytical experience.', 'https://example.test/nssta/visualization');
INSERT INTO learning_history (user_id, course_id, nssta_training_id, status, progress_percentage, score, started_at, completed_at) VALUES
 (1, 3, NULL, 'completed', 100, 88, '2026-08-01 09:00+05:30', '2026-08-15 17:00+05:30'),
 (1, 1, NULL, 'in_progress', 45, NULL, '2026-09-01 09:00+05:30', NULL),
 (2, NULL, 2, 'not_started', 0, NULL, NULL, NULL);
INSERT INTO skill_gaps (user_id, skill_id, current_level, required_level, gap_score, priority) VALUES
 (1, 1, 2, 4, 2, 'high'), (1, 4, 3, 4, 1, 'medium'), (2, 2, 2, 4, 2, 'high');
SELECT setval(pg_get_serial_sequence('roles', 'id'), 2, true);
SELECT setval(pg_get_serial_sequence('users', 'id'), 3, true);
SELECT setval(pg_get_serial_sequence('skills', 'id'), 7, true);
SELECT setval(pg_get_serial_sequence('courses', 'id'), 3, true);
SELECT setval(pg_get_serial_sequence('nssta_training', 'id'), 2, true);
