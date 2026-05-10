import { Router } from 'express';
import * as queries from '../queries';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        const staff = queries.getAllStaff();
        res.json(staff);
    } catch (error) {
        next(error);
    }
});

// New endpoint for autosuggestion
router.get('/qualifications/suggestions', async (req, res, next) => {
    try {
        const suggestions = queries.getQualificationSuggestions();
        res.json(suggestions);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const staffMember = queries.getStaffById(req.params.id);
        if (!staffMember) {
            return res.status(404).json({ error: 'Staff member not found' });
        }
        res.json(staffMember);
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { firstName, lastName, email, role, department, position, rank, photoUrl, startDate, qualifications } = req.body;

        // Basic validation
        if (!firstName || !lastName || !email || !role || !department || !startDate || !position) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate qualifications if provided
        if (qualifications && Array.isArray(qualifications)) {
            for (const qual of qualifications) {
                if (!qual.degreeType || !qual.fieldOfStudy || !qual.institution) {
                    return res.status(400).json({ error: 'Qualification must include degree type, field of study, and institution' });
                }
                if (qual.year && (qual.year < 1950 || qual.year > 2100)) {
                    return res.status(400).json({ error: 'Qualification year must be between 1950 and 2100' });
                }
            }
        }

        const newStaff = queries.addStaff({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email,
            role,
            department,
            position,
            rank,
            photoUrl,
            startDate,
            qualifications: qualifications || [],
        });

        res.status(201).json(newStaff);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { firstName, lastName, email, role, department, position, rank, photoUrl, startDate, qualifications } = req.body;

        if (!firstName || !lastName || !email || !role || !department || !startDate || !position) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate qualifications if provided
        if (qualifications && Array.isArray(qualifications)) {
            for (const qual of qualifications) {
                if (!qual.degreeType || !qual.fieldOfStudy || !qual.institution) {
                    return res.status(400).json({ error: 'Qualification must include degree type, field of study, and institution' });
                }
                if (qual.year && (qual.year < 1950 || qual.year > 2100)) {
                    return res.status(400).json({ error: 'Qualification year must be between 1950 and 2100' });
                }
            }
        }

        const updatedStaff = queries.updateStaff(req.params.id, {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email,
            role,
            department,
            position,
            rank,
            photoUrl,
            startDate,
            qualifications: qualifications || [],
        });

        if (!updatedStaff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        res.json(updatedStaff);
    } catch (error) {
        console.error("PUT /api/staff/:id Error:", error);
        next(error);
    }
});

router.put('/:id/certificates', async (req, res, next) => {
    try {
        const { certificates } = req.body;

        if (!Array.isArray(certificates)) {
            return res.status(400).json({ error: 'certificates must be an array' });
        }

        for (const cert of certificates) {
            if (!cert.name || !cert.issuer || !cert.date) {
                return res.status(400).json({ error: 'Each certificate must have name, issuer, and date' });
            }
        }

        const updated = queries.updateCertificates(req.params.id, certificates);
        res.json(updated);
    } catch (error) {
        next(error);
    }
});

router.put('/:id/evaluations', async (req, res, next) => {
    try {
        const { evaluations } = req.body;
        if (!Array.isArray(evaluations)) {
            return res.status(400).json({ error: 'evaluations must be an array' });
        }
        for (const ev of evaluations) {
            if (!ev.courseName || ev.rating == null || !ev.date) {
                return res.status(400).json({ error: 'Each evaluation must have courseName, rating, and date' });
            }
            if (ev.rating < 0 || ev.rating > 5) {
                return res.status(400).json({ error: 'Rating must be between 0 and 5' });
            }
        }
        const updated = queries.updateCourseEvaluations(req.params.id, evaluations);
        res.json(updated);
    } catch (error) {
        next(error);
    }
});

export default router;
