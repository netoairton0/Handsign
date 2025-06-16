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

    document.getElementById('vLibras').addEventListener('click', () => {
        const texto = document.getElementById('editor').innerText;

        if (!texto.trim()) {
            alert('O documento está vazio.');
            return;
        }
        
        const vlibrasSpan = document.getElementById('vlibrasContent');
        vlibrasSpan.innerText = texto;

        alert('Clique no botão azul no canto inferior direito para visualizar a tradução.');
    });
    
    let mediaRecorder;
    let recordedChunks = [];

    document.getElementById('startRecordingBtn').addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
                selfBrowserSurface: "include",
            });
            
            recordedChunks = [];
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) recordedChunks.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(recordedChunks, { type: "video/webm" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "vlibras-traducao.webm";
                a.click();
                stream.getTracks().forEach(track => track.stop());

                const formData = new FormData();
                formData.append('video', blob, 'vlibras.webm');
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                const data = await res.json();
                const videoUrl = `http://192.168.0.4:8000${data.url}`;

                QRCode.toDataURL(videoUrl, (err, qrUrl) => {
                    if (err) return console.error('Erro ao gerar QR Code:', err);
                    const img = document.createElement('img');
                    img.src = qrUrl;
                    img.alt = 'QR Code do vídeo';
                    img.style.marginTop = '20px';
                    img.style.maxWidth = '120px';
                    document.body.appendChild(img);
                });
            };
            
            mediaRecorder.start();

            document.getElementById('startRecordingBtn').style.display = 'none';
            document.getElementById('stopRecordingBtn').style.display = 'inline';
            
            alert('Selecione a janela onde o VLibras está visível. A gravação será iniciada.');
        } catch (err) {
            alert("Erro ao iniciar gravação: " + err.message);
        }
    });
    
    document.getElementById('stopRecordingBtn').addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            document.getElementById('startRecordingBtn').style.display = 'inline';
            document.getElementById('stopRecordingBtn').style.display = 'none';
        }
    });

    document.getElementById('deleteBtn').addEventListener('click', async () => {
        const confirmacao = confirm('Tem certeza que deseja deletar este documento?');
        if (!confirmacao) return;

        const params = new URLSearchParams(window.location.search);
        const docId = params.get('id');

        if (!docId) {
            alert('ID do documento não encontrado.');
            return;
        }

        const token = localStorage.getItem('token');

        try {
            const resposta = await fetch(`/api/document/${docId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (resposta.ok) {
                alert('Documento deletado com sucesso!');
                window.location.href = '/home'; 
            } else {
                const resultado = await resposta.json();
                alert(`Erro ao deletar: ${resultado.erro || resposta.statusText}`);
            }
        } catch (erro) {
            console.error(erro);
            alert('Erro ao conectar com o servidor.');
        }
    });
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