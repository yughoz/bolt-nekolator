import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3015;

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - all routes serve index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`> Bolt-Nekolator running on http://0.0.0.0:${PORT}`);
});
