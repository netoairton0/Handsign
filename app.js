const express = require('express');
const app = express();
const path = require('path');
const usersRouter = require('./routes/users');
const dotenv = require('dotenv').config;
const documentosRouter = require('./routes/document');

const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', usersRouter);

app.use('/api/document', documentosRouter);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/login.html'));
})

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/cadastro.html'));
})

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/home.html'));
})

app.get('/document', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/document.html'));
})

app.listen(port, () => {
    console.log(`server running on port: ${port}`);
})