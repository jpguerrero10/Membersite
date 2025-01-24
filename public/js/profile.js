function profile() {

    // ---------------------------------------- Getting user's data from localStorage --------------------------------------------
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

    // ----------------------------------------- displaying data on screen ------------------------------------------------------
    document.querySelector('#userName').textContent = userName;
    document.querySelector('#userEmail').textContent = userEmail;
    document.querySelector('#userID').textContent = userID;
    document.querySelector('#userDescription').textContent = userDescription;
    document.querySelector('#userImage').src = userImage;

    // ------------------------------------------ handling the logout -----------------------------------------------------------
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

    //notifications start
    const notificationContainer = addElement("div", { class:"toast-container position-fixed top-0 end-0 p-3" });

    //------------------------------------------------ task creation start ----------------------------------------------------- 

    const newTask = ({listContainer, addButtonSelector, formSelector}) => {
        let tasks = JSON.parse(localStorage.getItem(`userTask_${userID}`)) || [];

        const taskContainer = document.querySelector(listContainer); 
        const addButton = document.querySelector(addButtonSelector);
        const formContainer = document.querySelector(formSelector);

        if (!taskContainer || !addButton || !formContainer) {
            console.error("Specify a valid selector.");
            return null;
        }
        
        
        // form creation -------------------------------------------------------------
        const createFormInputs = () => {
            formContainer.innerHTML = "";
            
            const formCard = addElement("div", { class: "card cardForm shadow p-4 my-3" });
            formCard.style.opacity = "0";
            formCard.style.transform = "translateY(-80px)";
            const containerRow = addElement("div", {class: "row"});
            const containerCol1 = addElement("div", {class: "col"});
            const containerCol2 = addElement("div", {class: "col"});
            const titleInput = addElement("input", {
                type: "text",
                id: "title",
                class: "form-control mb-3",
                name: "title",
                placeholder: "タスク名",
                required: true
            });
            const descriptionInput = addElement("textarea", {
                id: "description",
                class: "form-control mb-3",
                name: "description",
                placeholder: "タスク記述",
                required: true
            });
            const deadlineInput = addElement("input", {
                type: "date",
                id: "deadline",
                class: "form-control mb-3",
                name: "deadline",
                required: true
            });
            const btnGroup = addElement("div", { class: "btn-group"});
            const submitButton = addElement("button", { type: "submit", class: "btn btn-primary" }, "タスク追加");
            const cancelButton = addElement("button", { type: "button", id: "cancelBtn", class: "btn btn-secondary" }, "キャンセル");
            
            formContainer.parentNode.insertBefore(formCard, formContainer);
            formCard.appendChild(formContainer);
            formContainer.appendChild(containerRow);
            containerRow.appendChild(containerCol1);
            containerCol1.appendChild(titleInput);
            containerRow.appendChild(containerCol2);
            containerCol2.appendChild(deadlineInput);
            formContainer.appendChild(descriptionInput);
            descriptionInput.insertAdjacentElement('afterend', btnGroup);
            btnGroup.appendChild(submitButton);
            btnGroup.appendChild(cancelButton);
            setTimeout(() => {
                fadeIn(formCard, 200); // 1s fadein
            }, 20);
            addButton.hidden = true;
        };

        // task creation submit -----------------------------------------------------------------------
        const handleFormSubmit = (event) => {
            event.preventDefault();
            const title = document.querySelector("#title").value;
            const description = document.querySelector("#description").value;
            const deadline = document.querySelector("#deadline").value;
            const isChecked = false;
            
            if (title && description && deadline) {
                achievements.tasksAdded++;
                checkAchievements(achievements);
                addTask(title, description, deadline, isChecked);
                closeForm();                
            } else {
                console.error("Please fill all the fields");
            }
        };

        // task creation cancel button ---------------------------------------------------------------
        const handleCancel = () => {   
            fadeOut(document.querySelector(".cardForm"), 150); // 1s fadeout
            setTimeout(() => {
                closeForm();
            }, 200);
        };
        
        // reset add task form -----------------------------------------------------------------------
        const closeForm = () => {
            formContainer.removeEventListener('submit', handleFormSubmit);
            formContainer.reset();
            formContainer.innerHTML = "";
            document.querySelector(".cardForm").insertAdjacentElement('afterend', formContainer);
            document.querySelector(".cardForm").remove();
            addButton.hidden = false;
        };
        
        // load previous data ------------------------------------------------------------------------
        const loadSavedTasks = () => {
            tasks.forEach((task) => addTask(task.title, task.description, task.deadline, task.isChecked));
        };
        
        // new task creation ------------------------------------------------------------------------
        let index = 0;
        const addTask = (title, description, deadline, isChecked) => {
            const newTaskItem = addElement( "li",{ class: `list-group-item`, id: `task${index}-${deadline}` });
            index++;
            fadeIn(newTaskItem, 30); // 1s fadein
            const fragment = document.createDocumentFragment();
            const taskFlexContainer = addElement('div', { class: "d-flex"});
            const checkInput = addElement("input",{
                type: "checkbox",
                class: "task-checkbox",
                name: "task-checkbox"
            });
            if(isChecked){
                checkInput.checked = true;
            } else{
                checkInput.checked = false;
            }
            const toastBody = addElement("div", { class: "toast-body ms-3" }, `<h3 class="taskTitle text-primary-emphasis fs-5 mb-1 mt-3"><strong>${title}</strong></h3><p class="text-dark-emphasis">${description}</p>`);
            const divDeadline = addElement("div", { class: "deadline ms-auto d-flex flex-wrap"});
            const btnCloseTask = addElement("button", { 
                class: "btn-close close-btn btn-close-success ms-auto",
                arialabel: "close",
                style: "display: none;"
            });
            const btnEdit = addElement("button", {
                class: "btn btn-light position-absolute top-0 end-0",
            },`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="15" height="15" style="fill: #566d83;"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>
            `);
            const paragraphDeadline = addElement("p", { class: "deadlinePill bg-warning-subtle text-dark-emphasis px-2 m-0 mt-auto rounded-pill d-block w-100 text-center" }, `<small><strong>期限:</strong> ${deadline}</small>`);
            
            taskFlexContainer.append(checkInput, toastBody, divDeadline);
            divDeadline.append(btnEdit, btnCloseTask, paragraphDeadline);
            
            fragment.appendChild(taskFlexContainer);
            newTaskItem.appendChild(fragment);
            taskContainer.insertBefore(newTaskItem, taskContainer.firstChild);

            //check function
            setTimeout(() => {
                if(isChecked){
                    newTaskItem.querySelector('h3').classList.remove("text-primary-emphasis");
                    newTaskItem.classList.add("bg-success-subtle", "text-success");
                    btnEdit.style.display = "none";
                    btnCloseTask.style.display = "block";
                    checkInput.setAttribute("checked", "");
                    paragraphDeadline.classList.remove("bg-warning-subtle", "text-dark-emphasis", "px-2");
                    paragraphDeadline.classList.add("bg-info-subtle");
                } else{
                    newTaskItem.classList.remove("bg-success-subtle", "text-success");
                    newTaskItem.querySelector('h3').classList.add("text-primary-emphasis");
                    btnCloseTask.style.display = "none";
                    btnEdit.style.display = "block";
                    checkInput.removeAttribute("checked");
                    paragraphDeadline.classList.remove("bg-info-subtle");
                    paragraphDeadline.classList.add("bg-warning-subtle", "text-dark-emphasis", "px-2");
                }                
            }, 10);

            //close task button
            btnCloseTask.addEventListener('click', () => {
                fadeOut(newTaskItem, 100); // 1 second fadeout
                setTimeout(() => {
                    taskContainer.removeChild(newTaskItem);
                    tasks = tasks.filter(task => task.title !== title || task.description !== description);
                    saveTask("delete", newTaskItem, title);
                }, 300);
            });
            
            //check button
            checkInput.addEventListener("change", () => toggleTaskStatus(newTaskItem, checkInput, btnEdit, btnCloseTask, title, description, deadline, paragraphDeadline));
    
            //edit task button
            btnEdit.addEventListener('click', () => taskEdition(taskContainer, newTaskItem, title, description, checkInput, deadline));

            // task existence verification
            const tasksExist = tasks.some(t => t.title == title && t.description == description);
            if(!tasksExist){
                let assignedUsers = [];
                assignedUsers.push(userID.replace(/\W+/g, ''));
                tasks.push({title, description, deadline, isChecked, assignedUsers});
                let task = {title, description, deadline, isChecked, assignedUsers};
                saveTask("add", task, title);
            }
        };
        
        // checked status function ------------------------------------------------------------------------
        function toggleTaskStatus(newTaskItem, checkInput, btnEdit, btnCloseTask, title, description, deadline, paragraphDeadline){
            if(checkInput.checked){
                newTaskItem.querySelector('h3').classList.remove("text-primary-emphasis");
                newTaskItem.classList.add("bg-success-subtle", "text-success");
                btnEdit.style.display = "none";
                btnCloseTask.style.display = "block";
                checkInput.setAttribute("checked", "");
                paragraphDeadline.classList.remove("bg-warning-subtle", "text-dark-emphasis", "px-2");
                paragraphDeadline.classList.add("bg-info-subtle");
                achievements.tasksCompleted++;
                checkAchievements(achievements);
            } else{
                newTaskItem.classList.remove("bg-success-subtle", "text-success");
                newTaskItem.querySelector('h3').classList.add("text-primary-emphasis");
                btnCloseTask.style.display = "none";
                btnEdit.style.display = "block";
                checkInput.removeAttribute("checked");
                paragraphDeadline.classList.remove("bg-info-subtle");
                paragraphDeadline.classList.add("bg-warning-subtle", "text-dark-emphasis", "px-2");
                achievements.tasksCompleted--;
                checkAchievements(achievements);
            }
            const isChecked = checkInput.checked;
            tasks = tasks.filter(task => task.title !== title || task.description !== description);
            tasks.push({title, description, deadline, isChecked});
            let task = {title, description, deadline, isChecked};
            saveTask("edition", task, title);
        }

        // DB saving function ------------------------------------------------------------------------
        // task DB update
        function saveTask(action, task, title){
            localStorage.setItem(`userTask_${userID}`, JSON.stringify(tasks));
            localStorage.setItem(`achievements_${userID}`, JSON.stringify(achievements));
            
            if(action == "add"){
                fetch('http://localhost:3000/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(task)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Tarea agregada:', data);
                    updateAchievements(userID, achievements);
                })
                .catch(err => console.error('Error al agregar la tarea:', err));
            } else if( action == "edition"){
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
                    updateAchievements(userID, achievements);
                })
                .catch(err => console.error('Error al actualizar la tarea:', err));
            } else if( action == "delete"){
                fetch(`http://localhost:3000/tasks/${encodeURIComponent(title)}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('No se pudo eliminar la tarea');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Tarea eliminada:', data);
                })
                .catch(err => console.error('Error al eliminar la tarea:', err));
            }
        };
        //user achievements DB update
        function updateAchievements(userID, achievements){
            fetch(`http://localhost:3000/users/${userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ achievements: achievements })
            })
            .catch(err => console.error('Error actualizando los logros:', err));
        }


        // Task edition function ------------------------------------------------------------------------
        function taskEdition(taskContainer, newTaskItem, title, description, checkInput, deadline){
            newTaskItem.hidden = true;
            createFormInputs();
            
            document.querySelector("#title").value = title;
            document.querySelector("#description").value = description;
            document.querySelector("#deadline").value = deadline;
            let submitButton = document.querySelector('button[type="submit"]');
            submitButton.disabled = true;               
            
            const validateInputs = () => {
                const currentTitle = document.querySelector("#title").value;
                const currentDescription = document.querySelector("#description").value;
                const currentDeadline = document.querySelector("#deadline").value;
                
                if(currentTitle !== title || currentDescription !== description || currentDeadline !== deadline){
                    submitButton.disabled = false;
                } else{
                    submitButton.disabled = true; 
                }
            };
            setTimeout(() => {
                document.querySelector("#title").addEventListener('input', validateInputs);
                document.querySelector("#description").addEventListener('input', validateInputs);
                document.querySelector("#deadline").addEventListener('input', validateInputs);
            }, 0);

            const addListeners = () =>{
                const handleCancelEdit = () => {
                    formContainer.removeEventListener('submit', handleFormSubmitEdit);
                    handleCancel();
                    setTimeout(() => {
                        newTaskItem.hidden = false;
                    }, 200);
                };
                const handleFormSubmitEdit = (event) => {
                    event.preventDefault();
                    tasks = tasks.filter(task => task.title !== title || task.description !== description || task.deadline !== deadline);
                    
                    const newEditTask = {
                        title: document.querySelector("#title").value,
                        description: document.querySelector("#description").value,
                        deadline: document.querySelector("#deadline").value,
                        isChecked: checkInput.checked
                    };
                    tasks.push(newEditTask);
                    saveTask("edition", newEditTask, title);

                    if (title && description && deadline) {
                        addTask(newEditTask.title, newEditTask.description, newEditTask.deadline, newEditTask.isChecked);
                        closeForm();                
                    } else {
                        console.error("Please fill all the fields");
                    }

                    formContainer.removeEventListener('submit', handleFormSubmitEdit);
                    formContainer.innerHTML = "";
                };
                document.querySelector("#cancelBtn").addEventListener('click', handleCancelEdit);
                formContainer.addEventListener('submit', handleFormSubmitEdit);
            };
            addListeners();
        };
        
        // new task button || flow start
        addButton.addEventListener("click", () => {
            createFormInputs();
            formContainer.addEventListener('submit', handleFormSubmit);
            document.querySelector("#cancelBtn").addEventListener('click', handleCancel);
        });

        // Task container verification ----------------------------------------------------
        const cardParent = document.querySelector(".taskCardContainer");
        const cardParentInner = document.querySelector(".taskList");
        if(cardParentInner.querySelectorAll('li').length > 0){
            cardParent.removeAttribute("hidden");
        } else{
            cardParent.setAttribute("hidden", "");
        }
        const cardObserver = new MutationObserver((mutationsList) => {
            for (mutation of mutationsList){
                if(mutation.type === 'childList'){
                    if(cardParentInner.querySelectorAll('li').length > 0){
                        cardParent.removeAttribute("hidden");
                    } else{
                        cardParent.setAttribute("hidden", "");
                    }
                }
            }
        });
        const config = {
            childList: true,
            subtree: false
        };
        cardObserver.observe(cardParentInner, config);

        //notifications end
        cardParent.parentNode.insertBefore(notificationContainer, cardParent);

        loadSavedTasks();
        return {tasks};
    };

    // filters ---------------------------------------------------------------------------------------
    // task filter function
    function filterTasksFromDB(keyword, deadline, filterChecked, callback) {
        let index = 0;
        if (userTask.length > 0) {
            let filteredTasks = userTask;
            userTask.forEach(task => {
                task.id = `task${index}-${task.deadline}`;
                index++;
            });

            //filter by keyword
            if(keyword){
                filteredTasks = userTask.filter(task =>
                    task.title.toLowerCase().includes(keyword.toLowerCase())
                );
            }

            //filter by deadline
            if(deadline){
                filteredTasks = filteredTasks.filter(task => 
                    task.deadline === deadline
                );
            }
            
            //filter by checked
            if(filterChecked === 'completed'){
                filteredTasks = filteredTasks.filter(task => task.isChecked);
            } else if(filterChecked === 'notCompleted'){
                filteredTasks = filteredTasks.filter(task => !task.isChecked);
            }
            callback(filteredTasks); // return filtered tasks
        } else {
            console.error(`there's no task founded.`);
            callback([]); //in the case that there's no task return a void array
        }
    }
    // render filtered tasks
    function renderTasks(tasks) {
        const listItems = document.querySelectorAll('#taskList li');
        listItems.forEach(li => li.hidden = true);
        tasks.forEach(task => {
            const taskItem = document.getElementById(task.id);
            if(taskItem){
                taskItem.hidden = false;
            }
        });
        const keyword = document.getElementById('filterInput').value;
        const deadline = document.getElementById('dateFilterInput').value;
        const filterChecked = document.getElementById('checkedFilterInput').value;
        let pillText = '';

        if(keyword){
            pillText += keyword;
        }
        if(deadline){
            pillText += ' ' + deadline;
        }
        if(filterChecked === 'completed'){
            pillText += ' 完了';
        } else if(filterChecked === 'notCompleted'){
            pillText += ' 未完了';
        }
        const pill = addElement("span",{class:`pill-${pillText.replace(/\s+/g, '-')} badge rounded-pill text-bg-secondary ms-3`, role:"button"}, pillText + " ×");
        document.getElementById('filterButton').insertAdjacentElement('afterend', pill);
        document.getElementById('filterButton').disabled = true;

        // click event to eliminate filter
        setTimeout(() => {
            if(pill){
                pill.addEventListener('click', () => {
                    const listItems = document.querySelectorAll('#taskList li')
                    listItems.forEach(li => {
                        li.hidden = false;
                        pill.remove();
                        document.getElementById('filterInput').value = '';
                        document.getElementById('dateFilterInput').value = '';
                        document.getElementById('checkedFilterInput').value = 'all';
                        document.getElementById('filterButton').disabled = false;
                    });
                });
            }
        }, 100);
    }
    // button filter event
    document.getElementById('filterButton').addEventListener('click', () => {
        const keyword = document.getElementById('filterInput').value;
        const deadline = document.getElementById('dateFilterInput').value;
        const filterChecked = document.getElementById('checkedFilterInput').value;
        filterTasksFromDB(keyword, deadline, filterChecked, (filteredTasks) => {
            renderTasks(filteredTasks);
        });
    });

    const taskList = newTask({
        listContainer: "#taskList",
        addButtonSelector: "#plusTask",
        formSelector: "#taskForm"
    });

    document.querySelector(".edit").addEventListener('click', () => {
        modalForm();
    });
};
profile();