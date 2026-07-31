import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from './index.js';
import { hashPassword } from '../auth.js';

// Fixed UUIDs so the seed is idempotent
const IDS = {
    school:   '00000000-0000-0000-0000-000000000001',
    admin:    '00000000-0000-0000-0000-000000000002',
    // Departments
    dAdmin:   '10000000-0000-0000-0000-000000000001',
    dMath:    '10000000-0000-0000-0000-000000000002',
    dLang:    '10000000-0000-0000-0000-000000000003',
    dPE:      '10000000-0000-0000-0000-000000000004',
    dPrimary: '10000000-0000-0000-0000-000000000005',
    // Staff
    s1: '20000000-0000-0000-0000-000000000001',
    s2: '20000000-0000-0000-0000-000000000002',
    s3: '20000000-0000-0000-0000-000000000003',
    s4: '20000000-0000-0000-0000-000000000004',
    s5: '20000000-0000-0000-0000-000000000005',
    // Students
    p1: '30000000-0000-0000-0000-000000000001',
    p2: '30000000-0000-0000-0000-000000000002',
    p3: '30000000-0000-0000-0000-000000000003',
    p4: '30000000-0000-0000-0000-000000000004',
    // Compliance docs
    c1: '40000000-0000-0000-0000-000000000001',
    c2: '40000000-0000-0000-0000-000000000002',
    c3: '40000000-0000-0000-0000-000000000003',
    c4: '40000000-0000-0000-0000-000000000004',
};

