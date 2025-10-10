// --- Elementos DOM ---
const loginForm = document.getElementById('formulario');
const registerForm = document.getElementById('formulario-registro');
const loginPage = document.getElementById('pagina-inicio');
const registerPage = document.getElementById('pagina-registro');
const dashboardPage = document.getElementById('panel-de-control');
const loginError = document.getElementById('error-inicio');
const logoutBtn = document.getElementById('boton-cerrar-sesion');
const toggleRegister = document.getElementById('alternar-registro');
const toggleLogin = document.getElementById('alternar-inicio');
const menuToggle = document.getElementById('alternar-menu');
const mainNav = document.getElementById('navegacion-principal');
const clientNameDisplay = document.getElementById('nombre-de-cliente');
const navItems = document.querySelectorAll('.item-de-navegacion[data-content]');
const contentViews = document.querySelectorAll('.vista-contenedor');
const clientsaldoDisplay = document.getElementById('saldo-de-cliente');
const transactionForm = document.getElementById('fomulario-de-transaccion');
const transactionError = document.getElementById('error-en-transaccion');
const transactionHistoryList = document.getElementById('historial-de-transacciones');
const passwordForm = document.getElementById('formulario-de-cambio-de-contraseña');
const passwordError = document.getElementById('contraseña-erronea');
const settingsClientName = document.getElementById('ajustes-de-nombre-de-cliente');
const settingscuentaNumber = document.getElementById('ajustes-numero-de-cuenta');


// SIMULACIÓN DE DATOS DINÁMICOS 
let clientAuth = {
    user: "Admin",
    pass: "12345",
    name: "Edwin Giraldo"
};

let clientsaldo = 112700.00; 
let transactionRecords = [
    { type: 'in', amount: 123000.00, desc: 'Ingreso', date: '2025-09-30' },
    { type: 'out', amount: 10300.00, desc: 'Supermercado', date: '2025-10-01' }
];

//  FUNCIONES DE RENDERIZADO

