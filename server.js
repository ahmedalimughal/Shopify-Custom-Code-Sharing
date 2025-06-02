const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3000; // fix: variable was PORT but used 'port' in listen

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to serve .html files without .html in URL (optional)
app.use((req, res, next) => {
  if (!path.extname(req.path)) {
    const filePath = path.join(__dirname, 'public', req.path + '.html');
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        res.sendFile(filePath);
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads to 'uploads' folder
const upload = multer({ dest: path.join(__dirname, 'uploads') });

// POST endpoint to save generic submitted data to data.json
app.post('/submit', (req, res) => {
  const newData = req.body;
  const filePath = path.join(__dirname, 'data.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    let jsonData = [];
    if (!err && data) {
      try {
        jsonData = JSON.parse(data);
        if (!Array.isArray(jsonData)) jsonData = [];
      } catch {
        jsonData = [];
      }
    }
    jsonData.push(newData);
    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).send('Failed to save data');
      res.send('Success');
    });
  });
});

// POST endpoint to save experience data with optional image upload
app.post('/saveexperience', upload.single('section_image'), (req, res) => {
  const file = req.file;
  const { company, code_language, description } = req.body;

  const newData = {
    experience: {
      company: company || '',
      code_language: code_language || '',
      description: description || '',
      section_image: file ? file.originalname : null,
      section_path: file ? `/uploads/${file.filename}` : null // fix path for static serving
    }
  };

  const filePath = path.join(__dirname, 'experience.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    let jsonData = [];
    if (!err && data) {
      try {
        jsonData = JSON.parse(data);
        if (!Array.isArray(jsonData)) jsonData = [];
      } catch {
        jsonData = [];
      }
    }
    jsonData.push(newData);
    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).send('Failed to save data');
      res.send('Success');
    });
  });
});

// GET endpoint to get experience data
app.get('/experience', (req, res) => {
  const filePath = path.join(__dirname, 'experience.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading data');
    try {
      res.json(JSON.parse(data));
    } catch {
      res.json([]);
    }
  });
});

// GET endpoint to get generic data
app.get('/data', (req, res) => {
  const filePath = path.join(__dirname, 'data.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading data');
    try {
      res.json(JSON.parse(data));
    } catch {
      res.json([]);
    }
  });
});

// Serve index.html on all other routes (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
