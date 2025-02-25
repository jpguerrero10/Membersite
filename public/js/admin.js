function admin(){
    const loadUsersFromDB = (callback) => {
        fetch(`http://${serverIP}:3000/users`)
            .then(response => response.json())
            .then(users => {
                callback(users);
            })
            .catch(err => {
                console.error('Error fetching users from the database:', err);
        });
    };

    let adminTimer = null;
    const logoutButton = document.querySelector('#logout');

    
    // ---------------------------------------- Getting user's data from localStorage --------------------------------------------------
    const userName = localStorage.getItem('userName');
    let userImage = localStorage.getItem('userImage');
    const userID = localStorage.getItem('userID');
    
    const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    
    if (userType !== encodedAdminType) {
        document.getElementById('app').innerHTML = `
            <div class="row align-items-center justify-content-center vh-100">
                <div class="text-center">
                <h1>505</h1>
                    <p>Unauthorized access detected.</p>
                    <button onclick="loadView('dashboard')">Go back</button>
                </div>
            </div>
        `;
    }

    function cleanUp() {
        if (adminTimer) {
            clearInterval(adminTimer); // Limpiar el temporizador
        }
        if (logoutButton) {
            logoutButton.removeEventListener('click', handleLogout); // Eliminar el event listener
        }
    }
    
    // ---------------------------------------- displaying data on screen ---------------------------------------------------------------
    document.querySelector('#userName').textContent = userName;
    document.querySelector('#userID').textContent = userID;
    document.querySelector('#userImage').src = userImage;
    
    // ----------------------------------------- handling the logout -------------------------------------------------------------------
    logoutButton.addEventListener('click', function() {
        cleanUp();
        logout(userID);
    });

    function handleLogout() {
        // Limpiar datos almacenados
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userImage');
        localStorage.removeItem('userID');
        localStorage.removeItem('userDescription');
        localStorage.removeItem(`userTask_${userID}`);
        localStorage.removeItem(`achievements_${userID}`);
        localStorage.removeItem(`userReports_${userID}`);
        localStorage.removeItem('userType');
        
        cleanUp(); // Limpiar recursos

        loadView("login"); // Redirigir al login
    }

    logoutButton.addEventListener('click', handleLogout);
    //confirm security
    adminTimer = setInterval(() => {
        if (userType !== encodedAdminType) {
            document.getElementById('app').innerHTML = `
            <div class="row align-items-center justify-content-center vh-100">
                    <div class="text-center">
                    <h1>505</h1>
                        <p>Unauthorized access detected.</p>
                        <button onclick="loadView('dashboard')">Go back</button>
                    </div>
                </div>
            `;
        }
    }, 5000);

    //notifications start
    const notificationContainer = addElement("div", { class:"toast-container position-fixed top-0 end-0 p-3" });

    //-------------------------------------------------------------------------------------------------------

    const createFormInputs = (formContainer, singleItem, reportData) => {
        
        const formCard = addElement("div", { class: "card cardForm border-0 p-4" });
        formCard.style.opacity = "0";
        formCard.style.transform = "translateY(-80px)";

        const fragment = document.createDocumentFragment();

        const switchBtn = addElement("div", { class: "form-check form-switch mb-3 d-flex align-items-center" }, `
            <span class="me-2">週</span>
            <input class="form-check-input switchCustom" type="checkbox" role="switch" id="reportType" ${reportData.type === "月報" ? "checked" : ""}>
            <span class="ms-2">月</span>
        `);
        const dateStartInput = addElement("input", {
            type: "date",
            id: "startDate",
            class: "form-control mb-3",
            name: "startDate",
            min: "2000-01-01",
            max: "2030-01-01",
            value:`${reportData.dateStart}`,
            required: true
        },);
        const dateEndInput = addElement("input", {
            type: "date",
            id: "endDate",
            class: "form-control mb-3",
            name: "endDate",
            min: "2000-01-01",
            max: "2030-01-01",
            value:`${reportData.dateEnd}`,
            required: true
        });
        const skillsInput = addElement("input", {
            type: "text",
            id: "skills",
            class: "form-control mb-3",
            name: "skills",
            placeholder: "技術",
            value:`${reportData.skills}`,
            required: true
        });
        const completedActivitiesInput = addElement("textarea", {
            id: "completedTask",
            class: "form-control mb-3",
            name: "completedTask",
            placeholder: "作業内容",
            required: true
        }, `${reportData.completedTask}`);
        const problemsInput = addElement("textarea", {
            id: "complain",
            class: "form-control mb-3",
            name: "complain",
            placeholder: "現場での懸念事項／その他",
        }, `${reportData.complain}`);
        const nextActivitiesInput = addElement("textarea", {
            id: "nextTask",
            class: "form-control mb-3",
            name: "nextTask",
            placeholder: "翌週・翌月作業予定",
            required: true
        }, `${reportData.nextTask}`);
        const objectiveInput = addElement("textarea", {
            id: "objective",
            class: "form-control mb-3",
            name: "objective",
            placeholder: "個人目標"
        }, `${reportData.objective}`);
        const messageInput = addElement("textarea", {
            id: "message",
            class: "form-control mb-3",
            name: "message",
            placeholder: "会社、メンバーへの意見／その他"
        }, `${reportData.message}`);
        const btnGroup = addElement("div", { class: "btn-group" });
        const submitButton = addElement("button", { type: "submit", class: "btn btn-primary" }, "報告書追加");
        const cancelButton = addElement("button", { type: "button", id: "cancelBtn", class: "btn btn-secondary" }, "キャンセル");
        
        // Col and row containers
        const containerRow1 = addElement("div", { class: "row" });
        const containerRow2 = addElement("div", { class: "row" });
        const containerRow3 = addElement("div", { class: "row" });
        const containerCol1 = addElement("div", { class: "col-12 col-md-3 align-content-center" }, `<label for="reportType" class="form-label fs-6 mb-3"><small>報告書種別</small></label>`);
        const containerCol2 = addElement("div", { class: "col" }, `<label for="startDate" class="form-label fs-6"><small>開始日</small></label>`);
        const containerCol3 = addElement("div", { class: "col" }, `<label for="endDate" class="form-label fs-6"><small>終了日</small></label>`);
        const containerCol4 = addElement("div", { class: "col-12 form-floating" });
        const containerCol5 = addElement("div", { class: "col-12 col-md-6 form-floating" });
        const containerCol6 = addElement("div", { class: "col-12 col-md-6 form-floating" });
        const containerCol7 = addElement("div", { class: "col-12 col-md-6 form-floating" });
        const containerCol8 = addElement("div", { class: "col-12 col-md-6 form-floating" });
        const container9 = addElement("div", { class: "form-floating" });

        //labels
        const skillsLabel = addElement("label", {
            for: "skills",
            class: "form-label ms-2"
        }, "技術");
        const completedActivitiesLabel = addElement("label", {
            for: "completedTask",
            class: "form-label ms-2"
        }, "作業内容");
        const problemsLabel = addElement("label", {
            for: "complain",
            class: "form-label ms-2"
        }, "現場での懸念事項／その他");
        const nextActivitiesLabel = addElement("label", {
            for: "nextTask",
            class: "form-label ms-2"
        }, "翌週・翌月作業予定");
        const objectiveLabel = addElement("label", {
            for: "objective",
            class: "form-label ms-2"
        }, "個人目標");
        const messageLabel = addElement("label", {
            for: "message",
            class: "form-label ms-2"
        }, "会社、メンバーへの意見／その他");

        // Structure
        containerRow1.append(containerCol1, containerCol2, containerCol3, containerCol4);
        containerRow2.append(containerCol5, containerCol6);
        containerRow3.append(containerCol7, containerCol8);

        containerCol1.append(switchBtn);
        containerCol2.append(dateStartInput);
        containerCol3.append(dateEndInput);
        containerCol4.append(skillsInput, skillsLabel);
        containerCol5.append(completedActivitiesInput, completedActivitiesLabel);
        containerCol6.append(problemsInput, problemsLabel);
        containerCol7.append(nextActivitiesInput, nextActivitiesLabel);
        containerCol8.append(objectiveInput, objectiveLabel);
        container9.append(messageInput, messageLabel);

        fragment.append(containerRow1, containerRow2, containerRow3, container9, btnGroup);
        btnGroup.append(submitButton, cancelButton);
        
        // Insert the fragment into the form's container
        formCard.appendChild(fragment);
        
        // Insert form's card
        formContainer.appendChild(formCard);

        setTimeout(() => {
            fadeIn(formCard, 200); // 1s fadein
        }, 10);

        // Hide button while form is showed
        singleItem.hidden = true;
    };

    // submit button -----------------------------------------------------------------------
    const handleFormSubmit = (singleItem, userData, event) => {
        event.preventDefault();

        const formContainer = document.querySelector("#reportform"); 
        const switchbtn = document.querySelector("#reportType").checked ? '月報' : '週報';
        const dateStart = document.querySelector("#startDate").value;
        const dateEnd = document.querySelector("#endDate").value;
        const skills = document.querySelector("#skills").value;
        const completedTask = document.querySelector("#completedTask").value;
        const complain = document.querySelector("#complain").value;
        const nextTask = document.querySelector("#nextTask").value;
        const objective = document.querySelector("#objective").value;
        const message = document.querySelector("#message").value;
        const idReport = singleItem.id;
        const commentsArray = [];

        const reportExists = userData.reports.some(report => report.id == singleItem.id);
        if(reportExists){
            userData.reports = userData.reports.map(report => {
                if (report.id === singleItem.id) {
                    return { id: singleItem.id, type: switchbtn, dateStart: dateStart, dateEnd: dateEnd, skills: skills, completedTask: completedTask, complain: complain, nextTask: nextTask, objective: objective, message: message, commentsArray: commentsArray };
                }
                return report;
            });
            saveFunction(userData, "update");
            addReport(singleItem, switchbtn, dateStart, dateEnd);
            setTimeout(() => {
                closeForm(formContainer, singleItem);//falta empezar a conectar el submit del formulario de edicion.
            }, 200);               
        } else {
            alert("Please fill all the fields");
        }
    };

    // cancel button ---------------------------------------------------------------
    const handleCancel = (singleItem) => {
        const formContainer = document.querySelector("#reportform");   
        fadeOut(document.querySelector(".cardForm"), 150); // 1s fadeout
        setTimeout(() => {
            closeForm(formContainer, singleItem);
        }, 200);
    };

    // reset add task form -----------------------------------------------------------------------
    const closeForm = (formContainer, singleItem) => {
        formContainer.removeEventListener('submit', handleFormSubmit);
        formContainer.reset();
        formContainer.innerHTML = "";
        formContainer.remove();
        singleItem.hidden = false;
        
        exampleModal.hide();
    };
    
    loadUsersFromDB(function(users){
        const usersIndex = users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});
        
        const userTable = document.getElementById("userTable");
        userTable.innerHTML = ""; // Limpia contenido previo

        const thead = addElement("thead", null, `
            <tr>
                <th scope="col">ID</th>
                <th scope="col">Mail</th>
                <th scope="col">Name</th>
                <th scope="col" colspan="3"></th>
            </tr>
        `);
        const tbody = addElement("tbody", { class:"table-group-divider" });
        userTable.appendChild(thead);
        userTable.appendChild(tbody);
        
        users.forEach((user) => {
            //table rows
            const row = addElement("tr", {class: `${(user.id).replace(/\W+/g, '')}`});
    
            //table data
            const idCell = addElement("td", null, user.id);
            const emailCell = addElement("td", null, user.email);
            const nameCell = addElement("td", null, user.name);
            
            //table buttons
            const resetButton = addElement("td", null, `<button class="btn btn-sm btn-warning text-nowrap reset">リセット</button>`);
            const deleteButton = addElement("td", null, `<button class="btn btn-sm btn-danger text-nowrap delete">削除</button>`);
            const editButton = addElement("td", null, `<button class="btn btn-sm btn-primary text-nowrap editReport">報告書編集</button>`);

            // structure
            row.appendChild(idCell);
            row.appendChild(emailCell);
            row.appendChild(nameCell);
            row.appendChild(resetButton);
            row.appendChild(deleteButton);
            row.appendChild(editButton);

            tbody.appendChild(row);

            //listeners
            row.querySelector(`.${(user.id).replace(/\W+/g, '')} .reset`).addEventListener('click', () => resetUser(user.id));
            row.querySelector(`.${(user.id).replace(/\W+/g, '')} .delete`).addEventListener('click', () => deleteUser(user.id));
            row.querySelector(`.${(user.id).replace(/\W+/g, '')} .editReport`).addEventListener('click', () => editReport(user.id));
        });      

        //reports edition-----------------------------------------------------------
        const editReport = (userId) => {
            const user = usersIndex[userId];

            modalDialog.innerHTML = "";
            const modalContent = addElement("div",{class: "modal-content"});
            const modalHeader = addElement("div", { class: "modal-header"}, `<h3 class="modal-title fs-5" id="exampleModalLabel">報告書編集</h3><button type="button" class="btn-close btnModalClose" data-bs-dismiss="modal" aria-label="Close"></button>`);
            const modalBody = addElement("div", { class: "modal-body px-1 py-3" });
            const editionForm = addElement("form", { id:"reportform" });
            const ul = addElement("ul", { class:"list-group list-group-flush", id:"reportList", style: "max-height: 550px; overflow-y: auto; overflow-x: clip;" });

            if(user.reports.length === 0){
                const noItem = addElement("li",{ class: `list-group-item` }, "no items");
                ul.appendChild(noItem);
            }
            user.reports.forEach(report => {
                const newReportItem = addElement("li",{ class: `list-group-item px-0`, id: `${report.id}` });
                const reportRow = addElement("div", { class: "row"});
                const reportCol = addElement("div", { class: "col-12 align-content-center d-flex"});
                const reportType = addElement("p", {class:`type text-dark-emphasis m-0 ${report.type === "週報" ? "weekly" : "monthly"}`}, `<strong>${report.type}</strong>`);
                const reportDeadline = addElement("p", {class:"deadline text-dark-emphasis m-0 ms-2"}, `<strong>${report.dateStart}　～　${report.dateEnd}</strong>`);
                const reportBtn = addElement("button", { role: "button", class: "btn btn-primary text-right text-nowrap ms-auto px-4" }, "編集");
                
                reportCol.appendChild(reportType);
                reportCol.appendChild(reportDeadline);
                reportCol.appendChild(reportBtn);
                reportRow.appendChild(reportCol);
                newReportItem.appendChild(reportRow);
                ul.appendChild(newReportItem);

                reportBtn.addEventListener("click", (event) => {
                    createFormInputs(editionForm, newReportItem, report);
                    setTimeout(() => {
                        editionForm.addEventListener('submit', (e) => handleFormSubmit(newReportItem, user, e) );
                        editionForm.querySelector("#cancelBtn").addEventListener('click', () => handleCancel(newReportItem));
                    }, 10);
                });
            });
            
            modalBody.appendChild(editionForm);
            modalBody.appendChild(ul);
            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalBody);
            modalDialog.appendChild(modalContent);

            exampleModal.show();
        };

        //reset user-----------------------------------------------------------------
        const resetUser = (userId) => {
            const user = usersIndex[userId];
            if (!user) {
                alert("Usuario no encontrado.");
                return;
            }
            
            // Limpia las propiedades
            user.password = "123";
            user.achievements = {
                tasksAdded: 0,
                tasksCompleted: 0,
                tasksShared: 0,
                milestones: {
                    tasksAdded: [10, 50, 100],
                    tasksCompleted: [10, 50, 100],
                    tasksShared: [5, 20, 50],
                },
                shownMilestones: {
                    tasksAdded: [],
                    tasksCompleted: [],
                    tasksShared: [],
                },
            };
            user.reports = [];
            saveFunction(user, "reset");
        };

        //delete user -----------------------------------------------------------------------
        const deleteUser = (userId) => {
            if (!confirm("このユーザーを本当に削除してもいいですか?")) return;
            const user = usersIndex[userId];
        
            const index = users.findIndex((user) => user.id === userId);
            if (index !== -1) {
                users.splice(index, 1);
                document.querySelector(`.${(user.id).replace(/\W+/g, '')}`).remove();
                saveFunction(user, "delete");
            } else {
                alert("ユーザーが見つかりません。");
            }
        };
    });

    // edited report addition
    const addReport = (singleItem, type, dateStart, dateEnd) => {
        singleItem.querySelector(".type").classList.remove("monthly");
        singleItem.querySelector(".type").classList.remove("weekly");
        if(type === "月報"){
            singleItem.querySelector(".type").classList.add("monthly");
            singleItem.querySelector(".type").innerHTML = `<strong>月報</strong>`;
        } else{
            singleItem.querySelector(".type").classList.add("weekly");
            singleItem.querySelector(".type").innerHTML = `<strong>週報</strong>`;
        }
        singleItem.querySelector(".deadline").innerHTML = `<strong>${dateStart}　～　${dateEnd}</strong>`;
    };

    // saving function ------------------------------------------------------------------------
    function saveFunction(userData, action){
        if (action === 'delete') {
            fetch(`http://${serverIP}:3000/users/${encodeURIComponent(userData.id)}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo eliminar la tarea');
                }
                return response.json();
            })
            .then(data => {
                const NotiTitle = `ユーザー削除`
                const NotiDescription = `${userData.id}ユーザーはデータベースから削除されました。`;
                notifications(notificationContainer, NotiDescription, NotiTitle);
            })
            .catch(err => console.error('Error al eliminar la tarea:', err));
        } else if (action === 'reset') {
            fetch(`http://${serverIP}:3000/users/${encodeURIComponent(userData.id)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    password: userData.password,
                    achievements: userData.achievements,
                    reports: userData.reports
                })
            })
            .then(data => {
                const NotiTitle = `ユーザーリセット`
                const NotiDescription = `${userData.id}ユーザーはデータベースからリセットされました。`;
                notifications(notificationContainer, NotiDescription, NotiTitle);
            })
            .catch(err => console.error('Error actualizando los logros:', err));
        } else if (action === 'update') {
            fetch(`http://${serverIP}:3000/users/${encodeURIComponent(userData.id)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reports: userData.reports })
            })
            .then(data => {
                const NotiTitle = `ユーザーリセット`
                const NotiDescription = `${userData.id}ユーザーはの報告書はアップデートされました。`;
                notifications(notificationContainer, NotiDescription, NotiTitle);
            })
            .catch(err => console.error('Error actualizando los informes:', err));
        };
    };
    //notifications end
    const mainContainer = document.querySelector(".table-responsive");
    mainContainer.parentNode.insertBefore(notificationContainer, mainContainer);

    document.querySelector(".edit").addEventListener('click', () => {
        modalForm();
    });

    window.addEventListener('beforeunload', cleanUp);
}
admin();