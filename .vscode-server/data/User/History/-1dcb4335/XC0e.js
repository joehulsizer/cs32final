// Import necessary modules
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const DATA_FILE = './savedTopics.json';

// Middleware to parse JSON bodies and allow CORS
app.use(express.json());
app.use(cors());

// Endpoint to fetch saved topics
app.get('/api/topics', (req, res) => {
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            res.status(500).send('Error reading topic data.');
            return;
        }
        res.json(JSON.parse(data || '[]'));
    });
});

// Endpoint to save a new topic
app.post('/api/topics', (req, res) => {
    const newTopic = req.body;

    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            res.status(500).send('Error reading topic data.');
            return;
        }

        const topics = JSON.parse(data || '[]');
        topics.push(newTopic);

        fs.writeFile(DATA_FILE, JSON.stringify(topics, null, 2), err => {
            if (err) {
                res.status(500).send('Error saving topic data.');
                return;
            }
            res.status(201).send('Topic saved.');
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
