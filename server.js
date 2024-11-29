const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const URL = require('./models/UrlModel'); // Import the URL model
const BASE_URL = `https://minify-url.onrender.com` || `http://localhost:5000`;
const app = express();

app.use(cors()); // This will allow requests from any origin
app.use(express.json()); // For parsing JSON

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

// URL validation function
const isValidUrl = (url) => {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return urlRegex.test(url);
};

app.post('/batch-shorten', async (req, res) => {
  console.log("Received Payload:", req.body);
  const { urls } = req.body; // Array of { originalUrl, customAlias, validity }
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  const results = [];
  const errors = [];

  for (const { originalUrl, customAlias, validity } of urls) {
    try {
      if (!originalUrl) throw new Error('Original URL is required.');
      if (!isValidUrl(originalUrl)) throw new Error('Invalid URL format.');

      // Check for custom alias conflicts
      if (customAlias) {
        const existingAlias = await URL.findOne({ customAlias });
        if (existingAlias) throw new Error(`Custom alias '${customAlias}' is already taken.`);
      }

      // Generate short code or use custom alias
      const shortCode = customAlias || crypto.createHash('md5').update(originalUrl).digest('hex').slice(0, 6);
      const shortUrl = `${BASE_URL}/${shortCode}`;

      // Calculate expiration date if validity is provided
      const expirationDate = validity ? new Date(Date.now() + parseInt(validity) * 24 * 60 * 60 * 1000) : null;

      // Save to database
      const urlDoc = new URL({
        longUrl: originalUrl,
        shortCode,
        customAlias: customAlias || undefined, // Ensure customAlias is undefined if not provided
        expirationDate,
      });
      await urlDoc.save();

      // Generate QR code (as base64)
      const qrCode = await new Promise((resolve, reject) => {
        require('qrcode').toDataURL(shortUrl, (err, qr) => {
          if (err) reject(err);
          else resolve(qr);
        });
      });

      // Add to results
      results.push({ originalUrl, shortUrl, qrCode, expirationDate });
    } catch (error) {
      // Collect errors for problematic URLs
      errors.push({ originalUrl, error: error.message });
    }
  }

  // Send response
  res.json({
    shortenedUrls: results,
    errors: errors,
  });
});

// POST route to shorten URL
app.post('/shorten', async (req, res) => {
  const { originalUrl, customAlias, expirationDate } = req.body; // Get the custom alias from the request
  
  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required' });
  }
  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL format' });
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
  const shortUrl = `${BASE_URL}/${shortCode}`;

  try {
    // Save the original and shortened URL in the database
    const url = new URL({ longUrl: originalUrl, shortCode, customAlias: customAlias || undefined, expirationDate: expirationDate ? new Date(expirationDate) : null });
    await url.save();

    // Generate QR code (as base64)
    const qrCode = await new Promise((resolve, reject) => {
      require('qrcode').toDataURL(shortUrl, (err, qr) => {
        if (err) reject(err);
        else resolve(qr);
      });
    });

    res.json({ originalUrl, shortUrl, qrCode, expirationDate });
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
    // Check if the link has expired
    if (url.expirationDate && new Date() > url.expirationDate) {
      return res.status(410).json({ message: 'This link has expired.' }); // 410 Gone
    }
    // Increase click count
    url.clickCount += 1;
    url.lastAccessed = new Date(); // Update last accessed date
    await url.save();

    // Redirect to the long URL
    res.redirect(url.longUrl);
  } catch (err) {
    console.error('Error handling the redirect:', err);
    res.status(500).json({ message: 'Error handling the redirect' });
  }
});

// Get analytics for a specific short URL
app.get('/analytics/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  try {
    const url = await URL.findOne({ $or: [{ shortCode }, { customAlias: shortCode }] });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    res.json({
      originalUrl: url.longUrl,
      shortUrl: `${BASE_URL}/${url.shortCode}`,
      clickCount: url.clickCount,
      createdAt: url.createdAt,
      lastAccessed: url.lastAccessed,
      expirationDate: url.expirationDate,
      isExpired: url.expirationDate ? new Date() > url.expirationDate : false,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});
// Route to get all links
app.get('/api/links', async (req, res) => {
  try {
    const links = await URL.find(); // Retrieve all links from your database
    if (!links.length) {
      return res.status(404).json({ success: false, message: 'No links found' });
    }

    res.status(200).json({ success: true, links });
  } catch (error) {
    console.error('Error fetching all links:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching links', error: error.message });
  }
});

app.get('/api/links/:id', async (req, res) => {
  try {
      const linkId = req.params.id;
      console.log("Received id:", req.params.id);
      console.log("Received id:", linkId);
      // Search by customAlias instead of _id
      const link = await URL.findOne({ customAlias: linkId });

      if (!link) {
        console.log("No link found for ID:", linkId);
          return res.status(404).json({ success: false, message: 'Link not found' });
      }

      res.status(200).json({ success: true, link });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching link details', error: error.message });
  }
});


// Start server
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
