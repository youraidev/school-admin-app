import { Router } from 'express';
import * as queries from '../queries';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        const documents = queries.getAllComplianceDocuments();
        res.json(documents);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const document = queries.getComplianceDocumentById(req.params.id);
        if (!document) {
            return res.status(404).json({ error: 'Compliance document not found' });
        }
        res.json(document);
    } catch (error) {
        next(error);
    }
});

export default router;
