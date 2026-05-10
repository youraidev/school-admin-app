import express from 'express';
import * as queries from '../queries';

const router = express.Router();

router.get('/', (req, res, next) => {
    try {
        const departments = queries.getAllDepartments();
        res.json(departments);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', (req, res, next) => {
    try {
        const department = queries.getDepartmentById(req.params.id);
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json(department);
    } catch (error) {
        next(error);
    }
});

router.post('/', (req, res, next) => {
    try {
        const department = queries.addDepartment(req.body);
        res.status(201).json(department);
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            return res.status(409).json({ error: error.message });
        }
        if (error.message.includes('required') || error.message.includes('exceeds')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

router.put('/:id', (req, res, next) => {
    try {
        const department = queries.updateDepartment(req.params.id, req.body);
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json(department);
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            return res.status(409).json({ error: error.message });
        }
        if (error.message.includes('required') || error.message.includes('exceeds')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

router.delete('/:id', (req, res, next) => {
    try {
        queries.deleteDepartment(req.params.id);
        res.status(204).end();
    } catch (error: any) {
        if (error.message.includes('Cannot delete department')) {
            return res.status(409).json({ error: error.message });
        }
        next(error);
    }
});

export default router;