async function seed() {
    console.log('Seeding database...');

    // School
    await db.execute(sql`
        INSERT INTO schools (id, name, slug, plan) VALUES
        (${IDS.school}, 'Demo School', 'demo', 'trial')
        ON CONFLICT (id) DO NOTHING
    `);

    // Admin user  (email: admin@school.edu  password: Admin1234!)
    const adminHash = await hashPassword('Admin1234!');
    await db.execute(sql`
        INSERT INTO users (id, school_id, email, password_hash, role) VALUES
        (${IDS.admin}, ${IDS.school}, 'admin@school.edu', ${adminHash}, 'school_admin')
        ON CONFLICT (id) DO NOTHING
    `);

    // Departments
    await db.execute(sql`
        INSERT INTO departments (id, school_id, name, description) VALUES
        (${IDS.dAdmin},   ${IDS.school}, 'Administration',    'School administration and management'),
        (${IDS.dMath},    ${IDS.school}, 'Mathematics',       'Mathematics department'),
        (${IDS.dLang},    ${IDS.school}, 'Languages',         'Language and literature department'),
        (${IDS.dPE},      ${IDS.school}, 'Physical Education','Physical education and sports'),
        (${IDS.dPrimary}, ${IDS.school}, 'Primary Education', 'Primary school education')
        ON CONFLICT (id) DO NOTHING
    `);

    // Staff
    await db.execute(sql`
        INSERT INTO staff (id, school_id, first_name, last_name, position, role, department, email, phone, salary, salary_coefficient, start_date, qualification, rank) VALUES
        (${IDS.s1}, ${IDS.school}, 'Dr. Kristina', 'Balčiūnienė', 'Principal',    'Principal',        ${IDS.dAdmin},   'k.balciuniene@school.lt',   '+370 656 12345', 3500, 1.8,  '2014-08-01', 'PhD in Education',                  'Expert'),
        (${IDS.s2}, ${IDS.school}, 'Jonas',         'Petrauskas',  'Math Teacher', 'Math Teacher',     ${IDS.dMath},    'j.petrauskas@school.lt',    '+370 667 23456', 2200, 1.4,  '2018-09-01', 'Master in Mathematics',             'Senior'),
        (${IDS.s3}, ${IDS.school}, 'Eglė',          'Ramonaitė',   'Teacher',      'Lithuanian Teacher',${IDS.dLang},  'e.ramonaite@school.lt',     '+370 678 34567', 2000, 1.3,  '2020-09-01', 'Master in Lithuanian Philology',    'Specialist'),
        (${IDS.s4}, ${IDS.school}, 'Andrius',       'Gudelis',     'PE Teacher',   'PE Teacher',       ${IDS.dPE},      'a.gudelis@school.lt',       '+370 689 45678', 1900, 1.2,  '2019-09-01', 'Bachelor in Sports Science',        'Specialist'),
        (${IDS.s5}, ${IDS.school}, 'Monika',        'Vasiliauskienė','Teacher',    'Class Mentor',     ${IDS.dPrimary}, 'm.vasiliauskiene@school.lt','+370 690 56789', 2100, 1.35, '2017-09-01', 'Master in Primary Education',       'Senior')
        ON CONFLICT (id) DO NOTHING
    `);

    // Staff qualifications
    await db.execute(sql`
        INSERT INTO staff_qualifications (staff_id, degree_type, field_of_study, institution, year) VALUES
        (${IDS.s1}, 'Doctor of Education (Ed.D)', 'Education Leadership', 'Vilnius University', 2010),
        (${IDS.s2}, 'Master of Education (M.Ed)', 'Mathematics',          'Kaunas University of Technology', 2016),
        (${IDS.s3}, 'Master''s Degree',           'Lithuanian Philology', 'Vilnius University', 2019),
        (${IDS.s4}, 'Bachelor''s Degree',          'Sports Science',       'Lithuanian Sports University', 2018),
        (${IDS.s5}, 'Master of Education (M.Ed)', 'Primary Education',    'Šiauliai University', 2015)
        ON CONFLICT DO NOTHING
    `);

    // Staff emergency contacts
    await db.execute(sql`
        INSERT INTO emergency_contacts (id, school_id, staff_id, name, phone, relation, is_primary) VALUES
        ('50000000-0000-0000-0000-000000000001', ${IDS.school}, ${IDS.s1}, 'Mindaugas Balčiūnas',  '+370 656 12346', 'Spouse', true),
        ('50000000-0000-0000-0000-000000000002', ${IDS.school}, ${IDS.s2}, 'Ingrida Petrauskienė', '+370 667 23457', 'Spouse', true),
        ('50000000-0000-0000-0000-000000000003', ${IDS.school}, ${IDS.s3}, 'Tomas Ramonas',        '+370 678 34568', 'Spouse', true),
        ('50000000-0000-0000-0000-000000000004', ${IDS.school}, ${IDS.s4}, 'Rūta Gudelienė',       '+370 689 45679', 'Spouse', true),
        ('50000000-0000-0000-0000-000000000005', ${IDS.school}, ${IDS.s5}, 'Darius Vasiliauskas',  '+370 690 56790', 'Spouse', true)
        ON CONFLICT (id) DO NOTHING
    `);

    // Certificates
    await db.execute(sql`
        INSERT INTO certificates (id, school_id, staff_id, name, issuer, date) VALUES
        ('60000000-0000-0000-0000-000000000001', ${IDS.school}, ${IDS.s1}, 'School Leadership Certificate',  'National Education Agency',    '2016-06-15'),
        ('60000000-0000-0000-0000-000000000002', ${IDS.school}, ${IDS.s1}, 'Crisis Management Training',     'Ministry of Education',        '2020-03-10'),
        ('60000000-0000-0000-0000-000000000003', ${IDS.school}, ${IDS.s2}, 'Advanced Mathematics Pedagogy',  'Teachers Development Institute','2021-05-20'),
        ('60000000-0000-0000-0000-000000000004', ${IDS.school}, ${IDS.s3}, 'Lithuanian Language Certification','State Language Center',       '2022-09-01'),
        ('60000000-0000-0000-0000-000000000005', ${IDS.school}, ${IDS.s4}, 'First Aid and CPR',              'Red Cross',                    '2024-01-15')
        ON CONFLICT (id) DO NOTHING
    `);

    // Course evaluations
    await db.execute(sql`
        INSERT INTO course_evaluations (id, school_id, staff_id, course_name, rating, feedback, date) VALUES
        ('70000000-0000-0000-0000-000000000001', ${IDS.school}, ${IDS.s2}, 'Algebra Fundamentals - Grade 8',    4.8, 'Excellent explanation of complex concepts.', '2024-06-15'),
        ('70000000-0000-0000-0000-000000000002', ${IDS.school}, ${IDS.s2}, 'Geometry - Grade 7',               4.5, 'Engaging teaching methods.',                  '2024-06-15'),
        ('70000000-0000-0000-0000-000000000003', ${IDS.school}, ${IDS.s3}, 'Lithuanian Literature - Grade 10', 4.9, 'Outstanding enthusiasm.',                     '2024-06-15'),
        ('70000000-0000-0000-0000-000000000004', ${IDS.school}, ${IDS.s4}, 'Physical Education - Grade 6',     4.6, 'Great energy and student engagement.',        '2024-06-15'),
        ('70000000-0000-0000-0000-000000000005', ${IDS.school}, ${IDS.s5}, 'Primary Class Management - Grade 3',4.7, 'Caring approach and excellent classroom management.','2024-06-15')
        ON CONFLICT (id) DO NOTHING
    `);

    // Extra duties
    await db.execute(sql`
        INSERT INTO extra_duties (id, school_id, staff_id, duty_name) VALUES
        ('80000000-0000-0000-0000-000000000001', ${IDS.school}, ${IDS.s1}, 'School Board Representative'),
        ('80000000-0000-0000-0000-000000000002', ${IDS.school}, ${IDS.s1}, 'Budget Committee Chair'),
        ('80000000-0000-0000-0000-000000000003', ${IDS.school}, ${IDS.s2}, 'Math Olympiad Coordinator'),
        ('80000000-0000-0000-0000-000000000004', ${IDS.school}, ${IDS.s3}, 'School Newspaper Advisor'),
        ('80000000-0000-0000-0000-000000000005', ${IDS.school}, ${IDS.s4}, 'Sports Day Organizer'),
        ('80000000-0000-0000-0000-000000000006', ${IDS.school}, ${IDS.s5}, 'Parent-Teacher Association Liaison')
        ON CONFLICT (id) DO NOTHING
    `);

    // Students
    await db.execute(sql`
        INSERT INTO students (id, school_id, name, class_name, birth_date, health_status, medical_support, contract_status, contract_start_date, contract_end_date, is_paid) VALUES
        (${IDS.p1}, ${IDS.school}, 'Emma Johansson',   'Grade 5A', '2015-03-15', 'Good', 'Carries EpiPen for peanut allergy',      'active',  '2024-09-01', '2025-06-30', true),
        (${IDS.p2}, ${IDS.school}, 'Lucas Petrovas',   'Grade 4B', '2016-05-22', 'Good', null,                                     'active',  '2024-09-01', '2025-06-30', true),
        (${IDS.p3}, ${IDS.school}, 'Sofia Andersson',  'Grade 3C', '2017-08-10', 'Good', null,                                     'pending', '2024-09-01', '2025-06-30', false),
        (${IDS.p4}, ${IDS.school}, 'Matas Kazlauskas', 'Grade 6A', '2014-11-28', 'Good', 'Celiac disease - strict gluten-free diet','active', '2024-09-01', '2025-06-30', true)
        ON CONFLICT (id) DO NOTHING
    `);

    // Allergies
    await db.execute(sql`
        INSERT INTO allergies (id, school_id, student_id, name, severity, notes) VALUES
        ('90000000-0000-0000-0000-000000000001', ${IDS.school}, ${IDS.p1}, 'Peanuts',   'life-threatening', 'Carries EpiPen at all times.'),
        ('90000000-0000-0000-0000-000000000002', ${IDS.school}, ${IDS.p1}, 'Dust',      'low',              'Minimal impact.'),
        ('90000000-0000-0000-0000-000000000003', ${IDS.school}, ${IDS.p2}, 'Bee stings','medium',           'Monitor for swelling.'),
        ('90000000-0000-0000-0000-000000000004', ${IDS.school}, ${IDS.p4}, 'Gluten',    'life-threatening', 'Celiac disease. Strict gluten-free diet required.')
        ON CONFLICT (id) DO NOTHING
    `);

    // Student emergency contacts
    await db.execute(sql`
        INSERT INTO emergency_contacts (id, school_id, student_id, name, phone, relation, is_primary) VALUES
        ('a0000000-0000-0000-0000-000000000001', ${IDS.school}, ${IDS.p1}, 'Maria Johansson',       '+370 612 34567', 'Mother', true),
        ('a0000000-0000-0000-0000-000000000002', ${IDS.school}, ${IDS.p1}, 'Erik Johansson',        '+370 612 34568', 'Father', false),
        ('a0000000-0000-0000-0000-000000000003', ${IDS.school}, ${IDS.p2}, 'Rasa Petrovienė',       '+370 623 45678', 'Mother', true),
        ('a0000000-0000-0000-0000-000000000004', ${IDS.school}, ${IDS.p3}, 'Anna Andersson',        '+370 634 56789', 'Mother', true),
        ('a0000000-0000-0000-0000-000000000005', ${IDS.school}, ${IDS.p4}, 'Jūratė Kazlauskienė',  '+370 645 67890', 'Mother', true),
        ('a0000000-0000-0000-0000-000000000006', ${IDS.school}, ${IDS.p4}, 'Vytautas Kazlauskas',  '+370 645 67891', 'Father', false)
        ON CONFLICT (id) DO NOTHING
    `);

    // Document checklist
    await db.execute(sql`
        INSERT INTO document_checklist (id, school_id, student_id, name, is_complete, due_date) VALUES
        ('b0000000-0000-0000-0000-000000000001', ${IDS.school}, ${IDS.p1}, 'Ugdymo sutartis',                                           true,  '2024-09-15'),
        ('b0000000-0000-0000-0000-000000000002', ${IDS.school}, ${IDS.p1}, 'Priedas prie ugdymo sutarties (dėl kainos pasikeitimo)',    true,  '2024-09-15'),
        ('b0000000-0000-0000-0000-000000000003', ${IDS.school}, ${IDS.p1}, 'Skubaus kontakto forma',                                    false, '2024-09-30'),
        ('b0000000-0000-0000-0000-000000000004', ${IDS.school}, ${IDS.p2}, 'Ugdymo sutartis',                                           true,  '2024-09-15'),
        ('b0000000-0000-0000-0000-000000000005', ${IDS.school}, ${IDS.p2}, 'Priedas prie ugdymo sutarties (dėl kainos pasikeitimo)',    true,  '2024-09-15'),
        ('b0000000-0000-0000-0000-000000000006', ${IDS.school}, ${IDS.p3}, 'Ugdymo sutartis',                                           true,  '2024-09-15'),
        ('b0000000-0000-0000-0000-000000000007', ${IDS.school}, ${IDS.p3}, 'Priedas prie ugdymo sutarties (dėl kainos pasikeitimo)',    false, '2024-09-30'),
        ('b0000000-0000-0000-0000-000000000008', ${IDS.school}, ${IDS.p4}, 'Ugdymo sutartis',                                           true,  '2024-09-15'),
        ('b0000000-0000-0000-0000-000000000009', ${IDS.school}, ${IDS.p4}, 'Priedas prie ugdymo sutarties (dėl kainos pasikeitimo)',    true,  '2024-09-15')
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, is_complete = EXCLUDED.is_complete, due_date = EXCLUDED.due_date
    `);

    // Agreements
    await db.execute(sql`
        INSERT INTO agreements (id, school_id, student_id, type, name, status, signed_date) VALUES
        ('c0000000-0000-0000-0000-000000000001', ${IDS.school}, ${IDS.p1}, 'photography',    'Sutikimas dėl fotografavimo',                           'galioja',     '2024-09-01'),
        ('c0000000-0000-0000-0000-000000000002', ${IDS.school}, ${IDS.p1}, 'travel',         'Sutikimas dėl vaiko išvykų / ekskursijų',               'galioja',     '2024-09-01'),
        ('c0000000-0000-0000-0000-000000000003', ${IDS.school}, ${IDS.p1}, 'pediculosis',    'Sutikimas dėl pedikuliozės patikros',                   'nepasirašyta', null),
        ('c0000000-0000-0000-0000-000000000004', ${IDS.school}, ${IDS.p1}, 'self_departure', 'Sutikimas dėl vaiko savarankiško išėjimo iš mokyklos',  'nepasirašyta', null),
        ('c0000000-0000-0000-0000-000000000005', ${IDS.school}, ${IDS.p2}, 'photography',    'Sutikimas dėl fotografavimo',                           'galioja',     '2024-09-01'),
        ('c0000000-0000-0000-0000-000000000006', ${IDS.school}, ${IDS.p2}, 'travel',         'Sutikimas dėl vaiko išvykų / ekskursijų',               'galioja',     '2024-09-01'),
        ('c0000000-0000-0000-0000-000000000007', ${IDS.school}, ${IDS.p2}, 'pediculosis',    'Sutikimas dėl pedikuliozės patikros',                   'galioja',     '2024-09-01'),
        ('c0000000-0000-0000-0000-000000000008', ${IDS.school}, ${IDS.p2}, 'self_departure', 'Sutikimas dėl vaiko savarankiško išėjimo iš mokyklos',  'nepasirašyta', null),
        ('c0000000-0000-0000-0000-000000000009', ${IDS.school}, ${IDS.p3}, 'photography',    'Sutikimas dėl fotografavimo',                           'nepasirašyta', null),
        ('c0000000-0000-0000-0000-000000000010', ${IDS.school}, ${IDS.p3}, 'travel',         'Sutikimas dėl vaiko išvykų / ekskursijų',               'nepasirašyta', null),
        ('c0000000-0000-0000-0000-000000000011', ${IDS.school}, ${IDS.p3}, 'pediculosis',    'Sutikimas dėl pedikuliozės patikros',                   'nepasirašyta', null),
        ('c0000000-0000-0000-0000-000000000012', ${IDS.school}, ${IDS.p3}, 'self_departure', 'Sutikimas dėl vaiko savarankiško išėjimo iš mokyklos',  'nepasirašyta', null),
        ('c0000000-0000-0000-0000-000000000013', ${IDS.school}, ${IDS.p4}, 'photography',    'Sutikimas dėl fotografavimo',                           'galioja',     '2024-09-01'),
        ('c0000000-0000-0000-0000-000000000014', ${IDS.school}, ${IDS.p4}, 'travel',         'Sutikimas dėl vaiko išvykų / ekskursijų',               'galioja',     '2024-09-01'),
        ('c0000000-0000-0000-0000-000000000015', ${IDS.school}, ${IDS.p4}, 'pediculosis',    'Sutikimas dėl pedikuliozės patikros',                   'galioja',     '2024-09-01'),
        ('c0000000-0000-0000-0000-000000000016', ${IDS.school}, ${IDS.p4}, 'self_departure', 'Sutikimas dėl vaiko savarankiško išėjimo iš mokyklos',  'galioja',     '2024-09-01')
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, signed_date = EXCLUDED.signed_date
    `);

    // Authorized pickup
    await db.execute(sql`
        INSERT INTO authorized_pickup (id, school_id, student_id, name, phone, relation) VALUES
        ('d0000000-0000-0000-0000-000000000001', ${IDS.school}, ${IDS.p1}, 'Maria Johansson',      '+370 612 34567', 'Mother'),
        ('d0000000-0000-0000-0000-000000000002', ${IDS.school}, ${IDS.p1}, 'Erik Johansson',       '+370 612 34568', 'Father'),
        ('d0000000-0000-0000-0000-000000000003', ${IDS.school}, ${IDS.p2}, 'Rasa Petrovienė',      '+370 623 45678', 'Mother'),
        ('d0000000-0000-0000-0000-000000000004', ${IDS.school}, ${IDS.p4}, 'Jūratė Kazlauskienė', '+370 645 67890', 'Mother')
        ON CONFLICT (id) DO NOTHING
    `);

    // Compliance documents
    await db.execute(sql`
        INSERT INTO compliance_documents (id, school_id, title, description, version, upload_date, due_date, target_audience) VALUES
        (${IDS.c1}, ${IDS.school}, 'Internal Work Rules 2026',      'Updated internal work regulations including remote work policies.', 'v2.1', '2026-01-15', '2026-02-01', 'all'),
        (${IDS.c2}, ${IDS.school}, 'Fire Safety Protocol',           'Annual fire safety procedures and evacuation routes.',             'v1.3', '2026-01-10', '2026-02-15', 'all'),
        (${IDS.c3}, ${IDS.school}, 'GDPR Data Protection Guidelines','Updated guidelines for handling personal data per GDPR.',          'v3.0', '2026-01-05', '2026-01-31', 'all'),
        (${IDS.c4}, ${IDS.school}, 'Student Supervision Standards',  'Standards and protocols for student supervision.',                 'v2.0', '2025-12-20', '2026-01-20', 'all')
        ON CONFLICT (id) DO NOTHING
    `);

    // Document signatures
    await db.execute(sql`
        INSERT INTO document_signatures (id, school_id, document_id, staff_id, staff_name, status, signed_at) VALUES
        ('e0000000-0000-0000-0000-000000000001', ${IDS.school}, ${IDS.c1}, ${IDS.s1}, 'Dr. Kristina Balčiūnienė','signed', '2026-01-16 10:30:00'),
        ('e0000000-0000-0000-0000-000000000002', ${IDS.school}, ${IDS.c1}, ${IDS.s2}, 'Jonas Petrauskas',         'signed', '2026-01-17 09:15:00'),
        ('e0000000-0000-0000-0000-000000000003', ${IDS.school}, ${IDS.c1}, ${IDS.s3}, 'Eglė Ramonaitė',           'pending',null),
        ('e0000000-0000-0000-0000-000000000004', ${IDS.school}, ${IDS.c1}, ${IDS.s4}, 'Andrius Gudelis',          'pending',null),
        ('e0000000-0000-0000-0000-000000000005', ${IDS.school}, ${IDS.c1}, ${IDS.s5}, 'Monika Vasiliauskienė',    'signed', '2026-01-18 14:20:00'),
        ('e0000000-0000-0000-0000-000000000006', ${IDS.school}, ${IDS.c2}, ${IDS.s1}, 'Dr. Kristina Balčiūnienė','signed', '2026-01-11 08:45:00'),
        ('e0000000-0000-0000-0000-000000000007', ${IDS.school}, ${IDS.c2}, ${IDS.s2}, 'Jonas Petrauskas',         'signed', '2026-01-11 11:20:00'),
        ('e0000000-0000-0000-0000-000000000008', ${IDS.school}, ${IDS.c2}, ${IDS.s3}, 'Eglė Ramonaitė',           'signed', '2026-01-12 09:30:00'),
        ('e0000000-0000-0000-0000-000000000009', ${IDS.school}, ${IDS.c2}, ${IDS.s4}, 'Andrius Gudelis',          'signed', '2026-01-12 13:15:00'),
        ('e0000000-0000-0000-0000-000000000010', ${IDS.school}, ${IDS.c2}, ${IDS.s5}, 'Monika Vasiliauskienė',    'signed', '2026-01-13 10:00:00'),
        ('e0000000-0000-0000-0000-000000000011', ${IDS.school}, ${IDS.c3}, ${IDS.s1}, 'Dr. Kristina Balčiūnienė','signed', '2026-01-06 09:00:00'),
        ('e0000000-0000-0000-0000-000000000012', ${IDS.school}, ${IDS.c3}, ${IDS.s2}, 'Jonas Petrauskas',         'pending',null),
        ('e0000000-0000-0000-0000-000000000013', ${IDS.school}, ${IDS.c3}, ${IDS.s3}, 'Eglė Ramonaitė',           'pending',null),
        ('e0000000-0000-0000-0000-000000000014', ${IDS.school}, ${IDS.c3}, ${IDS.s4}, 'Andrius Gudelis',          'signed', '2026-01-07 15:30:00'),
        ('e0000000-0000-0000-0000-000000000015', ${IDS.school}, ${IDS.c3}, ${IDS.s5}, 'Monika Vasiliauskienė',    'pending',null),
        ('e0000000-0000-0000-0000-000000000016', ${IDS.school}, ${IDS.c4}, ${IDS.s1}, 'Dr. Kristina Balčiūnienė','signed', '2025-12-21 10:15:00'),
        ('e0000000-0000-0000-0000-000000000017', ${IDS.school}, ${IDS.c4}, ${IDS.s2}, 'Jonas Petrauskas',         'signed', '2025-12-22 09:45:00'),
        ('e0000000-0000-0000-0000-000000000018', ${IDS.school}, ${IDS.c4}, ${IDS.s3}, 'Eglė Ramonaitė',           'signed', '2026-01-03 11:00:00'),
        ('e0000000-0000-0000-0000-000000000019', ${IDS.school}, ${IDS.c4}, ${IDS.s4}, 'Andrius Gudelis',          'pending',null),
        ('e0000000-0000-0000-0000-000000000020', ${IDS.school}, ${IDS.c4}, ${IDS.s5}, 'Monika Vasiliauskienė',    'signed', '2025-12-23 14:30:00')
        ON CONFLICT (id) DO NOTHING
    `);

    console.log('Seed complete.');
    console.log('Login: admin@school.edu / Admin1234!');
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