function updatesaldoDisplay() {
    // Formato de moneda
    clientsaldoDisplay.textContent = `$ ${clientsaldo.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function renderHistory() {
    transactionHistoryList.innerHTML = '';
    
    transactionRecords.forEach(record => {
        const sign = record.type === 'in' ? '+' : '-';
        const amountClass = record.type === 'in' ? 'transaction-in' : 'transaction-out';

        const li = document.createElement('li');
        li.className = amountClass;
        li.innerHTML = `
            <div>${record.desc} <span style="font-size: 0.8em; color: #6c757d;">(${record.date})</span></div>
            <strong>${sign} $${record.amount.toFixed(2)}</strong>
        `;
        transactionHistoryList.prepend(li);
    });
}

function showPage(pageToShow) {
    const pages = [loginPage, registerPage, dashboardPage];
    
    pages.forEach(page => {
        if (page.classList.contains('activo') || !page.classList.contains('oculto')) {
            page.style.opacity = '0';
            setTimeout(() => {
                page.classList.remove('activo');
                page.classList.add('oculto');
                page.style.opacity = '1';
            }, 500); 
        }
    });

    setTimeout(() => {
        if (pageToShow === loginPage || pageToShow === registerPage) {
            pageToShow.classList.remove('oculto');
            pageToShow.classList.add('activo');
        } else {
            dashboardPage.classList.remove('oculto');
        }
    }, 500);
}

function showContent(contentId) {
    contentViews.forEach(view => view.classList.remove('activo-content'));
    navItems.forEach(item => item.classList.remove('activo'));

    document.getElementById(`content-${contentId}`).classList.add('activo-content');
    document.querySelector(`.item-de-navegacion[data-content="${contentId}"]`).classList.add('activo');

    // Inicializa vistas específicas
    if (contentId === 'transacciones') {
        renderHistory();
    }
    // Si vamos a ajustes, recargamos la info para que sea dinámica
    if (contentId === 'settings') {
         settingsClientName.textContent = clientAuth.name;
         settingscuentaNumber.textContent = document.getElementById('numero-de-cuenta').textContent;
    }
}


// MANEJO DE EVENTOS GENERALES

// Alternar entre Login y Registro
toggleRegister.addEventListener('click', (e) => { e.preventDefault(); showPage(registerPage); });
toggleLogin.addEventListener('click', (e) => { e.preventDefault(); showPage(loginPage); });

// Menú de navegación móvil
menuToggle.addEventListener('click', () => { mainNav.classList.toggle('show'); });

// Cerrar sesión
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Sesión cerrada. La contraseña actual es: " + clientAuth.pass);
    showPage(loginPage);
});

// Clic en la barra de navegación
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const contentId = e.target.getAttribute('data-content');
        showContent(contentId);
        mainNav.classList.remove('show'); 
    });
});


// INICIO DE SESIÓN Y VALIDACIÓN
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const user = document.getElementById('inicio-user').value.trim();
    const pass = document.getElementById('inicio-password').value;
    loginError.textContent = "";

    // VALIDACIÓN BÁSICA (Cliente)
    if (user === "" || pass === "") {
        loginError.textContent = "Usuario y contraseña no pueden estar vacíos.";
        return;
    }

    // SIMULACIÓN de autenticación
    if (user === clientAuth.user && pass === clientAuth.pass) {
        
        // Carga los datos y navega al Dashboard
        clientNameDisplay.textContent = clientAuth.name;
        updatesaldoDisplay();
        showPage(dashboardPage);
        showContent('inicio');
        
    } else {
        loginError.textContent = "Error: Usuario o contraseña incorrectos.";
    }
});

// FORMULARIO DE TRANSACCIÓN
transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    transactionError.textContent = '';

    const recipient = document.getElementById('cuenta-del-destinatario').value.trim();
    const amount = parseFloat(document.getElementById('monto-de-transaccion').value);

    // VALIDACIÓN DETALLADA
    if (recipient.length !== 12 || isNaN(amount) || amount <= 0) {
        transactionError.textContent = "Datos inválidos. Verifica la cuenta (12 dígitos) y el monto.";
        return;
    }

    if (amount > clientsaldo) {
        transactionError.textContent = "¡Saldo insuficiente! No puedes transferir esa cantidad.";
        return;
    }

    // LÓGICA DE TRANSFERENCIA
    clientsaldo -= amount;
    
    const newRecord = {
        type: 'out',
        amount: amount,
        desc: `Transferencia a cuenta ****${recipient.slice(-4)}`,
        date: new Date().toISOString().slice(0, 10)
    };
    transactionRecords.push(newRecord);

    // Actualizar la interfaz
    updatesaldoDisplay();
    renderHistory();
    transactionForm.reset(); 
    transactionError.textContent = "¡Transferencia realizada con éxito!";
    
    setTimeout(() => {
        transactionError.textContent = '';
    }, 4000);
});


// FORMULARIO DE CAMBIO DE CONTRASEÑA (AJUSTES)
passwordForm.addEventListener('submit', function(e) {
    e.preventDefault();
    passwordError.textContent = '';

    const oldPass = document.getElementById('vieja-contraseña').value;
    const newPass = document.getElementById('nueva-contraseña').value;
    const confirmPass = document.getElementById('confirmar-contraseña').value;

    // 1. Validar Contraseña Actual
    if (oldPass !== clientAuth.pass) {
        passwordError.textContent = "Error: La contraseña actual es incorrecta.";
        return;
    }
    
    // 2. Validar que las contraseñas nuevas coincidan
    if (newPass !== confirmPass) {
        passwordError.textContent = "Error: La nueva contraseña y la confirmación no coinciden.";
        return;
    }
    
    // 3. Validar longitud
    if (newPass.length < 5) {
        passwordError.textContent = "Error: La nueva contraseña debe tener al menos 5 caracteres.";
        return;
    }

    // LÓGICA DE ACTUALIZACIÓN
    clientAuth.pass = newPass; 
    
    // Feedback de éxito
    passwordForm.reset(); 
    passwordError.textContent = "¡Contraseña actualizada con éxito!";
    passwordError.style.color = 'var(--success-color)';

    setTimeout(() => {
        passwordError.textContent = '';
        passwordError.style.color = 'var(--error-color)';
    }, 4000);
});

// Ejecución inicial
updatesaldoDisplay();