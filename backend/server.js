// backend/server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const ExcelJS = require('exceljs');
const multer = require('multer');
const xlsx = require('xlsx');
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());


// Connect to SQLite database (creates file if not exists)
const db = new sqlite3.Database('./data.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to SQLite database.');
});

// Create table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT
)`);

app.get('/user', (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ users: rows });
    });
});

// Routes
app.post('/user', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check for existing user by name
    db.get("SELECT * FROM users WHERE name = ?", [name], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            return res.status(409).json({ error: 'User already exists' }); // ⚠️ Duplicate warning
        }

        // Insert new user
        db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ id: this.lastID }); // ✅ Return the inserted user id
        });
    });
});




//exporting
app.get('/export-users', async (req, res) => {
    try {
        // Fetch users from SQLite
        db.all("SELECT * FROM users", [], async (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            // Create new workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Users');

            // Add headers
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Name', key: 'name', width: 30 },
                { header: 'Email', key: 'email', width: 30 },
            ];

            // Add rows
            worksheet.addRows(rows);

            // Set response headers
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="users.xlsx"'
            );

            // Write to response
            await workbook.xlsx.write(res);
            res.end();
        });
    } catch (error) {
        res.status(500).send('Error generating Excel file');
    }
});

//importing
app.post('/import-users', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log('Parsed Excel data:', data);

    const insertStmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');

    try {
        // Create array of Promises for each user
        const promises = data.map(user => {
            return new Promise((resolve, reject) => {
                const name = user.Name || user.name;
                const email = user.Email || user.email;

                if (!name || !email) {
                    console.log('Skipped user due to missing name/email:', user);
                    return resolve(); // skip this user
                }

                // Check if email exists
                db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
                    if (err) {
                        console.error('Select error:', err.message);
                        return reject(err);
                    }

                    if (!row) {
                        // Insert user if not exists
                        insertStmt.run(name, email, (err) => {
                            if (err) {
                                console.error('Insert error:', err.message);
                                return reject(err);
                            } else {
                                console.log(`Inserted user: ${name}, ${email}`);
                                resolve();
                            }
                        });
                    } else {
                        console.log(`Skipped duplicate user with email: ${email}`);
                        resolve();
                    }
                });
            });
        });

        // Wait for all inserts to complete
        await Promise.all(promises);

        // Finalize statement after all inserts
        insertStmt.finalize();

        res.json({ message: 'Users imported successfully without duplicates' });
    } catch (err) {
        console.error('Import error:', err);
        res.status(500).json({ error: err.message });
    }
});



//clearing
app.delete('/clear-users', (req, res) => {
    db.run("DELETE FROM users", [], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "All users deleted" });
    });
});

const PORT = 50;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});