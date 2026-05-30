import { Router } from 'express';
import * as queries from '../queries.js';

const router = Router();

router.get('/stats', async (req, res, next) => {
    try {
        res.json(await queries.getStudentStats(req.user!.schoolId));
    } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
    try {
        res.json(await queries.getAllStudents(req.user!.schoolId));
    } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
    try {
        const student = await queries.getStudentById(req.user!.schoolId, req.params.id as string);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    } catch (error) { next(error); }
});

router.patch('/:studentId/pickup/:pickupId', async (req, res, next) => {
    try {
        const { notes } = req.body as { notes?: unknown };
        if (typeof notes !== 'string') {
            return res.status(400).json({ error: 'notes must be a string' });
        }
        if (notes.length > 500) {
            return res.status(400).json({ error: 'notes must be 500 characters or fewer' });
        }
        const updated = await queries.updatePickupNotes(
            req.user!.schoolId,
            req.params.studentId,
            req.params.pickupId,
            notes,
        );
        if (!updated) return res.status(404).json({ error: 'Pickup record not found' });
        res.json({ notes });
    } catch (error) { next(error); }
});

export default router;
