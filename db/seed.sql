-- Seed Data for School Admin Core Database

-- Students (4 students as per handoff)
INSERT INTO students (id, name, class_name, birth_date, photo_url, health_status, medical_support, contract_status, contract_start_date, contract_end_date, is_paid) VALUES
('student-1', 'Emma Johansson', 'Grade 5A', '2015-03-15', null, 'Good', 'Carries EpiPen for peanut allergy', 'active', '2024-09-01', '2025-06-30', 1),
('student-2', 'Lucas Petrovas', 'Grade 4B', '2016-05-22', null, 'Good', null, 'active', '2024-09-01', '2025-06-30', 1),
('student-3', 'Sofia Andersson', 'Grade 3C', '2017-08-10', null, 'Good', null, 'pending', '2024-09-01', '2025-06-30', 0),
('student-4', 'Matas Kazlauskas', 'Grade 6A', '2014-11-28', null, 'Good', 'Celiac disease - strict gluten-free diet', 'active', '2024-09-01', '2025-06-30', 1);

-- Allergies
INSERT INTO allergies (id, student_id, name, severity, notes) VALUES
('allergy-1', 'student-1', 'Peanuts', 'life-threatening', 'Carries EpiPen at all times. Staff trained on emergency protocol.'),
('allergy-2', 'student-1', 'Dust', 'low', 'Minimal impact, no special precautions needed.'),
('allergy-3', 'student-2', 'Bee stings', 'medium', 'Monitor for swelling. Parents to be notified immediately if stung.'),
('allergy-4', 'student-4', 'Gluten', 'life-threatening', 'Celiac disease. Strict gluten-free diet required. Cross-contamination must be avoided.');

-- Emergency Contacts (for students)
INSERT INTO emergency_contacts (id, student_id, staff_id, name, phone, relation, is_primary) VALUES
('contact-1', 'student-1', null, 'Maria Johansson', '+370 612 34567', 'Mother', 1),
('contact-2', 'student-1', null, 'Erik Johansson', '+370 612 34568', 'Father', 0),
('contact-3', 'student-2', null, 'Rasa Petrovienė', '+370 623 45678', 'Mother', 1),
('contact-4', 'student-2', null, 'Darius Petrovas', '+370 623 45679', 'Father', 0),
('contact-5', 'student-3', null, 'Anna Andersson', '+370 634 56789', 'Mother', 1),
('contact-6', 'student-4', null, 'Jūratė Kazlauskienė', '+370 645 67890', 'Mother', 1),
('contact-7', 'student-4', null, 'Vytautas Kazlauskas', '+370 645 67891', 'Father', 0);

-- Document Checklist
INSERT INTO document_checklist (id, student_id, name, is_complete, due_date) VALUES
('doc-1', 'student-1', 'Health Certificate', 1, '2024-09-15'),
('doc-2', 'student-1', 'Vaccination Record', 1, '2024-09-15'),
('doc-3', 'student-1', 'Photo Consent', 1, '2024-09-15'),
('doc-4', 'student-1', 'Emergency Contact Form', 0, '2024-09-30'),
('doc-5', 'student-2', 'Health Certificate', 1, '2024-09-15'),
('doc-6', 'student-2', 'Vaccination Record', 1, '2024-09-15'),
('doc-7', 'student-2', 'Photo Consent', 1, '2024-09-15'),
('doc-8', 'student-2', 'Emergency Contact Form', 1, '2024-09-15'),
('doc-9', 'student-3', 'Health Certificate', 1, '2024-09-15'),
('doc-10', 'student-3', 'Vaccination Record', 0, '2024-09-30'),
('doc-11', 'student-3', 'Photo Consent', 0, '2024-09-30'),
('doc-12', 'student-3', 'Emergency Contact Form', 1, '2024-09-15'),
('doc-13', 'student-4', 'Health Certificate', 1, '2024-09-15'),
('doc-14', 'student-4', 'Vaccination Record', 1, '2024-09-15'),
('doc-15', 'student-4', 'Photo Consent', 1, '2024-09-15'),
('doc-16', 'student-4', 'Emergency Contact Form', 1, '2024-09-15');

-- Agreements
INSERT INTO agreements (id, student_id, type, name, status, signed_date) VALUES
('agree-1', 'student-1', 'photography', 'Photography Consent', 'internal-only', '2024-09-01'),
('agree-2', 'student-1', 'travel', 'Field Trip Authorization', 'allowed', '2024-09-01'),
('agree-3', 'student-2', 'photography', 'Photography Consent', 'allowed', '2024-09-01'),
('agree-4', 'student-2', 'travel', 'Field Trip Authorization', 'allowed', '2024-09-01'),
('agree-5', 'student-3', 'photography', 'Photography Consent', 'allowed', '2024-09-01'),
('agree-6', 'student-3', 'travel', 'Field Trip Authorization', 'forbidden', null),
('agree-7', 'student-4', 'photography', 'Photography Consent', 'allowed', '2024-09-01'),
('agree-8', 'student-4', 'travel', 'Field Trip Authorization', 'allowed', '2024-09-01');

