document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeButton');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('tema-escuro');
            localStorage.setItem('theme', document.body.classList.contains('tema-escuro') ? 'dark' : 'light');
        });
    }
});
