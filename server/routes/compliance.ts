import { Router } from 'express';
import * as queries from '../queries.js';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        res.json(await queries.getAllComplianceDocuments(req.user!.schoolId));
    } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
    try {
        const document = await queries.getComplianceDocumentById(req.user!.schoolId, req.params.id as string);
        if (!document) return res.status(404).json({ error: 'Compliance document not found' });
        res.json(document);
    } catch (error) { next(error); }
});

export default router;
