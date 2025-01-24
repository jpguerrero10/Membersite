function dashboard(){
    const loadUsersFromDB = (callback) => {
        const userID = localStorage.getItem('userID');
        Promise.all([
            fetch('http://localhost:3000/users') // Cambia esta URL según tu configuración
                .then(response => {
                    if (!response.ok) throw new Error('Error fetching users');
                    return response.json();
                }),
            fetch('http://localhost:3000/tasks') // Cambia esta URL según tu configuración
                .then(response => {
                    if (!response.ok) throw new Error('Error fetching tasks');
                    return response.json();
                }),
            fetch(`http://localhost:3000/tasks/${userID}`)
                .then(response => {
                    if (!response.ok) throw new Error('Error fetching tasks');
                    return response.json();
                })
                .then(tasks => {
                    localStorage.setItem((`userTask_${userID}`), JSON.stringify(tasks));
                })
        ])
        .then(([users, tasks]) => {
            // Pasar los datos combinados al callback
            callback({ users, tasks });
        })
        .catch(err => {
            console.error('Error fetching data from the database:', err);
        });
    };

    // ---------------------------------------- Getting user's data from localStorage --------------------------------------------------
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    let userImage = localStorage.getItem('userImage');
    const userID = localStorage.getItem('userID');
    const userDescription = localStorage.getItem('userDescription');
    let achievements = JSON.parse(localStorage.getItem(`achievements_${userID}`));
    let userTask = JSON.parse(localStorage.getItem(`userTask_${userID}`));

    // ---------------------------------------- displaying data on screen ---------------------------------------------------------------
    document.querySelector('#userName').textContent = userName;
    document.querySelector('#userEmail').textContent = userEmail;
    document.querySelector('#userID').textContent = userID;
    document.querySelector('#userDescription').textContent = userDescription;
    document.querySelector('#userImage').src = userImage;

    // ----------------------------------------- handling the logout -------------------------------------------------------------------
    document.querySelector('#logout').addEventListener('click', function() {
        
        // clean stored data
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userImage');
        localStorage.removeItem('userID');
        localStorage.removeItem('userDescription');
        localStorage.removeItem(`userTask_${userID}`);
        localStorage.removeItem(`achievements_${userID}`);
        localStorage.removeItem(`userReports_${userID}`);
        localStorage.removeItem('userType');
        
        loadView("login");
    });
    
    const aisatsu = addElement('h3', {class: 'text-primary-emphasis my-4 fs-4 text-center'}, `よこそう、 <span class="text-info">${userName.match(/^[^\s]+/)}</span>さん。 <span style="display: inline-block;">今日のタスクを確認しましょう。</span>`);
    aisatsu.style.transition = ".5s ease-in-out";
    aisatsu.style.opacity = "0";
    aisatsu.style.transform = "translateY(-80px)";
    const card = document.querySelector('#calendarContainer');

    card.parentNode.insertBefore(aisatsu, card);
    setTimeout(() => {
        fadeIn(aisatsu, 200); // Hace un fade in en 1 segundo
    }, 20);

    // Calendar creation -------------------------------------------------------------------------------------------------------------

    //load tasks
    const loadTasks = (container, year, month, day) => {
        loadUsersFromDB(function ({ users, tasks }) {
            let firstElement = true;
            const user = users.find(user => user.email === userEmail);
            tasks.forEach((task, index) => {
                if (!task.isChecked) {
                    const [deadlineYear, deadlineMonth, deadlineDay] = task.deadline.split("-").map(Number);
                    if (Number(year) === deadlineYear && (Number(month) + 1) === deadlineMonth && Number(day) === deadlineDay){
                        const taskTitle = addElement("div", { class: `tasks d-flex justify-content-between align-items-center py-2 border-bottom border-info`, id: `task${index}-${task.deadline}`}, `
                        <p class="d-inline-block m-0" style=" max-width: 70%; text-align: left;">${task.title}</p>
                        <button type="button" class="btn btn-outline-info btn-sm">詳細</button>
                        `);
                        
                        if (firstElement) {
                            taskTitle.classList.add("border-top");
                            firstElement = false; 
                        }
                        container.appendChild(taskTitle);

                        container.querySelectorAll(".tasks").forEach(btnTask => {
                            btnTask.addEventListener('click', () => {
                                loadView('profile');
                            });
                        });
                    }

                }
                if (task.deadline) {
                    const [year, month, day] = task.deadline.split("-").map(Number);
                    const checkController = task.isChecked;
                    markDeadlineOnCalendar(year, month, day, checkController);
                }
            });
        });
    }
    // Calendar's main container
    const currentDay = `${currentDate.getDate()}`;
    const currentMonth = `${currentDate.getMonth()}`;
    const currentYear = `${currentDate.getFullYear()}`;

    const createCalendar = () => {
        // Main calendar row
        const cardBody = addElement("div", { class: "card-body" });
        const calendarRow = addElement("div", { class: "row calendar" });
        cardBody.appendChild(calendarRow);

        //calendar Legends
        const legendsContainer = addElement("div", {class: "calendarLegends"},[
            addElement("div", { class: "legendItem text-info added" }, "追加タスク"),
            addElement("div", { class: "legendItem text-success completed" }, "完了タスク"),
            addElement("div", { class: "legendItem text-danger uncompleted" }, "未完了タスク")
        ]);
        cardBody.appendChild(legendsContainer);



        // Left side (dates and controls)
        const leftCol = addElement("div", { class: "col-12 col-md-7" });
        calendarRow.appendChild(leftCol);

        // Month/Year selectors
        const monthYearRow = addElement("div", { class: "row text-center" });
        const monthYearCol = addElement("div", { class: "col month-year fs-5 fw-bolder text-primary-emphasis" });

        const yearSelect = addElement("select", { class: "form-select d-inline w-auto mx-2", id: "yearSelect", "aria-label": "Select Year" });
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 4; year <= currentYear + 2; year++) {
            const option = addElement("option", null, `${year}年`);
            option.value = year;
            if (year === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }

        const monthSelect = addElement("select", { class: "form-select d-inline w-auto mx-2", id: "monthSelect", "aria-label": "Select Month" });
        const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
        months.forEach((month, index) => {
            const option = addElement("option", { value: index + 1 }, month);
            if (index === new Date().getMonth()) option.selected = true;
            monthSelect.appendChild(option);
        });

        monthYearCol.appendChild(yearSelect);
        monthYearCol.appendChild(monthSelect);
        monthYearRow.appendChild(monthYearCol);
        leftCol.appendChild(monthYearRow);

        // Weekday headers
        const weekHeaderRow = addElement("div", { class: "row text-center text-primary-emphasis" });
        const days = ["日", "月", "火", "水", "木", "金", "土"];
        days.forEach(day => {
            const dayCol = addElement("div", { class: "col day" }, day);
            weekHeaderRow.appendChild(dayCol);
        });
        leftCol.appendChild(weekHeaderRow);

        // Dates rows 
        const datesContainer = addElement("div", { class: "dates-container" });
        leftCol.appendChild(datesContainer);
        

        // Right side (day details)
        const rightCol = addElement("div", { class: "col-12 col-md-5" });
        calendarRow.appendChild(rightCol);

        const dayInfoRow = addElement("div", { class: "row text-info-emphasis text-center h-100 bg-info-subtle bg-gradient py-3" });
        const dayInfo = addElement("div", { class: "day-info d-flex flex-column justify-content-center" });

        const dayNumber = addElement("p", { class: "fs-1 fw-bolder m-0", id: "dayNumber" });
        const dayName = addElement("p", { id: "dayName" });

        dayInfo.appendChild(dayNumber);
        dayInfo.appendChild(dayName);
        dayInfoRow.appendChild(dayInfo);
        rightCol.appendChild(dayInfoRow);

        // Add Event Listeners
        yearSelect.addEventListener("change", updateCalendar);
        monthSelect.addEventListener("change", updateCalendar);
        
        return cardBody;
    };
    
    // Function to calculate the calendar depending of selected year/month
    const updateCalendar = () => {
        const year = parseInt(document.getElementById("yearSelect").value);
        const month = parseInt(document.getElementById("monthSelect").value) - 1;
        const datesContainer = document.querySelector(".dates-container");
        datesContainer.innerHTML = "";
        const removeTask = document.querySelectorAll(".tasks");
        if(removeTask.length > 0){
            removeTask.forEach(task => {
                task.remove();
            });
        }
        
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        
        let dayCount = 1;
        for (let week = 0; week < 6; week++) {
            const weekRow = addElement("div", { class: "row text-center text-body-secondary" });
            for (let day = 0; day < 7; day++) {
                const dateCol = addElement("div", { class: "col date", style: "cursor: pointer" });
                const dotContainer = addElement("div", { class: "dotContainer" });
                if ((week === 0 && day < firstDay) || dayCount > lastDate) {
                    dateCol.classList.add("bg-dark-subtle");
                    weekRow.appendChild(dateCol);
                } else {
                    dateCol.textContent = dayCount;
                    dateCol.dataset.date = dayCount; 
                    dateCol.appendChild(dotContainer);
                    if(dateCol.textContent === currentDay && year.toString()  === currentYear && month.toString()  === currentMonth){
                        dateCol.classList.add("bg-primary-subtle", "text-primary-emphasis");
                    }
                    dateCol.addEventListener("click", (event) => {
                        const removeTask = document.querySelectorAll(".tasks");
                        const blueDot = document.querySelectorAll(".blue-dot");
                        if(removeTask.length > 0){
                            removeTask.forEach(task => {
                                task.remove();
                            });
                        }
                        if(blueDot.length > 0){
                            blueDot.forEach(dot => {
                                dot.remove();
                            });
                        }
                        showDayInfo(year, month, parseInt(event.target.dataset.date));
                    });
                    weekRow.appendChild(dateCol);
                    dayCount++;
                }
            }
            datesContainer.appendChild(weekRow);
        }
        showDayInfo(currentYear , currentMonth, currentDay)
    };

    // Add calendar to DOM
    card.appendChild(createCalendar());
    const dayInfo = document.querySelector(".day-info");
    
    // Show day details (tasks, date, day of week)
    const showDayInfo = (year, month, day) => {
        const date = new Date(year, month, day);
        document.getElementById("dayNumber").textContent = `${day}日`;
        document.getElementById("dayName").textContent = date.toLocaleDateString("ja-JP", { weekday: 'long' });
        
        loadTasks(dayInfo, year, month, day);
    };

    const markDeadlineOnCalendar = (year, month, day, checkController) => {
        const selectedYear = parseInt(document.getElementById("yearSelect").value);
        const selectedMonth = parseInt(document.getElementById("monthSelect").value);
        
        // Verify if the year/month coincide with the actual date
        if (year === selectedYear && month === selectedMonth) {
            const dateElements = document.querySelectorAll(".dates-container .col.date");

            dateElements.forEach(dateElement => {
                if (parseInt(dateElement.textContent) === day) {
                    if(year === Number(currentYear) && month === (Number(currentMonth) + 1) && day >= Number(currentDay)){
                        const dotContainer = dateElement.querySelector(".dotContainer");
                        const blueDot = addElement("span", { class: "blue-dot" });
                        blueDot.classList.add("bg-info");
                        dotContainer.appendChild(blueDot);
                        if(checkController){
                            blueDot.classList.remove("bg-info");
                            blueDot.classList.add("bg-success");
                        }
                    } else{
                        const dotContainer = dateElement.querySelector(".dotContainer");
                        const blueDot = addElement("span", { class: "blue-dot" });
                        blueDot.classList.add("bg-danger");
                        dotContainer.appendChild(blueDot);
                        if(checkController){
                            blueDot.classList.remove("bg-danger");
                            blueDot.classList.add("bg-success");
                        }
                    }
                }
                
            });
        }
    };

    updateCalendar();
    setTimeout(() => {
        fadeIn(card, 20); // Hace un fade in en 1 segundo
    }, 150);
    
    // create dashboard trophy card ----------------------------------------------------------------------------------
    const cardBody = addElement('div', { class: 'card-body text-primary-emphasis d-flex flex-wrap align-content-center' });
    
    // Create the section's title
    const trophyTitle = addElement('h3', { class: 'mb-3' }, 'Trophy');
    const noTrophyText = addElement('p', { class: 'trophyText align-content-center m-0 w-100'}, `There's no trophies yet.`);
    cardBody.appendChild(trophyTitle);
    cardBody.appendChild(noTrophyText)
    
    // Función para agregar trofeos según el tipo de logro
    function addTrophy(type, milestones, shownMilestones) {
        // Verificar que `shownMilestones` sea un array
        if (Array.isArray(shownMilestones)) {
            // Recorrer los logros mostrados y agregar un trofeo por cada uno
            shownMilestones.forEach(milestone => {
                //remove NoTrophy text
                noTrophyText.remove();

                // Crear el contenedor del trofeo
                const trophyContainer = addElement('div', { class: 'trophyContainer mb-2' });

                // Crear la imagen del trofeo
                const trophyImg = addElement('img', { src: '/img/trophy.svg', class: `trophy ${type === 'tasksCompleted' ? 'completed' : type === 'tasksShared' ? 'shared' : ''}` });
                
                // Crear el texto que describe el trofeo
                const trophyText = addElement('p', { class: 'trophyText align-content-center m-0' }, `${milestone} ${type === 'tasksAdded' ? 'タスクを追加しました!' : type === 'tasksCompleted' ? 'タスクを完了しました!' : 'タスクを共有しました!'}`);
                
                // Añadir la imagen y el texto al contenedor del trofeo
                trophyContainer.appendChild(trophyImg);
                trophyContainer.appendChild(trophyText);

                // Añadir el trofeo al contenedor principal
                cardBody.appendChild(trophyContainer);
            });
        } else {
            console.warn(`El valor de ${type} en shownMilestones no es un array.`);
        }
    }

    // Agregar los trofeos de cada tipo
    addTrophy('tasksAdded', achievements.milestones.tasksAdded, achievements.shownMilestones.tasksAdded);
    addTrophy('tasksCompleted', achievements.milestones.tasksCompleted, achievements.shownMilestones.tasksCompleted);
    addTrophy('tasksShared', achievements.milestones.tasksShared, achievements.shownMilestones.tasksShared);

    // Añadir todo al contenedor deseado
    const trophyContainer = document.querySelector(".trophies");
    trophyContainer.appendChild(cardBody);


    // charts creation ----------------------------------------------------------------------------------------------
    const oldLibrary = document.querySelector("#dinamicLibrary");
    if(oldLibrary){
        oldLibrary.remove();
    }
    const addScriptLibrary = addElement('script', {id: 'dinamicLibrary',src: 'https://cdn.jsdelivr.net/npm/chart.js'});
    document.body.appendChild(addScriptLibrary);
    addScriptLibrary.onload = () => loadChartScript();
    
    const canvasContainer = document.querySelector(".graphs");
    const containerBody = addElement('div', { class: "card-body text-primary-emphasis d-flex flex-wrap align-content-center"});
    canvasContainer.appendChild(containerBody);

    // Create the section's title
    const graphTitle = addElement('h3', { class: 'mb-3' }, 'Daily charts');
    containerBody.appendChild(graphTitle);

    // create canvas
    const canvas = addElement('canvas', {id: 'tasksChart', height: '250px'});
    containerBody.appendChild(canvas);
    
    // Función para generar el chart
    function loadChartScript() {
        loadUsersFromDB(function () {
            // Obtenemos el contexto del canvas
            const ctx = document.getElementById("tasksChart").getContext("2d");

            // Inicializamos un array para contar las tareas
            const taskCountByMonth = new Array(12).fill(0);
            const completedTaskCountByMonth = new Array(12).fill(0);

            // Recorremos el array de tareas
                userTask = JSON.parse(localStorage.getItem(`userTask_${userID}`));
                userTask.forEach(task => {
                    const [year, month, day] = task.deadline.split("-").map(Number); // Extraemos año, mes y día
                    const monthIndex = month - 1; // El mes está entre 1 y 12, pero los índices de los arrays son 0-11
                    taskCountByMonth[monthIndex] += 1; // Incrementamos el contador para ese mes
        
                    if (task.isChecked) completedTaskCountByMonth[monthIndex] += 1; // Incrementamos el contador para tareas completadas
                });
                
                // Crear un gradientes para el fondo del gráfico
                const gradientCreated = ctx.createLinearGradient(0, 0, 0, 225);
            gradientCreated.addColorStop(0, "rgba(75, 192, 192, 0.8)");
            gradientCreated.addColorStop(1, "rgba(75, 192, 192, 0)");
        
            const gradientCompleted = ctx.createLinearGradient(0, 0, 0, 225);
            gradientCompleted.addColorStop(0, "rgba(153, 102, 255, 0.8)");
            gradientCompleted.addColorStop(1, "rgba(153, 102, 255, 0)");
            
            // Datos simulados (tareas por mes, por ejemplo)
            const taskData = {
                labels: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
                datasets: [
                    {
                        label: "追加タスク",
                        data: taskCountByMonth, // Cambia estos valores dinámicamente
                        fill: true,
                        backgroundColor: gradientCreated,
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 2
                    },
                    {
                        label: "完了タスク",
                        data: completedTaskCountByMonth, // Usamos el array completedTaskCountByMonth para las tareas completadas
                        fill: true,
                        backgroundColor: gradientCompleted, // Diferente color para las tareas completadas
                        borderColor: "rgba(153, 102, 255, 1)",
                        borderWidth: 2
                    }
                ]
            };
        
            // Configuración del gráfico
            const config = {
                type: "line", // Cambia a "line", "pie", etc., si prefieres otro tipo de gráfico
                data: taskData,
                options: {
                    responsive: true,
                    maintainAspectRatio: true, // Mantener el aspecto del gráfico al redimensionar
                    aspectRatio: 2,
                    legend: {
                        display: true, // No mostrar la leyenda
                        position: "top"
                    },
                    tooltips: {
                        intersect: false, // Mostrar el tooltip al pasar por encima de la línea
                        mode: "index"
                    },
                    hover: {
                        intersect: true // El tooltip solo aparece cuando el mouse pasa por encima de la línea
                    },
                    plugins: {
                        filler: {
                            propagate: false // Evitar que el relleno de los gráficos se propague
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false // Ocultar las líneas de la cuadrícula
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5 // Ajusta el paso de los valores en el eje Y
                        },
                        grid: {
                            color: "rgba(0,0,0,0.1)" // Ocultar las líneas de la cuadrícula en el eje Y
                        },
                        borderDash: [3, 3] // Líneas discontinuas en el borde del eje Y
                    }
                }
            };

            // Crear y renderizar el gráfico
            new Chart(ctx, config);
        });
    }

    document.querySelector(".edit").addEventListener('click', () => {
        modalForm();
    });
}
dashboard();