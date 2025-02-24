// <!-- JavaScript para el login -->
function login(){
    // Capturamos el formulario
    const loginForm = document.querySelector('#loginForm');
    const alertBox = document.querySelector('#alert');

    const loadUsersFromDB = (callback) => {

        fetch(`http://${serverIP}:3000/users`)  // Usamos la ruta que has configurado en el servidor
            .then(response => response.json())
            .then(users => {
                if (users.length > 0) {
                    callback(users); // devolvemos los usuarios obtenidos
                } else {
                    console.error("No data");
                    alertBox.classList.remove('d-none');
                }
            })
            .catch(err => {
                console.error("Error al obtener los usuarios:", err);
                alertBox.classList.remove('d-none');
        });
    };

    // Agregamos un event listener para cuando el usuario intente enviar el formulario
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevenimos que la página se recargue
        
        // Obtenemos los valores ingresados por el usuario
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        
        // cargamos datos desde DB
        loadUsersFromDB(function(users){
            // Validamos si los datos ingresados coinciden con los del "usuario registrado"
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                alertBox.classList.add('d-none'); // Ocultamos la alerta si el login es exitoso
                
                localStorage.setItem('userID', user.id);
                const userID = localStorage.getItem('userID');
                localStorage.setItem('userName', user.name);
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userDescription', user.description);
                localStorage.setItem('userPassword', user.password);
                const imagePath = user.image;
                if(imagePath instanceof Blob){
                    const blob = URL.createObjectURL(imagePath);
                    localStorage.setItem('userImage', blob);
                } else{
                    localStorage.setItem('userImage', imagePath);
                }

                if(user.achievements){
                    localStorage.setItem((`achievements_${userID}`), JSON.stringify(user.achievements));
                } else{
                    const achievements = {
                        tasksAdded: 0,
                        tasksCompleted: 0,
                        tasksShared: 0,
                        milestones: {
                            tasksAdded: [10, 50, 100],
                            tasksCompleted: [10, 50, 100],
                            tasksShared: [5, 20, 50]
                        },
                        shownMilestones: {
                            tasksAdded: [],
                            tasksCompleted: [],
                            tasksShared: []
                        }
                    };
                    console.log(achievements);
                    localStorage.setItem((`achievements_${userID}`), JSON.stringify(achievements));

                    // Actualizamos los logros en el servidor
                    if(achievements){
                        fetch(`http://${serverIP}:3000/users/${userID}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ achievements: achievements })
                        })
                        .catch(err => console.error('Error actualizando los logros:', err));
                    }
                }

                if(user.reports){
                    localStorage.setItem((`userReports_${userID}`), JSON.stringify(user.reports));
                }else{
                    const reports = [];
                    console.log(reports);
                    localStorage.setItem((`userReports_${userID}`), JSON.stringify(reports));

                    // Actualizamos los informes en el servidor
                    if(reports){
                        fetch(`http://${serverIP}:3000/users/${userID}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ reports: reports })
                        })
                        .catch(err => console.error('Error actualizando los informes:', err));
                    }
                }

                if(/^@n{1}e{1}e{1}m{1}a{1}n{1}$/.test(user.id)){
                    userType = encodedAdminType;
                    localStorage.setItem(('userType'), userType);

                    userType = localStorage.getItem('userType');
                } else{
                    userType = false;
                }

                loadView('dashboard');
            } else {
                alertBox.classList.remove('d-none'); // Mostramos una alerta si los datos son incorrectos
            }
        });
    });
    document.querySelector('.btnLink').addEventListener('click', () => {
        loadView('register');
    });
};
login();