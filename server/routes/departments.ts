import { Router } from 'express';
import * as queries from '../queries.js';
import { requireRole } from '../middleware/authenticate.js';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        res.json(await queries.getAllDepartments(req.user!.schoolId));
    } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
    try {
        const department = await queries.getDepartmentById(req.user!.schoolId, req.params.id as string);
        if (!department) return res.status(404).json({ error: 'Department not found' });
        res.json(department);
    } catch (error) { next(error); }
});

router.post('/', requireRole('school_admin', 'super_admin'), async (req, res, next) => {
    try {
        res.status(201).json(await queries.addDepartment(req.user!.schoolId, req.body));
    } catch (error: any) {
        if (error.message?.includes('already exists')) return res.status(409).json({ error: error.message });
        if (error.message?.includes('required') || error.message?.includes('exceeds')) return res.status(400).json({ error: error.message });
        next(error);
    }
});

router.put('/:id', requireRole('school_admin', 'super_admin'), async (req, res, next) => {
    try {
        const department = await queries.updateDepartment(req.user!.schoolId, req.params.id as string, req.body);
        if (!department) return res.status(404).json({ error: 'Department not found' });
        res.json(department);
    } catch (error: any) {
        if (error.message?.includes('already exists')) return res.status(409).json({ error: error.message });
        if (error.message?.includes('required') || error.message?.includes('exceeds')) return res.status(400).json({ error: error.message });
        next(error);
    }
});

router.delete('/:id', requireRole('school_admin', 'super_admin'), async (req, res, next) => {
    try {
        await queries.deleteDepartment(req.user!.schoolId, req.params.id as string);
        res.status(204).end();
    } catch (error: any) {
        if (error.message?.includes('Cannot delete department')) return res.status(409).json({ error: error.message });
        next(error);
    }
});

export default router;
