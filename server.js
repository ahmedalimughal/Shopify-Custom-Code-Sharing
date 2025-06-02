const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to serve .html files without .html in URL
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

app.use(express.static('public'));

app.post('/submit', (req, res) => {
  const newData = req.body;
  const filePath = path.join(__dirname, 'data.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    let jsonData = [];
    if (!err && data) {
      jsonData = JSON.parse(data);
    }
    jsonData.push(newData);
    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), err => {
      if (err) return res.status(500).send('Failed to save data');
      res.send('Success');
    });
  });
});


const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // you can configure path

app.post('/saveexperience', upload.single('section_image'), (req, res) => {
  const file = req.file;
  const { company, code_language, description } = req.body;

  const newData = {
    experience: {
      company,
      code_language,
      description,
      section_image: file ? file.originalname : null,
      section_path: file ? file.path : null
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


app.get('/experience', (req, res) => {
  const filePath = path.join(__dirname, 'experience.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading data');
    res.json(JSON.parse(data));
  });
});


app.get('/data', (req, res) => {
  const filePath = path.join(__dirname, 'data.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading data');
    res.json(JSON.parse(data));
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
