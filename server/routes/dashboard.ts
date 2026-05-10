import { Router } from 'express';
import * as queries from '../queries.js';

const router = Router();

router.get('/stats', async (req, res, next) => {
    try {
        res.json(await queries.getDashboardStats(req.user!.schoolId));
    } catch (error) { next(error); }
});

router.get('/critical-allergies', async (req, res, next) => {
    try {
        res.json(await queries.getCriticalAllergies(req.user!.schoolId));
    } catch (error) { next(error); }
});

router.get('/contract-issues', async (req, res, next) => {
    try {
        res.json(await queries.getContractIssues(req.user!.schoolId));
    } catch (error) { next(error); }
});

router.get('/pending-signatures', async (req, res, next) => {
    try {
        res.json(await queries.getPendingSignatures(req.user!.schoolId));
    } catch (error) { next(error); }
});

export default router;
