import { Router } from 'express';
import * as queries from '../queries.js';
import { requireRole } from '../middleware/authenticate.js';

const router = Router();

// queries.ts throws Errors whose message is a stable code; map them to HTTP statuses
const DEPARTMENT_ERROR_STATUS: Record<string, number> = {
    DEPARTMENT_NAME_REQUIRED: 400,
    DEPARTMENT_NAME_TOO_LONG: 400,
    DEPARTMENT_DESCRIPTION_TOO_LONG: 400,
    DEPARTMENT_NAME_TAKEN: 409,
    DEPARTMENT_HAS_STAFF: 409,
};

function handleDepartmentError(error: unknown, res: import('express').Response): boolean {
    const code = error instanceof Error ? error.message : '';
    const status = DEPARTMENT_ERROR_STATUS[code];
    if (status) {
        res.status(status).json({ error: code });
        return true;
    }
    return false;
}

router.get('/', async (req, res, next) => {
    try {
        res.json(await queries.getAllDepartments(req.user!.schoolId));
    } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
    try {
        const department = await queries.getDepartmentById(req.user!.schoolId, req.params.id as string);
        if (!department) return res.status(404).json({ error: 'DEPARTMENT_NOT_FOUND' });
        res.json(department);
    } catch (error) { next(error); }
});

router.post('/', requireRole('school_admin', 'super_admin'), async (req, res, next) => {
    try {
        res.status(201).json(await queries.addDepartment(req.user!.schoolId, req.body));
    } catch (error) {
        if (handleDepartmentError(error, res)) return;
        next(error);
    }
});

router.put('/:id', requireRole('school_admin', 'super_admin'), async (req, res, next) => {
    try {
        const department = await queries.updateDepartment(req.user!.schoolId, req.params.id as string, req.body);
        if (!department) return res.status(404).json({ error: 'DEPARTMENT_NOT_FOUND' });
        res.json(department);
    } catch (error) {
        if (handleDepartmentError(error, res)) return;
        next(error);
    }
});

router.delete('/:id', requireRole('school_admin', 'super_admin'), async (req, res, next) => {
    try {
        await queries.deleteDepartment(req.user!.schoolId, req.params.id as string);
        res.status(204).end();
    } catch (error) {
        if (handleDepartmentError(error, res)) return;
        next(error);
    }
});

export default router;
