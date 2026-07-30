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
        if (!student) return res.status(404).json({ error: 'STUDENT_NOT_FOUND' });
        res.json(student);
    } catch (error) { next(error); }
});

router.patch('/:studentId/pickup/:pickupId', async (req, res, next) => {
    try {
        const { notes } = req.body as { notes?: unknown };
        if (typeof notes !== 'string') {
            return res.status(400).json({ error: 'NOTES_INVALID' });
        }
        const trimmedNotes = notes.trim();
        if (trimmedNotes.length > 500) {
            return res.status(400).json({ error: 'NOTES_TOO_LONG' });
        }
        const updated = await queries.updatePickupNotes(
            req.user!.schoolId,
            req.params.studentId,
            req.params.pickupId,
            trimmedNotes,
        );
        if (!updated) return res.status(404).json({ error: 'PICKUP_NOT_FOUND' });
        res.json({ notes: trimmedNotes });
    } catch (error) { next(error); }
});

export default router;