-- Authorized Pickup
INSERT INTO authorized_pickup (id, student_id, name, phone, relation) VALUES
('pickup-1', 'student-1', 'Maria Johansson', '+370 612 34567', 'Mother'),
('pickup-2', 'student-1', 'Erik Johansson', '+370 612 34568', 'Father'),
('pickup-3', 'student-1', 'Ingrid Sandberg', '+370 612 34569', 'Grandmother'),
('pickup-4', 'student-2', 'Rasa Petrovienė', '+370 623 45678', 'Mother'),
('pickup-5', 'student-2', 'Darius Petrovas', '+370 623 45679', 'Father'),
('pickup-6', 'student-3', 'Anna Andersson', '+370 634 56789', 'Mother'),
('pickup-7', 'student-4', 'Jūratė Kazlauskienė', '+370 645 67890', 'Mother'),
('pickup-8', 'student-4', 'Vytautas Kazlauskas', '+370 645 67891', 'Father');

-- Departments
INSERT INTO departments (id, name, description) VALUES
('dept-admin', 'Administration', 'School administration and management'),
('dept-math', 'Mathematics', 'Mathematics department'),
('dept-lang', 'Languages', 'Language and literature department'),
('dept-pe', 'Physical Education', 'Physical education and sports'),
('dept-primary', 'Primary Education', 'Primary school education');

-- Staff (5 staff members as per handoff)
INSERT INTO staff (id, first_name, last_name, position, role, department, email, phone, salary, salary_coefficient, start_date, qualification, rank) VALUES
('staff-1', 'Dr. Kristina', 'Balčiūnienė', 'Principal', 'Principal', 'dept-admin', 'k.balciuniene@school.lt', '+370 656 12345', 3500.00, 1.8, '2014-08-01', 'PhD in Education', 'Expert'),
('staff-2', 'Jonas', 'Petrauskas', 'Math Teacher', 'Math Teacher', 'dept-math', 'j.petrauskas@school.lt', '+370 667 23456', 2200.00, 1.4, '2018-09-01', 'Master in Mathematics', 'Senior'),
('staff-3', 'Eglė', 'Ramonaitė', 'Teacher', 'Lithuanian Teacher', 'dept-lang', 'e.ramonaite@school.lt', '+370 678 34567', 2000.00, 1.3, '2020-09-01', 'Master in Lithuanian Philology', 'Specialist'),
('staff-4', 'Andrius', 'Gudelis', 'PE Teacher', 'PE Teacher', 'dept-pe', 'a.gudelis@school.lt', '+370 689 45678', 1900.00, 1.2, '2019-09-01', 'Bachelor in Sports Science', 'Specialist'),
('staff-5', 'Monika', 'Vasiliauskienė', 'Teacher', 'Class Mentor', 'dept-primary', 'm.vasiliauskiene@school.lt', '+370 690 56789', 2100.00, 1.35, '2017-09-01', 'Master in Primary Education', 'Senior');

-- Emergency Contacts (for staff)
INSERT INTO emergency_contacts (id, student_id, staff_id, name, phone, relation, is_primary) VALUES
('contact-staff-1', null, 'staff-1', 'Mindaugas Balčiūnas', '+370 656 12346', 'Spouse', 1),
('contact-staff-2', null, 'staff-2', 'Ingrida Petrauskienė', '+370 667 23457', 'Spouse', 1),
('contact-staff-3', null, 'staff-3', 'Tomas Ramonas', '+370 678 34568', 'Spouse', 1),
('contact-staff-4', null, 'staff-4', 'Rūta Gudelienė', '+370 689 45679', 'Spouse', 1),
('contact-staff-5', null, 'staff-5', 'Darius Vasiliauskas', '+370 690 56790', 'Spouse', 1);

-- Certificates
INSERT INTO certificates (id, staff_id, name, issuer, date, file_url) VALUES
('cert-1', 'staff-1', 'School Leadership Certificate', 'National Education Agency', '2016-06-15', null),
('cert-2', 'staff-1', 'Crisis Management Training', 'Ministry of Education', '2020-03-10', null),
('cert-3', 'staff-2', 'Advanced Mathematics Pedagogy', 'Teachers Development Institute', '2021-05-20', null),
('cert-4', 'staff-3', 'Lithuanian Language Certification', 'State Language Center', '2022-09-01', null),
('cert-5', 'staff-4', 'First Aid and CPR', 'Red Cross', '2024-01-15', null);

