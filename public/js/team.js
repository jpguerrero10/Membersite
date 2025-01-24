function team() {
    const loadUsersFromDB = (callback) => {
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
    let userTask
    if (userID) {
        fetch(`http://localhost:3000/tasks/${userID}`)
            .then(response => response.json())
            .then(tasks => {
                localStorage.setItem((`userTask_${userID}`), JSON.stringify(tasks));
            })
            .catch(error => console.error('Error al obtener las tareas:', error));
        }
    userTask = JSON.parse(localStorage.getItem(`userTask_${userID}`));

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

    // team users ----------------------------------------------------------------------------------------------------------------------
    const teamContainer = document.querySelector(".teamContainer");
    const loggedUserTasks = userTask;
    // cargamos datos desde DB
    loadUsersFromDB(function ({ users, tasks }) {
        const notificationContainer = addElement("div", { class:"toast-container position-fixed top-0 end-0 p-3" });
        users.forEach(user => {
            const userIdClass = (user.id).replace(/\W+/g, '');
            if(user.email !== userEmail){
                const usersCol = addElement("div", {class: `col-6 col-md-6 col-lg-4 my-2 ${userIdClass}`});
                const usersCard = addElement("div", {class: "card py-3 shadow-sm profileCard"});
                usersCard.style.transition = ".5s ease-in-out";
                usersCard.style.opacity = "0";
                usersCard.style.transform = "translateY(-80px)";
                const usersImage = addElement("img", {class: "teamImage rounded-circle border border-white border-4"});
                const imagePath = user.image;
                if(imagePath instanceof Blob){
                    usersImage.src = URL.createObjectURL(imagePath);
                } else{
                    usersImage.src = user.image;
                }
                const usersTitle = addElement("h3", {class: "text-center text-primary-emphasis fs-5"}, user.name);
                const usersID = addElement("p", { class:"text-center mb-4 text-body-tertiary"}, user.id)
                const shareBtnGroup = addElement("div", {class:"btn-group btn-group-sm", role:"group"},`
                    <button type="button" class="btn btn-seemore btn-outline-primary">タスク</button>
                    <button type="button" class="btn btn-reports btn-outline-dark">報告書</button>
                `);
                teamContainer.appendChild(usersCol);
                usersCol.appendChild(usersCard);
                usersCard.appendChild(usersImage);
                usersCard.appendChild(usersTitle);
                usersCard.appendChild(usersID);
                usersCard.appendChild(shareBtnGroup);

                setTimeout(() => {
                    fadeIn(usersCard, 200); // Hace un fade in en 1 segundo
                }, 20);

                teamContainer.querySelector(`.${userIdClass} .btn-seemore`).addEventListener('click', function(event){
                    handleUserShare(event);
                });
                teamContainer.querySelector(`.${userIdClass} .btn-reports`).addEventListener('click', function(event){
                    handleUserReports(event);
                });
            } 

            function handleUserShare(event) {
                event.preventDefault();
                resetMainUser();
                disableButton('share');
                
                teamContainer.querySelector(`.${userIdClass}`).classList.remove('col-6', 'col-md-6', 'col-lg-4');
                teamContainer.querySelector(`.${userIdClass}`).classList.add('col-12', 'col-md-12', 'col-lg-12');
                teamContainer.querySelector(`.${userIdClass}`).classList.add('order-first', 'card-group');
                teamContainer.querySelector(`.${userIdClass} .profileCard`).classList.add('justify-content-center');
                
                const shareTasks = addElement("div", { class: "card pt-3 pb-5 shadow-sm viewTasks", style: "flex: 2 0 0%;" });
                const closeBtn = addElement("button", { type: "button", class: "ms-auto me-2 mb-3 btn-close" });
                closeBtn.setAttribute("aria-label", "Close");
                const shareTaskTitle = addElement("h4", { class: "text-body-secondary fs-6 ms-3" }, `${(user.name).match(/^[^\s]+/)}のタスク`);

                shareTasks.appendChild(closeBtn);
                shareTasks.appendChild(shareTaskTitle);

                let taskAdded = false;
                //show every not checked task
                tasks.forEach((task, index) => {
                    if (task.isChecked === false && task.assignedUsers.some(userId => userId.replace(/\W+/g, '') === user.id.replace(/\W+/g, ''))) {
                        taskAdded = true;
                        
                        const tasks = addElement("div", { class: "task alert alert-light my-1" }, `<span>${task.deadline}</span> ${task.title}`);

                        const shareButton = addElement("button", {
                            type: "button",
                            class: "btn btn-outline-info btn-sm",
                            "data-task-id": index
                        }, "タスク受領");

                        // add listener to share tasks
                        shareButton.addEventListener('click', function() {
                            // Insertar la nueva tarea en el contenedor de tareas
                            const clonedTasks = addElement("div", { class: "task alert alert-light my-1" }, `<span>${task.deadline}</span> ${task.title}`);
                            const shareButtonDisabled = addElement("button", {
                                type: "button",
                                class: "btn btn-outline-secondary btn-sm",
                                disabled: true
                            }, "タスク共有");
                            clonedTasks.appendChild(shareButtonDisabled);
                            shareTasks.appendChild(clonedTasks);
                            
                            noTaskVerification(taskAdded, shareTasks);

                            task.assignedUsers.push((userID).replace(/\W+/g, ''));
                            shareTask(task);
                        });
                        
                        
                        tasks.appendChild(shareButton);
                        shareTasks.appendChild(tasks);
                    }
                });
                
                noTaskVerification(taskAdded, shareTasks);

                function shareTask(task){
                    userTask = userTask.filter(usertask => usertask.title !== task.title || usertask.description !== task.description);
                    userTask.push({title: task.title, description: task.description, deadline: task.deadline, isChecked: task.isChecked, assignedUsers: task.assignedUsers});//falta arreglar el push
                    let sharedTask = {title: task.title, description: task.description, deadline: task.deadline, isChecked: task.isChecked, assignedUsers: task.assignedUsers};
                    saveAtDB(sharedTask, task.title);
                }

                let selfTaskAdded = false;
                const sendTaskTitle = addElement("h4", { class: "text-body-secondary fs-6 ms-3 mt-3" }, `自分のタスク`);
                shareTasks.appendChild(sendTaskTitle);
                loggedUserTasks.forEach((task, index) => {
                    if (task.isChecked === false) {
                        selfTaskAdded = true;
                        
                        // Create button and assign listener
                        const tasks = addElement("div", { class: "task alert alert-light my-1" }, `<span>${task.deadline}</span> ${task.title}`);

                        const shareButton = addElement("button", {
                            type: "button",
                            class: "btn btn-outline-info btn-sm",
                            "data-task-id": index
                        }, "タスク共有");

                        // add listener
                        shareButton.addEventListener('click', function(event) {
                            achievements.tasksShared++;
                            checkAchievements(achievements);

                            // Insertar la nueva tarea en el contenedor de tareas
                            const clonedTasks = addElement("div", { class: "task alert alert-light my-1" }, `<span>${task.deadline}</span> ${task.title}`);
                            const shareButtonDisabled = addElement("button", {
                                type: "button",
                                class: "btn btn-outline-secondary btn-sm",
                                disabled: true
                            }, "タスク受領");
                            clonedTasks.appendChild(shareButtonDisabled);
                            sendTaskTitle.parentNode.insertBefore(clonedTasks, sendTaskTitle);

                            noTaskVerification(selfTaskAdded, shareTasks);

                            task.assignedUsers.push((user.id).replace(/\W+/g, ''));
                            shareTask(task);
                        });

                        tasks.appendChild(shareButton);
                        shareTasks.appendChild(tasks);
                    }
                }); 

                noTaskVerification(selfTaskAdded, shareTasks);

                document.querySelector(`.teamContainer .${userIdClass}`).appendChild(shareTasks);
                closeBtn.addEventListener('click', (event) =>  {
                    event.preventDefault();
                    handleClose(shareTasks);
                });
            }
            function handleUserReports() {
                resetMainUser();
                disableButton('report');

                teamContainer.querySelector(`.${userIdClass}`).classList.remove('col-6', 'col-md-6', 'col-lg-4');
                teamContainer.querySelector(`.${userIdClass}`).classList.add('col-12', 'col-md-12', 'col-lg-12');
                teamContainer.querySelector(`.${userIdClass}`).classList.add('order-first', 'card-group');
                teamContainer.querySelector(`.${userIdClass} .profileCard`).classList.add('justify-content-center');
                
                const showedReports = addElement("div", { class: "card pt-3 pb-5 shadow-sm viewReports", style: "flex: 2 0 0%;" });
                const closeBtn = addElement("button", { type: "button", class: "ms-auto me-2 mb-3 btn-close" });
                closeBtn.setAttribute("aria-label", "Close");
                const shareTaskTitle = addElement("h4", { class: "text-body-secondary fs-6 ms-3" }, `${(user.name).match(/^[^\s]+/)}の報告書`);

                showedReports.appendChild(closeBtn);
                showedReports.appendChild(shareTaskTitle);

                //show every report
                user.reports.forEach((report, index) => {
                    const reports = addElement("div", { class: "type alert alert-light my-1" }, `<span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="fill: #055160;width: 10px;margin-right: 5px;"><path d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40L64 64C28.7 64 0 92.7 0 128l0 16 0 48L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-256 0-48 0-16c0-35.3-28.7-64-64-64l-40 0 0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40L152 64l0-40zM48 192l352 0 0 256c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256z"/></svg>${report.type}</span> ${report.dateEnd}`);
                    const seemoreButton = addElement("button", {
                        type: "button",
                        class: "btn btn-outline-info btn-sm",
                        "data-task-id": index
                    }, "詳細");

                    showedReports.appendChild(reports);
                    reports.appendChild(seemoreButton);

                    if(report.type === "週報"){
                        reports.classList.add("monthly");
                    }else if(report.type === "月報"){
                        reports.classList.add("weekly");
                    }

                    seemoreButton.addEventListener('click', () => {
                        const singleReport = report;
                        generateReportView(user.reports, singleReport, user.id, userName, userID, userImage); //next part at app file
                    });
                });

                document.querySelector(`.teamContainer .${userIdClass}`).appendChild(showedReports);

                closeBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    handleClose(showedReports);
                });
            }
            // verificate task existence
            function noTaskVerification(taskAdded, shareTasks) {
                const noTasksMessage = document.getElementById("mensaje") || addElement("div", {
                    class: "alert alert-warning text-center",
                    id: "mensaje",
                    style: "width: 90%; margin: 0 auto;"
                }, "タスクがありません。");

                if (!taskAdded) {
                    shareTasks.appendChild(noTasksMessage);
                } else if (noTasksMessage.parentNode) {
                    noTasksMessage.parentNode.removeChild(noTasksMessage);
                }
            }
            function handleClose(shareTasks){
                shareTasks.remove();
                teamContainer.querySelector(`.${userIdClass}`).classList.remove('col-12', 'col-md-12', 'col-lg-12');
                teamContainer.querySelector(`.${userIdClass}`).classList.add('col-6', 'col-md-6', 'col-lg-4');
                teamContainer.querySelector(`.${userIdClass}`).classList.remove('order-first', 'card-group');
                teamContainer.querySelector(`.${userIdClass} .profileCard`).classList.remove('justify-content-center');
                teamContainer.querySelector(`.${userIdClass} .btn-seemore`).classList.replace('btn-outline-secondary', 'btn-outline-primary');
                teamContainer.querySelector(`.${userIdClass} .btn-reports`).classList.replace('btn-outline-secondary', 'btn-outline-dark');
                teamContainer.querySelector(`.${userIdClass} .btn-seemore`).disabled = false;
                teamContainer.querySelector(`.${userIdClass} .btn-reports`).disabled = false;
            }
            function disableButton(action){
                const btnSeemore = teamContainer.querySelector(`.${userIdClass} .btn-seemore`);
                const btnReports = teamContainer.querySelector(`.${userIdClass} .btn-reports`);

                // Restore button's state
                btnSeemore.classList.remove('btn-outline-secondary', 'btn-outline-primary');
                btnSeemore.classList.add('btn-outline-primary');
                btnSeemore.disabled = false;

                btnReports.classList.remove('btn-outline-secondary', 'btn-outline-dark');
                btnReports.classList.add('btn-outline-secondary');
                btnReports.disabled = false;

                if( action === 'share'){
                    teamContainer.querySelector(`.${userIdClass} .btn-seemore`).classList.replace('btn-outline-primary', 'btn-outline-secondary');
                    teamContainer.querySelector(`.${userIdClass} .btn-seemore`).disabled = true;

                    teamContainer.querySelector(`.${userIdClass} .btn-reports`).classList.replace('btn-outline-secondary', 'btn-outline-dark');
                    teamContainer.querySelector(`.${userIdClass} .btn-reports`).disabled = false;
                } else if( action === 'report'){
                    teamContainer.querySelector(`.${userIdClass} .btn-reports`).classList.replace('btn-outline-dark', 'btn-outline-secondary');
                    teamContainer.querySelector(`.${userIdClass} .btn-reports`).disabled = true;

                    teamContainer.querySelector(`.${userIdClass} .btn-seemore`).classList.replace('btn-outline-secondary', 'btn-outline-primary');
                    teamContainer.querySelector(`.${userIdClass} .btn-seemore`).disabled = false;
                }
            }
            function resetMainUser(){
                const viewTasks = document.querySelector(".viewTasks");
                const viewReport = document.querySelector(".viewReports");
                if(viewTasks){
                    viewTasks.innerHTML = "";
                    viewTasks.remove();
                    document.querySelectorAll(`.teamContainer .btn`).forEach(btn => {
                        btn.classList.replace('btn-outline-secondary', 'btn-outline-primary');
                        btn.disabled = false;
                    });
                    document.querySelectorAll(".teamContainer .col-12").forEach(e => {
                        e.classList.remove('order-first', 'card-group');
                        e.classList.remove('col-12', 'col-md-12', 'col-lg-12');
                        e.classList.add('col-6', 'col-md-6', 'col-lg-4');
                    });
                }
                if(viewReport){
                    viewReport.innerHTML = "";
                    viewReport.remove();
                    document.querySelectorAll(`.teamContainer .btn`).forEach(btn => {
                        btn.classList.replace('btn-outline-secondary', 'btn-outline-dark');
                        btn.disabled = false;
                    });
                    document.querySelectorAll(".teamContainer .col-12").forEach(e => {
                        e.classList.remove('order-first', 'card-group');
                        e.classList.remove('col-12', 'col-md-12', 'col-lg-12');
                        e.classList.add('col-6', 'col-md-6', 'col-lg-4');
                    });
                }
            }
            function saveAtDB(task, title) {
                fetch(`http://localhost:3000/tasks/${encodeURIComponent(title)}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(task)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Tarea actualizada:', data);
                    localStorage.setItem((`userTask_${userID}`), JSON.stringify(tasks));

                    updateAchievements(userID, achievements);

                    const NotiTitle = `タスク共有`;
                    const NotiDescription = `タスク「${title}」は成功に共有された。`;
    
                    // Llama a la función de notificación
                    notifications(notificationContainer, NotiDescription, NotiTitle);
                    
                    team();
                })
                .catch(err => console.error('Error al actualizar la tarea:', err));
            }
            //user achievements DB update
            function updateAchievements(userID, achievements){
                localStorage.setItem(`achievements_${userID}`, JSON.stringify(achievements));

                fetch(`http://localhost:3000/users/${userID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ achievements: achievements })
                })
                .catch(err => console.error('Error actualizando los logros:', err));
            }                              
        });
        teamContainer.parentNode.insertBefore(notificationContainer, teamContainer);
    });
    document.querySelector(".edit").addEventListener('click', () => {
        modalForm();
    });
};
team();