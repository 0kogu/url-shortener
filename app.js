const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Read URLs from JSON file (initial load)
let urls = require('./urls.json');

// Route: Home (Form for inputting long URLs)
app.get('/', (req, res) => {
    res.render('index', { error: null });
});

// Route: Generate short URL
app.post('/shorten', (req, res) => {
    const longUrl = req.body.url;

    if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
        return res.render('index', { error: 'Invalid URL! Please include http:// or https://.' });
    }

    // Generate a unique short URL identifier
    const shortUrl = Math.random().toString(36).substring(2, 8);
    
    urls[shortUrl] = { longUrl: longUrl, count: 0 };

    // Save updated URLs to JSON file
    fs.writeFileSync('./urls.json', JSON.stringify(urls, null, 4));

    res.render('result', { shortUrl, longUrl });
});

// Route: Redirect from short URL to original long URL
app.get('/:shortUrl', (req, res) => {
    const shortUrl = req.params.shortUrl;

    if (urls[shortUrl]) {
        urls[shortUrl].count += 1; // Increment usage count
        fs.writeFileSync('./urls.json', JSON.stringify(urls, null, 4)); // Save updates to JSON
        res.redirect(urls[shortUrl].longUrl);
    } else {
        res.send('Invalid short URL.');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
