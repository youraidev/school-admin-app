import { Router } from 'express';
import * as queries from '../queries.js';
import { requireRole } from '../middleware/authenticate.js';

const router = Router();

// queries.ts throws Errors whose message is a stable code; map them to HTTP statuses
function handleStaffError(error: unknown, res: import('express').Response): boolean {
    const code = error instanceof Error ? error.message : '';
    if (code === 'STAFF_EMAIL_TAKEN') { res.status(409).json({ error: code }); return true; }
    if (code === 'STAFF_NOT_FOUND')   { res.status(404).json({ error: code }); return true; }
    return false;
}

router.get('/', async (req, res, next) => {
    try {
        res.json(await queries.getAllStaff(req.user!.schoolId));
    } catch (error) { next(error); }
});

router.get('/qualifications/suggestions', async (req, res, next) => {
    try {
        res.json(await queries.getQualificationSuggestions(req.user!.schoolId));
    } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
    try {
        const staffMember = await queries.getStaffById(req.user!.schoolId, req.params.id as string);
        if (!staffMember) return res.status(404).json({ error: 'STAFF_NOT_FOUND' });
        res.json(staffMember);
    } catch (error) { next(error); }
});

router.post('/', requireRole('school_admin', 'super_admin'), async (req, res, next) => {
    try {
        const { firstName, lastName, email, role, department, position, rank, photoUrl, startDate, qualifications } = req.body;

        if (!firstName || !lastName || !email || !role || !department || !startDate || !position) {
            return res.status(400).json({ error: 'MISSING_REQUIRED_FIELDS' });
        }

        if (qualifications && Array.isArray(qualifications)) {
            for (const qual of qualifications) {
                if (!qual.degreeType || !qual.fieldOfStudy || !qual.institution) {
                    return res.status(400).json({ error: 'QUALIFICATION_FIELDS_REQUIRED' });
                }
                if (qual.year && (qual.year < 1950 || qual.year > 2100)) {
                    return res.status(400).json({ error: 'QUALIFICATION_YEAR_INVALID' });
                }
            }
        }

        const newStaff = await queries.addStaff(req.user!.schoolId, {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email, role, department, position, rank, photoUrl, startDate,
            qualifications: qualifications || [],
        });

        res.status(201).json(newStaff);
    } catch (error) {
        if (handleStaffError(error, res)) return;
        next(error);
    }
});

router.put('/:id', requireRole('school_admin', 'super_admin'), async (req, res, next) => {
    try {
        const { firstName, lastName, email, role, department, position, rank, photoUrl, startDate, qualifications } = req.body;

        if (!firstName || !lastName || !email || !role || !department || !startDate || !position) {
            return res.status(400).json({ error: 'MISSING_REQUIRED_FIELDS' });
        }

        if (qualifications && Array.isArray(qualifications)) {
            for (const qual of qualifications) {
                if (!qual.degreeType || !qual.fieldOfStudy || !qual.institution) {
                    return res.status(400).json({ error: 'QUALIFICATION_FIELDS_REQUIRED' });
                }
                if (qual.year && (qual.year < 1950 || qual.year > 2100)) {
                    return res.status(400).json({ error: 'QUALIFICATION_YEAR_INVALID' });
                }
            }
        }

        const updatedStaff = await queries.updateStaff(req.user!.schoolId, req.params.id as string, {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email, role, department, position, rank, photoUrl, startDate,
            qualifications: qualifications || [],
        });

        if (!updatedStaff) return res.status(404).json({ error: 'STAFF_NOT_FOUND' });
        res.json(updatedStaff);
    } catch (error) {
        console.error('PUT /api/staff/:id Error:', error);
        if (handleStaffError(error, res)) return;
        next(error);
    }
});

router.put('/:id/certificates', requireRole('school_admin', 'super_admin'), async (req, res, next) => {
    try {
        const { certificates } = req.body;
        if (!Array.isArray(certificates)) {
            return res.status(400).json({ error: 'CERTIFICATES_INVALID' });
        }
        for (const cert of certificates) {
            if (!cert.name || !cert.issuer || !cert.date) {
                return res.status(400).json({ error: 'CERTIFICATE_FIELDS_REQUIRED' });
            }
        }
        res.json(await queries.updateCertificates(req.user!.schoolId, req.params.id as string, certificates));
    } catch (error) {
        if (handleStaffError(error, res)) return;
        next(error);
    }
});

router.put('/:id/evaluations', requireRole('school_admin', 'super_admin'), async (req, res, next) => {
    try {
        const { evaluations } = req.body;
        if (!Array.isArray(evaluations)) {
            return res.status(400).json({ error: 'EVALUATIONS_INVALID' });
        }
        for (const ev of evaluations) {
            if (!ev.courseName || ev.rating == null || !ev.date) {
                return res.status(400).json({ error: 'EVALUATION_FIELDS_REQUIRED' });
            }
            if (ev.rating < 0 || ev.rating > 5) {
                return res.status(400).json({ error: 'RATING_OUT_OF_RANGE' });
            }
        }
        res.json(await queries.updateCourseEvaluations(req.user!.schoolId, req.params.id as string, evaluations));
    } catch (error) {
        if (handleStaffError(error, res)) return;
        next(error);
    }
});

export default router;
