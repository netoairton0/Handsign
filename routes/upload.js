const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '..', 'public', 'videos');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname) || '.webm';
        cb(null, `vlibras-${timestamp}${ext}`);
    }
});

const upload = multer({ storage });

router.post('/', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }
    
    const videoUrl = `/videos/${req.file.filename}`;
    res.json({ url: videoUrl });
});

module.exports = router;