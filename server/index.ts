import './db/index.js'; // ensure DATABASE_URL is validated on startup
import app from './server.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});
