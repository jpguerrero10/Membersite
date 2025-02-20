function register(){
    const loadUsersFromDB = (callback) => {
        fetch(`http://${serverIP}:3000/users`) // Cambia esta URL según la configuración de tu servidor
            .then(response => response.json())
            .then(users => {
                callback(users);
            })
            .catch(err => {
                console.error('Error fetching users from the database:', err);
        });
    };
    
    // Capturamos el formulario
    const registerForm = document.querySelector('#loginForm');
    const alertBox = document.querySelector('#alert');
    
    
    // Agregamos un event listener para cuando el usuario intente enviar el formulario
    registerForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevenimos que la página se recargue
        
        // Obtenemos los valores ingresados por el usuario
        const name = document.querySelector('#name').value;
        const id = document.querySelector('#userID').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        const description = document.querySelector('#description').value;
        const imageInput = document.querySelector('#formFile');
        const image = imageInput.files.length > 0 ? imageInput.files[0] : 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1729035691~exp=1729039291~hmac=af1f015be4e2265a3b6f47a0c71539af89297f46ad77ca8a9cfc1c64c289a8a1&w=740';

        loadUsersFromDB(function(users){
            // Validamos si los datos ingresados coinciden o no con los del "usuario registrado"
            const userExists = users.some(u => u.email === email || u.id === id);
            if (!userExists) {
                alertBox.classList.add('d-none'); // Ocultamos la alerta si el login es exitoso

                //crear el nuevo usuario
                const newUser = {
                    email: email, 
                    password: password, 
                    name: name, 
                    id: id, 
                    description: description, 
                    image: image
                };
                
                // Enviamos los datos al servidor para guardar el nuevo usuario
                fetch(`http://${serverIP}:3000/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newUser)
                })
                .then(response => {
                    if (response.ok) {
                        console.log('User registered successfully!');
                        loadView('login'); // Cargar la vista de login después de registrar
                    } else {
                        console.error('Failed to register user');
                        alertBox.classList.remove('d-none'); // Mostramos una alerta si ocurre un error
                    }
                })
                .catch(err => {
                    console.error('Error registering user:', err);
                    alertBox.classList.remove('d-none'); // Mostramos una alerta si ocurre un error
                });
            } else {
                alertBox.classList.remove('d-none'); // Mostramos una alerta si los datos son incorrectos
            }
        });
    });
    document.querySelector('.btnLink').addEventListener('click', () => {
        loadView('login');
    });
}
register();