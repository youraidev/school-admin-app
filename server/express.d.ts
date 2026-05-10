declare namespace Express {
    interface Request {
        user?: {
            userId: string;
            schoolId: string;
            role: string;
        };
    }
}
