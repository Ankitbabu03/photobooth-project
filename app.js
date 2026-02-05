const express = require('express');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

/* =====================
   Cloudinary Config
   ===================== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

/* =====================
   Multer (temporary)
   ===================== */
const upload = multer({ dest: 'temp/' });

/* =====================
   Static Files
   ===================== */
app.use(express.static('public'));

/* =====================
   Routes
   ===================== */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* Upload photo to Cloudinary */
app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'photobooth'
    });

    fs.unlinkSync(req.file.path); // delete temp file

    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

/* Load gallery from Cloudinary */
app.get('/api/photos', async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:photobooth')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    const images = result.resources.map(img => img.secure_url);
    res.json({ images });
  } catch (err) {
    res.status(500).json({ error: 'Gallery load failed' });
  }
});

/* Start Server */
app.listen(PORT, () => {
  console.log(`📸 Photobooth running on port ${PORT}`);
});
