// --- VIEW COUNTER BACKEND ---
// Simple Express server to persist view counts in a JSON file.
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'views.json');

app.use(cors());
app.use(express.json());

// Initialize views.json if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ count: 0, ips: [] }));
}

// Get current view count
app.get('/api/views', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json({ count: data.count });
});

// Endpoint to increment view count
// Enforces "one person one view" by checking IP addresses.
app.post('/api/views/increment', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    // Identify user by IP (Basic check)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Check if this IP has already viewed
    if (!data.ips.includes(ip)) {
        data.count += 1;
        data.ips.push(ip);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ count: data.count, updated: true });
    } else {
        res.json({ count: data.count, updated: false });
    }
});

app.listen(PORT, () => {
    console.log(`View Counter Backend running on http://localhost:${PORT}`);
});
