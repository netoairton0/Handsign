const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    let dir;

    if (ext === '.pdf') {
        dir = path.join(__dirname, '..', 'public', 'pdfs');
    } else if (ext === '.webm') {
        dir = path.join(__dirname, '..', 'public', 'videos');
    } else {
        dir = path.join(__dirname, '..', 'public', 'uploads');
    }

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
    },
    
    filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${timestamp}${ext}`);
    }
});

const upload = multer({ storage });

router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }

    let folder;
    if (req.file.mimetype === 'application/pdf') {
        folder = 'pdfs';
    } else if (req.file.mimetype === 'video/webm') {
        folder = 'videos';
    } else {
        folder = 'uploads';
    }

    const fileUrl = `/${folder}/${req.file.filename}`;
    res.json({ url: fileUrl });
});

module.exports = router;