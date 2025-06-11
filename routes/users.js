const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const verificarToken = require('../middlewares/verificarToken');
const dbPath = path.join(__dirname, "../data/users.json");

if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]));
}

router.post('/register', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Campos obrigatórios não preenchidos' });
    }

    const usuarios = JSON.parse(fs.readFileSync(dbPath));
    const existe = usuarios.find(u => u.email === email);

    if (existe) {
        return res.status(400).json({ erro: 'Usuário já cadastrado' });
    }

    try{
        const hash = await bcrypt.hash(senha, 10);

        const newUser = {
            email,
            senha: hash
        };

        usuarios.push(newUser);
        fs.writeFileSync(dbPath, JSON.stringify(usuarios, null, 2));

        return res.status(201).json({ msg: "Usuário cadastrado com sucesso!" })
    }
    catch (error){
        return res.status(500).json({ error: "Erro ao salvar usuario" })
    }
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Campos obrigatórios não preenchidos' });
    }

    const usuarios = JSON.parse(fs.readFileSync(dbPath));
    const existe = usuarios.find(u => u.email === email);

    if (!existe) {
        return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const match = await bcrypt.compare(senha, existe.senha);

    if(!match) {
      res.status(401).json({ mensagem: 'Senha incorreta' });  
    }

    const token = jwt.sign(
        {email},
        process.env.JWT_TOKEN,
        {expiresIn: '10h'}
    );

    res.status(200).json({ mensagem: 'Login bem-sucedido.', token });
});

router.get('/validar-token', verificarToken, (req, res) => {
    res.status(200).json({
        autenticado: true,
        usuario: req.usuario
    });
});

module.exports = router;