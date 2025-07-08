document.addEventListener('DOMContentLoaded', async () => {
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('tema-escuro');
    } else {
        document.body.classList.remove('tema-escuro');
    }

    await validarToken();
    await carregarDocumentos();
    criarNovoDoc();
});

async function validarToken() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = '/login';
        return;
    }

    try {
        const resposta = await fetch('/api/users/validar-token', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const resultado = await resposta.json();
        console.log(resposta.ok + ' : ' + resultado.autenticado);

        if (!resposta.ok || !resultado.autenticado) {
            throw new Error('Token inválido');
        }

    } catch (erro) {
        alert('Faça login novamente.');
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
}

async function carregarDocumentos() {
    const token = localStorage.getItem('token');
    const resposta = await fetch('/api/document', {
        headers: { Authorization: `Bearer ${token}` }
    });

    const documentos = await resposta.json();

    const container = document.getElementById('buttonDiv');
    container.innerHTML = ''; 

    if (!documentos.length) {
        container.innerHTML = '<p>Nenhum documento encontrado.</p>';
        container.className = 'tituloDoc';
        return;
    }

    documentos.forEach(doc => {
        const botao = document.createElement('button');
        botao.className = 'buttonDoc';

        const divTexto = document.createElement('div');
        divTexto.className = 'textDoc';

        const titulo = document.createElement('p');
        titulo.id = 'tituloDoc';
        titulo.textContent = doc.title;

        divTexto.appendChild(titulo);
        botao.appendChild(divTexto);

        botao.addEventListener('click', () => {
            window.location.href = `/document?id=${doc.id}`;
        });

        container.appendChild(botao);
    });
}

function criarNovoDoc() {
    const botaoCriar = document.getElementById('linkDoc');

    botaoCriar.addEventListener('click', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        const resposta = await fetch('/api/document', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Novo Documento',
                description: '',
                htmlContent: '<h1>Novo Documento</h1><p>Comece a digitar aqui...</p>'
            })
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            window.location.href = `/document?id=${resultado.document.id}`;
            carregarDocumentos();
        } else {
            alert('Erro ao criar documento: ' + resultado.error);
        }
    });
}