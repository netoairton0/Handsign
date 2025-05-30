const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ erro: 'Token ausente.' });
    }

    try {
        const usuario = jwt.verify(token, process.env.JWT_TOKEN);
        req.usuario = usuario;
        next();
    } catch (erro) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
}

module.exports = verificarToken;