document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('pwd').value;

    const resposta = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
        localStorage.setItem('token', resultado.token);
        window.location.href = '/home';
    } else {
        alert('Erro: Credenciais Inválidas!');
    }
});