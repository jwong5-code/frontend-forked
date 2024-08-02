require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const db = require('./src/database.js');
const cors = require('cors');
const multer = require('multer');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2');

app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
const fs = require('fs');
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Append extension
    },
  });
  const upload = multer({ storage: storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}


app.get('/patients', (req, res) => {
    const { firstname, lastname, id } = req.query;
    let sql = 'SELECT * FROM patients';
    const params = [];
    console.log('Received query parameters:', req.query);

    if (firstname || lastname || parseInt(id)) {
        sql += ' WHERE 1=1';
        if (firstname) {
            sql += ' AND firstname = ';
            sql += `'${firstname}'`;
        }
        if (lastname) {
            sql += ' AND lastname = ';
            sql += `'${lastname}'`;
        }
        if (id) {
            sql += ' AND id = ';
            sql += id + '';
        }
    
    }

    sql += ';';

    console.log('SQL Query:', sql);

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching patients');
        }
        res.json({results, debug: {sql, params}});
});
});

app.post('/patients', (req, res) => {
    const { firstname, lastname, id } = req.body;
    const sql = 'INSERT INTO patients (firstname, lastname, id) VALUES (?, ?, ?)';
    db.query(sql, [firstname, lastname, id], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).send('ID already taken');
            }
            return res.status(500).send('Error adding patient');
        }
        res.status(201).send('Patient added successfully');
    });
});

app.put('/patients/:id', (req, res) => {
    const { id } = req.params;
    const { firstname, lastname } = req.body;
    const sql = 'UPDATE patients SET firstname = ?, lastname = ? WHERE id = ?';
    const params = [firstname, lastname, id];
    console.log('Update SQL Query:', sql);
    console.log('Update Query Parameters:', params);

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error updating patient profile');
        }

        if (req.files && req.files.image) {
            const image = req.files.image;
            const imagePath = `uploads/${id}_${Date.now()}_${image.name}`;
            const imageDate = new Date();
            const imageName = image.name;

            image.mv(imagePath, (err) => {
                if (err) {
                    console.error('Error uploading image:', err);
                    return res.status(500).send('Error uploading image');
                }
                const sql = 'INSERT INTO images (patient_id, image_path, image_date, image_name) VALUES (?, ?, ?, ?)';
                db.query(sql, [id, imagePath, imageDate, imageName], (err, result) => {
                    if (err) {
                        console.error('Error saving image to database:', err);
                        return res.status(500).send('Error saving image to database');
                    }
                    console.log('Image uploaded to', imagePath);
                    res.send('Profile and image updated successfully');
                });
            });
        } else {
            res.send('Profile updated successfully');
        }
    });
});


app.post('/upload', upload.single('image'), (req, res) => {
    const patientId = req.body.patientId;
    const imagePath = `/uploads/${req.file.filename}`;
    const imageDate = req.body.imageDate;
    const imageName = req.file.originalname;
  
    const sql = 'INSERT INTO images (patient_id, image_path, image_date, image_name) VALUES (?, ?, ?, ?)';
    db.query(sql, [patientId, imagePath, imageDate, imageName], (err, result) => {
      if (err) {
        console.error('Error uploading image:', err);
        return res.status(500).send('Error uploading image');
      }
      res.status(201).send('Image uploaded successfully');
    });
  });  

app.delete('/patients/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM patients WHERE id = ?';
    console.log('SQL Query:', sql);
    console.log('Query Parameters:', [id]);
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error deleting patient profile');
        }
        res.send('Profile deleted successfully');
    });
});


app.get('/patients/:id', (req, res) => {
    const patientId = req.params.id;
    const sql = 'SELECT * FROM patients WHERE id = ?';
  
    db.query(sql, [patientId], (err, result) => {
      if (err) {
        console.error('Error fetching patient from database:', err);
        res.status(500).json({ error: 'Database query error' });
      } else if (result.length > 0) {
        res.json({ client: result[0] });
      } else {
        res.status(404).json({ error: 'Patient not found' });
      }
    });
  });
  

  app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
  });

  
  app.get('/patients/:id/images', (req, res) => {
    const patientId = req.params.id;
    const sql = 'SELECT * FROM images WHERE patient_id = ? ORDER BY image_date DESC';
    console.log('SQL Query:', sql);
    console.log('Query Parameters:', [patientId]);
    db.query(sql, [patientId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error fetching images');
        }
        res.json(results);
    });
});


app.get('/images', (req, res) => {
    const patientId = req.params.id;
    const sql = 'SELECT * FROM images';
    console.log('SQL Query:', sql);
    db.query(sql, [patientId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error fetching images');
        }
        res.json(results);
    });
});

app.delete('/images/:id', (req, res) => {
    const imageId = req.params.id;
    const sql = 'SELECT image_path FROM images WHERE id = ?';
    db.query(sql, [imageId], (err, results) => {
        if (err) {
            console.error('Error fetching image path:', err);
            return res.status(500).send('Error fetching image path');
        }
        if (results.length > 0) {
            const imagePath = results[0].image_path;
            fs.unlink(path.join(__dirname, imagePath), (err) => {
                if (err) {
                    console.error('Error deleting image file:', err);
                    return res.status(500).send('Error deleting image file');
                }
                const deleteSql = 'DELETE FROM images WHERE id = ?';
                db.query(deleteSql, [imageId], (err, result) => {
                    if (err) {
                        console.error('Error deleting image from database:', err);
                        return res.status(500).send('Error deleting image from database');
                    }
                    res.send('Image deleted successfully');
                });
            });
        } else {
            res.status(404).send('Image not found');
        }
    });
});

app.put('/patients/:id/images', (req, res) => {
    const imageId = req.params.id; // Correctly parse the image ID
    const { newName } = req.body; // Destructure newName from request body

    const updateImageSql = 'UPDATE images SET image_name = ? WHERE id = ?';
    console.log('Update SQL Query:', req.params.id, req.body);
    console.log('Update Query Parameters:', [newName, imageId]);

    db.query(updateImageSql, [newName, imageId], (err, result) => {
        if (err) {
            console.error('Error updating image name:', err);
            return res.status(500).send('Error updating image name');
        }

        res.send('Image name updated successfully');
    });
});




const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
