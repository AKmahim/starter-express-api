const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Create a directory to store uploaded images
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, `${fileId}${fileExtension}`);
  },
});

const upload = multer({ storage });

// Define a route for uploading an image
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const fileId = path.basename(req.file.filename);
  return res.json({ success: true, id: fileId });
});

// Define a route for retrieving an image by ID
app.get('/image/:id', (req, res) => {
  const fileId = req.params.id;
  const filePath = path.join(uploadDir, fileId);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  } else {
    return res.status(404).json({ message: 'Image not found.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
