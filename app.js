const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

/* ===============================
   Ensure uploads folder exists
   =============================== */
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* ===============================
   Multer storage setup
   =============================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/* ===============================
   Static files
   =============================== */
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

/* ===============================
   Routes
   =============================== */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all photos
app.get('/api/photos', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Could not read folder' });
    }

    const images = files.filter(file =>
      file.match(/\.(jpg|jpeg|png)$/i)
    );

    res.json({ images });
  });
});

// Upload photo
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo received' });
  }

  res.json({ filename: req.file.filename });
});

/* ===============================
   Start server
   =============================== */
app.listen(PORT, () => {
  console.log(`📷 Photobooth running on port ${PORT}`);
});
