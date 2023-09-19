const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configure AWS SDK with your credentials and desired region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

const s3 = new AWS.S3();

// Multer configuration for handling file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });


// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


// Define a route for uploading an image to S3
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const fileId = uuidv4();
  const fileExtension = req.file.originalname.split('.').pop();
  const fileName = `${fileId}.${fileExtension}`;

  try {
    await s3.putObject({
      Body: req.file.buffer,
      Bucket: 'cyclic-dull-erin-caiman-vest-ap-southeast-2',
      Key: `images/${fileName}`, // Adjust the folder path as needed
    }).promise();

    return res.json({ success: true, id: fileId });
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    return res.status(500).json({ message: 'Failed to upload image.' });
  }
});

// Define a route for retrieving an image from S3 by ID
app.get('/image/:id', async (req, res) => {
  const fileId = req.params.id;
  const fileName = `${fileId}.jpg`; // Assuming all images are in JPG format

  try {
    const image = await s3.getObject({
      Bucket: 'cyclic-dull-erin-caiman-vest-ap-southeast-2',
      Key: `images/${fileName}`, // Adjust the folder path as needed
    }).promise();

    res.writeHead(200, {
      'Content-Type': 'image/jpeg', // Adjust the content type based on your image format
      'Content-Length': image.Body.length,
    });
    res.end(image.Body);
  } catch (error) {
    console.error('Error retrieving image from S3:', error);
    return res.status(404).json({ message: 'Image not found.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
