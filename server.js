const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const URL = require('./models/UrlModel'); // Import the URL model

const app = express();

app.use(cors()); // This will allow requests from any origin

// Middleware
app.use(bodyParser.json());

// MongoDB connection (Local or Atlas)
mongoose.connect('mongodb+srv://pradeep213:IyecIJVN51QY2jws@cluster0.ry8juhn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the URL Shortener API!');
});

// POST route to shorten URL
app.post('/shorten', async (req, res) => {
  const { originalUrl, customAlias } = req.body; // Get the custom alias from the request
  
  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  // Check if the custom alias is already taken
  if (customAlias) {
    const existingAlias = await URL.findOne({ customAlias });
    if (existingAlias) {
      return res.status(400).json({ error: 'Custom alias already taken' });
    }
  }

  // Create a shortened URL (you can use any method to generate a unique code)
  const shortCode = customAlias || crypto.createHash('md5').update(originalUrl).digest('hex').slice(0, 6); // Use custom alias or generate one
  const shortUrl = `http://localhost:5000/${shortCode}`;

  try {
    // Save the original and shortened URL in the database
    const url = new URL({ longUrl: originalUrl, shortCode, customAlias });
    await url.save();

    res.json({ originalUrl, shortUrl });
  } catch (err) {
    console.error('Error saving URL:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect route to handle shortcodes and custom aliases
app.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  try {
    // Search by shortCode first, then by customAlias
    const url = await URL.findOne({ $or: [{ shortCode }, { customAlias: shortCode }] });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Increase click count
    url.clickCount += 1;
    await url.save();

    // Redirect to the long URL
    res.redirect(url.longUrl);
  } catch (err) {
    res.status(500).json({ message: 'Error handling the redirect' });
  }
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port,'0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
