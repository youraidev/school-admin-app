import { Router } from 'express';
import * as queries from '../queries';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        const students = queries.getAllStudents();
        res.json(students);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const student = queries.getStudentById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        next(error);
    }
});

export default router;
