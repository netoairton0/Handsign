document.addEventListener('DOMContentLoaded', async () => {
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
});