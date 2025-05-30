document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('pwd').value;
    const confirmarSenha = document.getElementById('ConfirmPwd').value;

    if(confirmarSenha !== senha) {
        alert('As senhas precisam ser iguais!');
        return;      
    }

    const resposta = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
        alert('Cadastro realizado com sucesso!');
        window.location.href = '/login';
    } else {
        alert('Erro: ' + resultado.erro);
    }
});