-- Course Evaluations
INSERT INTO course_evaluations (id, staff_id, course_name, rating, feedback, date) VALUES
('eval-1', 'staff-2', 'Algebra Fundamentals - Grade 8', 4.8, 'Excellent explanation of complex concepts. Students showed great improvement.', '2024-06-15'),
('eval-2', 'staff-2', 'Geometry - Grade 7', 4.5, 'Engaging teaching methods. Could improve visual aids.', '2024-06-15'),
('eval-3', 'staff-3', 'Lithuanian Literature - Grade 10', 4.9, 'Outstanding enthusiasm and deep knowledge of subject.', '2024-06-15'),
('eval-4', 'staff-4', 'Physical Education - Grade 6', 4.6, 'Great energy and student engagement. Well-organized activities.', '2024-06-15'),
('eval-5', 'staff-5', 'Primary Class Management - Grade 3', 4.7, 'Caring approach and excellent classroom management.', '2024-06-15');

-- Extra Duties
INSERT INTO extra_duties (id, staff_id, duty_name) VALUES
('duty-1', 'staff-1', 'School Board Representative'),
('duty-2', 'staff-1', 'Budget Committee Chair'),
('duty-3', 'staff-2', 'Math Olympiad Coordinator'),
('duty-4', 'staff-3', 'School Newspaper Advisor'),
('duty-5', 'staff-4', 'Sports Day Organizer'),
('duty-6', 'staff-5', 'Parent-Teacher Association Liaison');

-- Compliance Documents (4 documents as per handoff)
INSERT INTO compliance_documents (id, title, description, version, file_url, upload_date, due_date, target_audience) VALUES
('comp-1', 'Internal Work Rules 2026', 'Updated internal work regulations including remote work policies, conduct standards, and disciplinary procedures.', 'v2.1', null, '2026-01-15', '2026-02-01', 'all'),
('comp-2', 'Fire Safety Protocol', 'Annual fire safety procedures, evacuation routes, and emergency contact procedures.', 'v1.3', null, '2026-01-10', '2026-02-15', 'all'),
('comp-3', 'GDPR Data Protection Guidelines', 'Updated guidelines for handling student and staff personal data in compliance with GDPR regulations.', 'v3.0', null, '2026-01-05', '2026-01-31', 'all'),
('comp-4', 'Student Supervision Standards', 'Standards and protocols for student supervision during school hours and extracurricular activities.', 'v2.0', null, '2025-12-20', '2026-01-20', 'all');

-- Document Signatures
INSERT INTO document_signatures (id, document_id, staff_id, staff_name, status, signed_at) VALUES
-- Internal Work Rules (3 of 5 signed)
('sig-1', 'comp-1', 'staff-1', 'Dr. Kristina Balčiūnienė', 'signed', '2026-01-16 10:30:00'),
('sig-2', 'comp-1', 'staff-2', 'Jonas Petrauskas', 'signed', '2026-01-17 09:15:00'),
('sig-3', 'comp-1', 'staff-3', 'Eglė Ramonaitė', 'pending', null),
('sig-4', 'comp-1', 'staff-4', 'Andrius Gudelis', 'pending', null),
('sig-5', 'comp-1', 'staff-5', 'Monika Vasiliauskienė', 'signed', '2026-01-18 14:20:00'),

-- Fire Safety Protocol (5 of 5 signed)
('sig-6', 'comp-2', 'staff-1', 'Dr. Kristina Balčiūnienė', 'signed', '2026-01-11 08:45:00'),
('sig-7', 'comp-2', 'staff-2', 'Jonas Petrauskas', 'signed', '2026-01-11 11:20:00'),
('sig-8', 'comp-2', 'staff-3', 'Eglė Ramonaitė', 'signed', '2026-01-12 09:30:00'),
('sig-9', 'comp-2', 'staff-4', 'Andrius Gudelis', 'signed', '2026-01-12 13:15:00'),
('sig-10', 'comp-2', 'staff-5', 'Monika Vasiliauskienė', 'signed', '2026-01-13 10:00:00'),

-- GDPR Guidelines (2 of 5 signed)
('sig-11', 'comp-3', 'staff-1', 'Dr. Kristina Balčiūnienė', 'signed', '2026-01-06 09:00:00'),
('sig-12', 'comp-3', 'staff-2', 'Jonas Petrauskas', 'pending', null),
('sig-13', 'comp-3', 'staff-3', 'Eglė Ramonaitė', 'pending', null),
('sig-14', 'comp-3', 'staff-4', 'Andrius Gudelis', 'signed', '2026-01-07 15:30:00'),
('sig-15', 'comp-3', 'staff-5', 'Monika Vasiliauskienė', 'pending', null),

-- Student Supervision Standards (4 of 5 signed)
('sig-16', 'comp-4', 'staff-1', 'Dr. Kristina Balčiūnienė', 'signed', '2025-12-21 10:15:00'),
('sig-17', 'comp-4', 'staff-2', 'Jonas Petrauskas', 'signed', '2025-12-22 09:45:00'),
('sig-18', 'comp-4', 'staff-3', 'Eglė Ramonaitė', 'signed', '2026-01-03 11:00:00'),
('sig-19', 'comp-4', 'staff-4', 'Andrius Gudelis', 'pending', null),
('sig-20', 'comp-4', 'staff-5', 'Monika Vasiliauskienė', 'signed', '2025-12-23 14:30:00');
