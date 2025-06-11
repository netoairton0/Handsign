document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(window.location.search);
    const docId = params.get('id');

    if (!token || !docId) {
        alert('Acesso inválido.');
        return window.location.href = '/login';
    }

    try {
        const resposta = await fetch('/api/users/validar-token', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const resultado = await resposta.json();
        if (!resposta.ok || !resultado.autenticado) throw new Error();
    } catch {
        alert('Faça login novamente.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
    }

    let documentData;
    try {
        const res = await fetch(`/api/document/${docId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        documentData = await res.json();
        document.getElementById('editor').innerHTML = documentData.htmlContent || '';
    } catch {
        alert('Erro ao carregar o documento.');
    }

    document.getElementById('title').textContent = documentData.title;
    
    document.getElementById('addImageBtn').addEventListener('click', () => {
        const url = prompt('Digite a URL da imagem:');
        if (url) {
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Imagem adicionada';
            img.style.maxWidth = '100%';
            document.getElementById('editor').appendChild(img);
        }
    });

    document.getElementById('printBtn').addEventListener('click', () => {
        window.print();
    });

    let saveTimeout;

    const triggerAutoSave = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveDocument, 1000);
    };

    document.getElementById('editor').addEventListener('input', triggerAutoSave);
    document.getElementById('title').addEventListener('input', triggerAutoSave);

    async function saveDocument() {
        const token = localStorage.getItem('token');
        const docId = new URLSearchParams(window.location.search).get('id');
        const content = document.getElementById('editor').innerHTML;
        const title = document.getElementById('title').textContent;

        const res = await fetch(`/api/document/${docId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description: '',
                htmlContent: content
            })
        });

        if (!res.ok) {
            console.error('Erro ao salvar automaticamente');
        }
    }
});

function formatar(comando) {
  document.execCommand(comando, false, null);
}

document.getElementById('colorPicker').addEventListener('input', (e) => {
  document.execCommand('foreColor', false, e.target.value);
});

function setarFonte(valor) {
  document.execCommand('fontSize', false, valor);
}