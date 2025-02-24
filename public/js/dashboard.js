function dashboard(){
    const loadUsersFromDB = (callback) => {
        const userID = localStorage.getItem('userID');
        Promise.all([
            fetch(`http://${serverIP}:3000/users`) // Cambia esta URL según tu configuración
                .then(response => {
                    if (!response.ok) throw new Error('Error fetching users');
                    return response.json();
                }),
            fetch(`http://${serverIP}:3000/tasks/${userID}`)
                .then(response => {
                    if (!response.ok) throw new Error('Error fetching tasks');
                    return response.json();
                }),
            fetch(`http://${serverIP}:3000/events/${userID}`)
                .then(response => {
                    if (!response.ok) throw new Error('Error fetching tasks');
                    return response.json();
                })
            ])
            .then(([users, tasks, events]) => {
            localStorage.setItem((`userTask_${userID}`), JSON.stringify(tasks));
            localStorage.setItem(`userEvents_${userID}`, JSON.stringify(events));
            // Pasar los datos combinados al callback
            callback({ users, tasks, events });
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
    document.querySelector('#userID').textContent = userID;
    document.querySelector('#userImage').src = userImage;

    // ----------------------------------------- handling the logout -------------------------------------------------------------------
    document.querySelector('#logout').addEventListener('click', function() {
        localStorageRemoveItem(userID)
        loadView("login");
    });
    
    const aisatsu = addElement('h3', {class: 'text-primary-emphasis my-4 fs-4 text-center'}, `ようこそ、 <span class="text-info">${userName.match(/^[^\s]+/)}</span>さん。 <span style="display: inline-block;">今日のタスクを確認しましょう。</span>`);
    aisatsu.style.transition = ".5s ease-in-out";
    aisatsu.style.opacity = "0";
    aisatsu.style.transform = "translateY(-80px)";
    const card = document.querySelector('#calendar');

    card.parentNode.insertBefore(aisatsu, card);
    setTimeout(() => {
        fadeIn(aisatsu, 200); // Hace un fade in en 1 segundo
    }, 20);

    // Calendar creation -------------------------------------------------------------------------------------------------------------
    loadUsersFromDB(function ({ users, tasks, events }) {
        var calendarEl = document.getElementById('calendar');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // task to calendar events
        const taskEvents = tasks.map(task => {
            const deadline = new Date(task.deadline);
            deadline.setHours(0, 0, 0, 0); 

            let taskColor = ''; 

            if (task.isChecked) {
                taskColor = 'green'; // completed task (bg-success)
                textColor = 'white';
            } else if (deadline >= today) {
                taskColor = '#e2e3e5'; // uncompleted task (bg-secondary-subtle)
                textColor = '#0d6efd';
            } else {
                taskColor = '#f8d7da'; // expired task (bg-danger)
                textColor = 'red';
            }

            return {
                title: `${task.title}`,  
                start: task.deadline,       
                color: taskColor, 
                textColor: textColor,
                extendedProps: { type: 'task' } // Propiedad adicional para diferenciar en clics
            };
        });

        // events to calendar
        const calendarEvents = events.map(event => {
            const eventObj = {
                title: event.title,
                start: event.start,
                end: event.end || event.start,
                color: '#0d6efd', // Color para eventos normales
                extendedProps: { 
                    type: 'event', 
                    place: event.place,
                    content: event.content
                }
            };
        
            // Si el evento tiene recurrencia, la agregamos a extendedProps
            if (event.recurrence) {
                eventObj.extendedProps.recurrence = {
                    type: event.recurrence.type,
                    interval: parseInt(event.recurrence.interval),
                    endDate: event.recurrence.endDate
                };
            }
        
            return eventObj;
        });

        const generateRecurringEvents = (event) => {
            if (!event.extendedProps.recurrence) return [event];
        
            const { type, interval, endDate } = event.extendedProps.recurrence;
            let generatedEvents = [];
            
            let originalStart = new Date(event.start);
            let originalEnd = event.end ? new Date(event.end) : null;
            let currentDate = new Date(originalStart); 
            let finalDate = new Date(endDate);
            finalDate.setHours(23, 59, 59, 999); // Asegurar comparación correcta
        
            while (currentDate <= finalDate) {
                let newStart = formatDateTime(event.start, currentDate);
                let newEnd = originalEnd ? formatDateTime(event.end, currentDate) : null;
        
                let newEvent = {
                    ...event,
                    start: newStart,
                    end: newEnd
                };
        
                generatedEvents.push(newEvent);
        
                // Avanzamos según la recurrencia
                if (type === "daily") currentDate.setDate(currentDate.getDate() + interval);
                if (type === "weekly") currentDate.setDate(currentDate.getDate() + 7 * interval);
                if (type === "monthly") currentDate.setMonth(currentDate.getMonth() + interval);
            }
        
            return generatedEvents;
        };
        
        // 🛠 Formatea la fecha manteniendo la hora original si existe
        const formatDateTime = (original, newDate) => {
            let [datePart, timePart] = original.split("T");
            
            if (!timePart) {
                return newDate.toISOString().split("T")[0]; // Evento de todo el día
            } else {
                let formattedDate = newDate.toISOString().split("T")[0]; 
                return `${formattedDate}T${timePart}`; // Mantiene la hora original
            }
        };      
        
        // Generamos todos los eventos recurrentes
        const allRecurringEvents = calendarEvents.flatMap(generateRecurringEvents);

        const allEvents = [...taskEvents, ...allRecurringEvents];
    
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            height: '90vh',
            initialDate: today,
            locale: 'ja',
            buttonIcons: true, // show the prev/next text
            weekNumbers: false,
            navLinks: true, // can click day/week names to navigate views
            editable: true,
            dayMaxEvents: true, // allow "more" link when too many events
            headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: allEvents,           
            dateClick: function(info) {
                generateEventForm(info.dateStr, users, events);
            },                  
            eventClick: function(info) {
                if (info.event.extendedProps.type === 'task') {
                    alert(`Tarea: ${info.event.title}\nFecha: ${info.event.start.toISOString().split('T')[0]}`);
                } else {
                    generateModalView(info.event);
                }
            }
        });
    
        calendar.render();
    });

    setTimeout(() => {
        fadeIn(card, 20);
    }, 150);

    //event modal view creation -----------------------------------------------------------------------------
    const generateModalView = (infoEvent) => {
        console.log(infoEvent);
        const modalContent = addElement("div",{class: "modal-content"});
        const modalHeader = addElement("div", { class: "modal-header"}, `<h3 class="modal-title fs-5" id="exampleModalLabel">イベント：${infoEvent.title}</h3><button type="button" class="btn-close btnModalClose" data-bs-dismiss="modal" aria-label="Close"></button>`);
        const modalBody = addElement("div", { class: "modal-body" });
        const eventViewContainer = addElement("div", { class: "eventViewContainer" });

        // event Content Wrapper
        const eventContent = addElement("div", { id: "eventView" });
        eventViewContainer.appendChild(eventContent);

        // Sections Mapping
        const sections = [
            { title: "日時", content: (infoEvent.endStr ? `${infoEvent.startStr}　～　${infoEvent.endStr}` : infoEvent.startStr) },
            ...(infoEvent.extendedProps.content? [{ title: "内容", content: infoEvent.extendedProps.content }] : [{ title: "内容", content: "no content" }]),
            ...(infoEvent.extendedProps.place ? [{ title: "場所", content: infoEvent.extendedProps.place }] : [])
        ];
        
        // Generate Each Section
        console.log(sections);
        if(sections.length !== 0){
            sections.forEach(section => {
                const sectionRow = addElement("div", { class: "row border-bottom mb-2 pb-2" });
                const sectionCol = addElement("div", { class: "col" });
                sectionCol.appendChild(addElement("h3", { class: "reportType text-primary-emphasis fs-5 mt-4 mb-2" }, `<strong>${section.title}</strong>`));
                sectionCol.appendChild(document.createTextNode(section.content));
                sectionRow.appendChild(sectionCol);
                eventContent.appendChild(sectionRow);
            });
        }

        modalDialog.innerHTML = ""; // Clear existing content
        modalBody.appendChild(eventViewContainer);
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalDialog.appendChild(modalContent);

        const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'));
        exampleModal.show();
    }

    //event modal view creation ------------------------------------------------------------------------------
    const generateEventForm = (dateInfo, usersInfo, eventsInfo) => {
        modalDialog.innerHTML = "";

        const modalContent = addElement("div",{class: "modal-content"});
        const modalHeader = addElement("div", { class: "modal-header"}, `<h3 class="modal-title fs-5" id="exampleModalLabel">${dateInfo}の予定を追加</h3><button type="button" class="btn-close btnModalClose" data-bs-dismiss="modal" aria-label="Close"></button>`);
        const modalBody = addElement("div", { class: "modal-body" });
        const eventFormContainer = addElement("form", { id: "eventForm" });

        const fragment = document.createDocumentFragment();
        
        const hourStartInput = addElement("select", {
            id: "hourStartDate",
            class: "form-select mb-3",
            name: "hourStartDate",
            required: true
        });
        const minStartInput = addElement("select", {
            id: "minStartDate",
            class: "form-select mb-3",
            name: "minStartDate",
            required: true
        });
        const hourEndInput = addElement("select", {
            id: "hourEndDate",
            class: "form-select mb-3",
            name: "hourEndDate",
            required: true
        });
        const minEndInput = addElement("select", {
            id: "minEndDate",
            class: "form-select mb-3",
            name: "minEndDate",
            required: true
        });
        for (let h = 0; h < 24; h++) {
            const hourformat = h.toString().padStart(2, '0');
            const optionStart = addElement("option", { value: `${hourformat.toString()}` }, `${hourformat}時`);
            const optionEnd = addElement("option", { value: `${hourformat.toString()}` }, `${hourformat}時`);
            
            hourStartInput.appendChild(optionStart);
            hourEndInput.appendChild(optionEnd);
        }
        for (let m = 0; m < 60; m += 5) {
            const minuteformat = m.toString().padStart(2, '0');
            const optionStart = addElement("option", { value: `${minuteformat.toString()}` }, `${minuteformat}分`);
            const optionEnd = addElement("option", { value: `${minuteformat.toString()}` }, `${minuteformat}分`);
            
            minStartInput.appendChild(optionStart);
            minEndInput.appendChild(optionEnd);
        }
        const separatorTime = addElement("span", {class:"input-group-text mb-3"}, "～");

        const checkcontainer1 = addElement("div");
        const checkcontainer2 = addElement("div");
        const allDayCheck = addElement("input",{
            type: "checkbox",
            id: "allDay-checkbox",
            name: "allDay-checkbox"
        });
        const repeatCheck = addElement("input",{
            type: "checkbox",
            id: "repeat-checkbox",
            name: "repeat-checkbox"
        });
        
        const recurrenceType = addElement("select", {
            id: "recurrence",
            class: "form-select",
            name: "recurrence",
            required: true,
            disabled: ""
        },`
        <option value="daily">毎日</option>
        <option value="weekly">毎週</option>
        <option value="monthly">毎月</option>
        `);
        const interval = addElement("select", {
            id: "interval",
            name: "interval",
            class: "form-select",
            disabled: ""
        },`
        <option value="1">無し</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        `);
        const finalDate = addElement("input",{
            type: "date",
            id: "finalDate",
            name: "finalDate",
            class: "form-control",
            disabled: ""
        });
        const eventTitleInput = addElement("input", {
            type: "text",
            id: "eventTitle",
            class: "form-control mb-3",
            name: "eventTitle",
            placeholder: "タイトル",
            required: true
        });
        const eventPlaceInput = addElement("input", {
            type: "text",
            id: "eventPlace",
            class: "form-control mb-3",
            name: "eventPlace",
            placeholder: "場所"
        });
        const contentInput = addElement("textarea", {
            id: "content",
            class: "form-control mb-3",
            name: "completedTask",
            placeholder: "内容",
            style: "height: 150px;"
        });
        const participantsInput = addElement("select", {
            id: "participants",
            class: "form-select mb-3",
            name: "participants",
            multiple: ''
        });
        usersInfo.forEach(u => {
            const option = addElement("option", { value: `${ (u.id).replace(/\W+/g, '') }` }, `${u.name}`);
            participantsInput.appendChild(option);
        });
        
        const btnGroup = addElement("div", { class: "btn-group" });
        const submitButton = addElement("button", { type: "submit", class: "btn btn-primary" }, "報告書追加");
        
        // Col and row containers
        const containerRow1 = addElement("div", { class: "row" });
        const containerRow2 = addElement("div", { class: "row hiddenContainer" });
        const containerRow3 = addElement("div", { class: "row" });
        const containerRow4 = addElement("div", { class: "row" });
        const containerCol1 = addElement("div", { class: "col input-group" });
        const containerCol2 = addElement("div", { class: "col-12 col-md-3 align-content-center mb-3" });
        const containerColhidden1 = addElement("div", { class: "col-4 mb-3" });
        const containerColhidden2 = addElement("div", { class: "col-4 mb-3" });
        const containerColhidden3 = addElement("div", { class: "col-4 mb-3" });
        const containerCol3 = addElement("div", { class: "col-12 form-floating" });
        const containerCol5 = addElement("div", { class: "col-12 form-floating" });
        const containerCol6 = addElement("div", { class: "col-12 form-floating" });
        const container9 = addElement("div", { class: "mb-3" });

        //labels
        const allDayLabel = addElement("label", {
            for: "allDay-checkbox",
            class: "form-label fs-6 m-0 me-2"
        }, "<small>終日</small>");
        const repeatLabel = addElement("label", {
            for: "allDay-checkbox",
            class: "form-label fs-6 m-0 me-2"
        }, "<small>繰り返し</small>");
        const startLabel = addElement("label", {
            for: "hourStartDate",
            class: "form-label fs-6"
        }, "<small>日時</small>");
        const recurrencelabel = addElement("label",{
            for: "recurrence",
            class: "form-label ms-2"
        }, "繰り返しパターン");
        const intervallabel = addElement("label",{
            for: "interval",
            class: "form-label ms-2"
        }, "インターバル");
        const finaldatelabel = addElement("label",{
            for: "finalDate",
            class: "form-label ms-2"
        }, "最終日");
        const eventTitleLabel = addElement("label", {
            for: "eventTitle",
            class: "form-label ms-2"
        }, "タイトル");
        const contentLabel = addElement("label", {
            for: "content",
            class: "form-label ms-2"
        }, "内容");
        const placeLabel = addElement("label", {
            for: "eventPlace",
            class: "form-label ms-2"
        }, "場所");
        const participantsLabel = addElement("label", {
            for: "participants",
            class: "form-label ms-2"
        }, "参加ユーザー"); 
        
        // Structure
        containerRow1.append(startLabel,containerCol1, containerCol2);
        containerRow2.append(containerColhidden1, containerColhidden2, containerColhidden3);
        containerRow3.append(containerCol3, containerCol5);
        containerRow4.append(containerCol6);
        
        containerCol1.append(hourStartInput, minStartInput, separatorTime, hourEndInput, minEndInput );
        containerCol2.append(checkcontainer1, checkcontainer2);
        containerColhidden1.append(recurrencelabel, recurrenceType);
        containerColhidden2.append(intervallabel, interval);
        containerColhidden3.append(finaldatelabel, finalDate);
        containerCol3.append(eventTitleInput, eventTitleLabel);
        containerCol5.append(eventPlaceInput, placeLabel);
        containerCol6.append(contentInput, contentLabel);
        container9.append(participantsLabel, participantsInput);
        checkcontainer1.append(allDayLabel, allDayCheck);
        checkcontainer2.append(repeatLabel, repeatCheck);

        fragment.append(containerRow1, containerRow2, containerRow3, containerRow4, container9, btnGroup);
        btnGroup.append(submitButton);
        
        // Insert the fragment into the form's container
        eventFormContainer.appendChild(fragment);
        
        // Insert form's card
        modalBody.appendChild(eventFormContainer);
        modalContent.append(modalHeader, modalBody)
        
        modalDialog.appendChild(modalContent);
        const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'));
        
        // choices select multiple
        var element = document.getElementById('participants');
        var choices = new Choices(element, {
            removeItemButton: true,   // Permite eliminar elementos seleccionados
            searchEnabled: true,      // Activa la búsqueda en el dropdown
            itemSelectText: '',       // Quita el texto predeterminado en el selector
            placeholder: true,        // Activa el texto de placeholder
            placeholderValue: 'ユーザー追加',
            // maxItemCount: 5,          // Límite de opciones seleccionables
            allowHTML: true,          // Permite HTML en las opciones
        });
        
        repeatCheck.addEventListener('click', () => {
            if(repeatCheck.checked === true){
                containerRow2.classList.add("show");
                recurrenceType.removeAttribute("disabled", "")
                interval.removeAttribute("disabled", "")
                finalDate.removeAttribute("disabled", "")
            } else{
                containerRow2.classList.remove("show");
                recurrenceType.setAttribute("disabled", "")
                interval.setAttribute("disabled", "")
                finalDate.setAttribute("disabled", "")
            }
        });
        allDayCheck.addEventListener('click', () => {
            if(allDayCheck.checked === true){
                hourStartInput.setAttribute("disabled", "");
                minStartInput.setAttribute("disabled", "");
                hourEndInput.setAttribute("disabled", "");
                minEndInput.setAttribute("disabled", "");
            } else{
                hourStartInput.removeAttribute("disabled", "");
                minStartInput.removeAttribute("disabled", "");
                hourEndInput.removeAttribute("disabled", "");
                minEndInput.removeAttribute("disabled", "");
            }
        });

        eventFormContainer.addEventListener('submit', (event) => {
            event.preventDefault();
            handleFormSubmit(eventsInfo, dateInfo, exampleModal, choices);
        });
        exampleModal.show();
    };

    // submit button -----------------------------------------------------------------------
    const handleFormSubmit = (eventsInfo, dateInfo, modal, choices) => {
        const hourStart = document.getElementById('hourStartDate');
        const minuteStart = document.getElementById('minStartDate');
        const hourEnd = document.getElementById('hourEndDate');
        const minuteEnd = document.getElementById('minEndDate');
        const repeatcheck = document.getElementById('repeat-checkbox').checked;
        let repeatType;
        let repeatInterval;
        let repeatfinalDate;
        if(repeatcheck === true){
            repeatType = document.getElementById('recurrence').value;
            repeatInterval = document.getElementById('interval').value;
            repeatfinalDate = document.getElementById('finalDate').value;
        }
        const eventTitle = document.getElementById('eventTitle').value;
        const eventPlace = document.getElementById('eventPlace').value;
        const eventContent = document.getElementById('content').value;
        const eventUsers = choices.getValue(true);
        if(eventUsers.length === 0){
            const actualUser = (userID).replace(/\W+/g, '');
            eventUsers.push(actualUser); 
        }

        eventsInfo = eventsInfo.filter(event => event.title !== eventTitle);
        eventsInfo.push({ 
            assignedUsers: eventUsers,
            title: eventTitle,
            start: hourStart.disabled !== true ? (dateInfo + "T" + hourStart.value + ":" + minuteStart.value + ":00") : (dateInfo),
            end: hourEnd.disabled !== true ? (dateInfo + "T" + hourEnd.value + ":" + minuteEnd.value + ":00") : (dateInfo),
            place: eventPlace, 
            content: eventContent,
            type: repeatType ? repeatType : "",
            interval: repeatInterval ? repeatInterval : "",
            endDate: repeatfinalDate ? repeatfinalDate : ""
        });
        const singleEvent = { 
            assignedUsers: eventUsers,
            title: eventTitle,
            start: hourStart.disabled !== true ? (dateInfo + "T" + hourStart.value + ":" + minuteStart.value + ":00") : (dateInfo),
            end: hourEnd.disabled !== true ? (dateInfo + "T" + hourEnd.value + ":" + minuteEnd.value + ":00") : (dateInfo),
            place: eventPlace, 
            content: eventContent,
            type: repeatType ? repeatType : "",
            interval: repeatInterval ? repeatInterval : "",
            endDate: repeatfinalDate ? repeatfinalDate : ""
        }
        if (eventsInfo) {
            saveEvent(singleEvent, eventsInfo);
            closeForm(modal);                
            loadView('dashboard');
        } else {
            alert("Please fill all the fields");
        }
    };
    
    // report saving function ------------------------------------------------------------------------
    function saveEvent(singleEvent, eventsInfo){
        localStorage.setItem(`userEvents_${userID}`, JSON.stringify(eventsInfo));
        
        fetch(`http://${serverIP}:3000/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(singleEvent)
        })
        .then(response => response.json())
        .then(data => {
            console.log('イベントは作成された:', data);
        })
        .catch(err => console.error('Error al agregar el evento:', err));
    };

    // reset add task form -----------------------------------------------------------------------
    const closeForm = (modal) => {
        const eventFormContainer = document.getElementById("eventForm");
        eventFormContainer.removeEventListener('submit', handleFormSubmit);
        eventFormContainer.reset();
        eventFormContainer.innerHTML = "";
        modal.innerHTML = "";
        modal.hide();
    };
    
    // create dashboard trophy card ----------------------------------------------------------------------------------
    const cardBody = addElement('div', { class: 'card-body text-primary-emphasis d-flex flex-wrap align-content-center' });
    
    // Create the section's title
    const trophyTitle = addElement('h3', { class: 'mb-3' }, 'Trophy');
    const noTrophyText = addElement('p', { class: 'trophyText align-content-center m-0 w-100'}, `There's no trophies yet.`);
    cardBody.appendChild(trophyTitle);
    cardBody.appendChild(noTrophyText);
    
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