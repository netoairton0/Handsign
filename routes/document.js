const express = require('express');
const fs = require('fs');
const path = require('path');
const verificarToken = require('../middlewares/verificarToken');

const router = express.Router();
const dbPath = path.join(__dirname, '..', 'data', 'documents.json');

// Garante que o arquivo de dados exista
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]));
}

// Rota protegida: criar novo documento
router.post('/', verificarToken, (req, res) => {
    const { title, description, contents } = req.body;

    if (!title || !contents || !Array.isArray(contents) || contents.length === 0) {
        return res.status(400).json({ error: 'Título e conteudo são obrigatorios' });
    }
    
    const validTypes = ['text', 'image', 'audio'];
    for (const item of contents) {
        if (!item.type || !item.data || !validTypes.includes(item.type)) {
            return res.status(400).json({ error: 'Conteudo invalido' });
        }
    }

    const documents = JSON.parse(fs.readFileSync(dbPath));

    const newDocument = {
        id: Date.now(),
        title,
        description: description || '',
        userEmail: req.usuario.email,
        contents,
        createdAt: new Date().toISOString(),
        updatedAt: null
    };

    documents.push(newDocument);
    fs.writeFileSync(dbPath, JSON.stringify(documents, null, 2));

    res.status(201).json({
        message: 'Document created successfully.',
        document: newDocument
    });
});

router.get('/', verificarToken, (req, res) => {
    const documents = JSON.parse(fs.readFileSync(dbPath));
    const userDocuments = documents.filter(doc => doc.userEmail === req.usuario.email);

    res.status(200).json(userDocuments);
});

router.get('/:id', verificarToken, (req, res) => {
    const documents = JSON.parse(fs.readFileSync(dbPath));

    const usersDoc = documents.find(doc => doc.userEmail === req.usuario.email
                                                    && doc.id === parseInt(req.params.id)
    );

    if(!usersDoc) {
        return res.status(404).json({ error: 'Documento não encontrado!' });
    }

    return res.status(200).json(usersDoc);
});

router.put('/:id', verificarToken, (req, res) => {
    const { title, description, contents } = req.body;
    const documentId = parseInt(req.params.id);

    if (!title || !contents || !Array.isArray(contents) || contents.length === 0) {
        return res.status(400).json({ error: 'Título e conteudo sao obrigatórios!' });
    }

    const validTypes = ['text', 'image', 'audio'];
    for (const item of contents) {
        if (!item.type || !item.data || !validTypes.includes(item.type)) {
            return res.status(400).json({ error: 'Conteudo inválido' });
        }
    }

    const documents = JSON.parse(fs.readFileSync(dbPath));
    const index = documents.findIndex(doc =>
        doc.id === documentId && doc.userEmail === req.usuario.email
    );

    if (index === -1) {
        return res.status(404).json({ error: 'Documento não encontrado' });
    }

    documents[index] = {
        ...documents[index],
        title,
        description,
        contents,
        updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(dbPath, JSON.stringify(documents, null, 2));

    res.status(200).json({
        message: 'Alteração realizada com sucesso',
        document: documents[index]
    });
});

router.delete('/:id', verificarToken, (req, res) => {
    const documentId = parseInt(req.params.id);

    const documents = JSON.parse(fs.readFileSync(dbPath));
    const index = documents.findIndex(doc =>
        doc.id === documentId && doc.userEmail === req.usuario.email
    );

    if (index === -1) {
        return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const deleted = documents.splice(index, 1)[0];
    fs.writeFileSync(dbPath, JSON.stringify(documents, null, 2));

    res.status(200).json({
        message: 'Documento apagado com sucesso!',
        document: deleted
    });
});

module.exports = router;