import { Router } from 'express';
import * as queries from '../queries';

const router = Router();

router.get('/stats', async (req, res, next) => {
    try {
        const stats = queries.getDashboardStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

router.get('/critical-allergies', async (req, res, next) => {
    try {
        const allergies = queries.getCriticalAllergies();
        res.json(allergies);
    } catch (error) {
        next(error);
    }
});

router.get('/contract-issues', async (req, res, next) => {
    try {
        const issues = queries.getContractIssues();
        res.json(issues);
    } catch (error) {
        next(error);
    }
});

router.get('/pending-signatures', async (req, res, next) => {
    try {
        const signatures = queries.getPendingSignatures();
        res.json(signatures);
    } catch (error) {
        next(error);
    }
});

export default router;
