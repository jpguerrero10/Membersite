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
        fetch(`http://${serverIP}:3000/tasks/${userID}`)
            .then(response => response.json())
            .then(tasks => {
                localStorage.setItem((`userTask_${userID}`), JSON.stringify(tasks));
            })
            .catch(error => console.error('Error al obtener las tareas:', error));
    }
    userTask = JSON.parse(localStorage.getItem(`userTask_${userID}`));
    //プロジェクトの読み込み
    fetch(`http://${serverIP}:3000/projects`)
        .then(response => response.json())
        .then(projects => {
            localStorage.setItem(('projects'), JSON.stringify(projects));
        })
        .catch(error => console.error('Error al obtener las tareas:', error));
    const projects = JSON.parse(localStorage.getItem('projects'));

    // ----------------------------------------- displaying data on screen ------------------------------------------------------
    document.querySelector('#userName').textContent = userName;
    document.querySelector('#userID').textContent = userID;
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

    //ランダムにIDを生成する処理
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    //要素に自動的にスクロールする処理
    function scrollToElm(elm) {
        var rect = elm.getBoundingClientRect();
        var position = rect.top + window.scrollY; 
        window.scrollTo({
            top: position,
            behavior: "smooth"
        });
    }

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
        const createFormInputs = (action, taskId) => {
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
            const checkList = addElement("div", {id: "check-list", class: "mb-3"}, "<div>チェックリスト</div>");
            const checkListProgress = addElement("div", {
                id: "check-list-progress",
                class: "progress mb-2",
                role: "progressbar",
                ariaLabel: "Success example",
                ariaValuenow: "25",
                ariaValuemin: "0",
                ariaValuemax: "100",
                style: "display: none;"
            });
            const progressBar = addElement("div", {class: "progress-bar", style: "width: 0%"}, "0%");
            const addCheckListItemButton = addElement("div", {
                id: "add-check-list-item-button",
                class: "btn btn-outline-primary border-primary-subtle mb-3 w-100",
                type: "button"
            }, "✙ チェックリストを追加");
            const checkListGroup = addElement("div", {id: "check-list-group"});
            const btnGroup = addElement("div", { class: "btn-group"});
            const submitButton = addElement("button", { type: "submit", class: "btn btn-primary" }, `${action === "add" ? "タスク追加" : "タスク保存"}`);
            const cancelButton = addElement("button", { type: "button", id: "cancelBtn", class: "btn btn-secondary" }, "キャンセル");
            const containerRow2 = addElement("div", {class: "row"});
            const assignedUser = addElement("div", {class: "col"}, "アサインユーザー")
            const formAssignedUserIconBox = addElement("div", {id: "form-assigned-user-icon-box", class: "d-flex mb-3"});
            const label = addElement("div", {class: "col"})
            const formLabelBox = addElement("div", {id: "form-label-box", class: "label-box d-flex mb-2"});
            const formLabelAddDropdown = addElement("div", {class: "dropdown"}, `<a id="form-label-add-dropdown" class="btn btn-primary dropdown-toggle w-100 mb-2" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">ラベル選択</a>`);
            const dropdownBodyCollapse = addElement("ul", {id: "dropdown-body-collapse", class: "dropdown-menu px-2"});
            formContainer.parentNode.insertBefore(formCard, formContainer);
            formCard.appendChild(formContainer);
            formContainer.appendChild(formLabelBox);
            formContainer.appendChild(containerRow);
            containerRow.appendChild(containerCol1);
            containerCol1.appendChild(titleInput);
            containerRow.appendChild(containerCol2);
            containerCol2.appendChild(deadlineInput);
            assignedUser.appendChild(formAssignedUserIconBox);
            containerRow2.appendChild(assignedUser);
            label.appendChild(formLabelAddDropdown);
            formLabelAddDropdown.appendChild(dropdownBodyCollapse);
            containerRow2.appendChild(label);
            formContainer.appendChild(containerRow2);
            formContainer.appendChild(descriptionInput);
            checkList.appendChild(checkListProgress);
            checkListProgress.appendChild(progressBar);
            checkList.appendChild(addCheckListItemButton);
            checkList.appendChild(checkListGroup);
            descriptionInput.insertAdjacentElement('afterend', btnGroup);
            descriptionInput.insertAdjacentElement('afterend', checkList);
            btnGroup.appendChild(submitButton);
            btnGroup.appendChild(cancelButton);
            setTimeout(() => {
                fadeIn(formCard, 200); // 1s fadein
            }, 20);
            addButton.hidden = true;
            //タスクのフォームが開いている時、フィルターボタンと他のタスクのエディットボタンを押せなくする処理
            document.getElementById('filterButton').disabled = true;
            const btnEditAll = document.querySelectorAll('.btn-edit');
            if (btnEditAll.length > 0) {btnEditAll.forEach(btn => btn.disabled = true);}
            //add CheckList Item Button
            addCheckListItemButton.addEventListener('click', createCheckItemElm);
            renderProgressbar();
            //アサインユーザーとラベルの表示
            let checkLabelCount = 0;
            projects.forEach(project => {
                const projectCheckItem = addElement("div", {class: "project-check-item d-flex align-aitems-center"});
                const projectCheckBox = addElement("input", {class:"project-check-box m-1", type:"checkbox"});
                const projectPill = addElement("div", {class:"project-check-box px-3 m-1 text-light rounded-pill", style: `background: ${project.color};`}, project.title);
                projectCheckItem.appendChild(projectCheckBox);
                projectCheckItem.appendChild(projectPill);
                dropdownBodyCollapse.appendChild(projectCheckItem);
                if (action === 'edit') {
                    thisTask = tasks.find(task => task.id === taskId);
                    if (thisTask.project === undefined) {thisTask.project = [];}
                    if (thisTask.project.indexOf(project.title) !== -1) {projectCheckBox.checked = true;} 
                }
                projectCheckBox.addEventListener('change', function() {
                    const checkElmAll = dropdownBodyCollapse.querySelectorAll('.project-check-box');
                    let newProjects = [];
                    checkElmAll.forEach(checkElm => {
                        if (checkElm.checked) {
                            const projectTitle = checkElm.nextElementSibling.textContent;
                            newProjects.push(projectTitle);
                        }
                    });
                    projectCheckBox.checked ? checkLabelCount++ : checkLabelCount--;
                    if (checkLabelCount < 5) {
                        checkElmAll.forEach(checkElm => checkElm.disabled = false);
                    } else {
                        checkElmAll.forEach(checkElm => {
                            checkElm.checked === false ? checkElm.disabled = true : checkElm.disabled = false;
                        });
                    }
                    renderLabel(formCard, newProjects);
                });
            });
            if (action === 'edit') {
                renderAssignedUserIcon(formContainer, thisTask.assignedUsers, 'form');
                renderLabel(formCard, thisTask.project);
            } else if (action === 'add') {
                const myUserIcon = addElement("img", {class: "assigned-user-icon position-relative rounded-circle bg-secondary object-fit-cover shadow-sm", src: `${userImage}`});
                formAssignedUserIconBox.appendChild(myUserIcon);
            }
            scrollToElm(formContainer) // 一番上からの位置を取得
        };

        // task creation submit -----------------------------------------------------------------------
        const handleFormSubmit = (event) => {
            event.preventDefault();
            const title = document.querySelector("#title").value;
            const description = document.querySelector("#description").value;
            const deadline = document.querySelector("#deadline").value;
            const label = document.querySelector("#form-label-box");
            let projects = [];
            Array.from(label.children).forEach(project => projects.push(project.textContent));
            let isChecked = false;
            let checkList = [];
            const checkListGroup = document.querySelector("#check-list-group");
            const checkListInputAll = document.querySelectorAll(".check-list-input");
            const formTitleTextAll = document.querySelectorAll(".form-title-text");
            for (let i = 0; i < checkListGroup.children.length; i++) {
                const checkListItem = {
                    listCompleted: checkListInputAll[i].checked,
                    listName: formTitleTextAll[i].value,
                };
                checkList.push(checkListItem);
            }
            if (checkList.length !== 0) {
                checklistLength = checkList.length;
                checklistCompletedCount = checkList.filter(completed => completed.listCompleted).length;
                console.log(checklistCompletedCount);
                if (checklistCompletedCount === checklistLength) {
                    isChecked = true;
                }
            }
            let assignedUsers = [userID.replace(/\W+/g, '')];
            if (title && description && deadline) {
                achievements.tasksAdded++;
                checkAchievements(achievements);
                addTask(title, description, deadline, isChecked, checkList, null, projects, assignedUsers);
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
            document.getElementById('filterButton').disabled = false;
            const btnEditAll = document.querySelectorAll('.btn-edit');
            if (btnEditAll.length > 0) {
                btnEditAll.forEach(btn => btn.disabled = false);
            }
        };
        
        // load previous data ------------------------------------------------------------------------
        const loadSavedTasks = () => {
            tasks.forEach((task) => addTask(task.title, task.description, task.deadline, task.isChecked, task.checkList, task.id, task.project, task.assignedUsers));
        };
        
        // new task creation ------------------------------------------------------------------------
        let index = 0;
        const addTask = (title, description, deadline, isChecked, checkList, taskId, project, assignedUsers) => {
            const newTaskItem = addElement( "li",{ class: `list-group-item position-relative p-3`, id: `${taskId}` });
            index++;
            let checklistLength = 0;
            let checklistCompletedCount = 0;
            if (checkList) {
                checklistLength = checkList.length;
                checklistCompletedCount = checkList.filter(completed => completed.listCompleted).length;
            }
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
            const labelBox = addElement("div", {class: "label-box row"});
            const assignedUserIconBox = addElement("div", {class: "assigned-user-icon-box d-flex ms-2"});
            const toastBody = addElement("div", { class: "toast-body ms-3  w-75" }, `<h3 class="taskTitle text-primary-emphasis fs-5 mb-1 mt-2"><strong>${title}</strong></h3><p class="text-dark-emphasis">${description}</p>`);
            const divEditClose = addElement("div", { class: "edit-close ms-auto flex-wrap position-absolute top-0 end-0"});
            const btnCloseTask = addElement("button", { 
                class: "btn-close close-btn btn-close-success m-2",
                arialabel: "close",
                style: "display: none;"
            });
            const btnEdit = addElement("button", {
                class: "btn btn-light btn-edit",
            },`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="15" height="15" style="fill: #566d83;"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>
            `);
            const deadlineChecklist = addElement("div", {class: "deadline-checklist d-flex justify-content-between align-items-center"});
            const checklistAssignedUserIcon = addElement("div", {class: "d-flex align-items-center"});
            const paragraphDeadline = addElement("p", {class: "deadlinePill bg-warning-subtle text-dark-emphasis px-3 m-0 rounded-pill d-block text-center" }, `<small><strong><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 600" width="16px" fill="#495057"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg></strong> ${deadline}</small>`);
            const paragraphChecklist = addElement("p", {class: "checklistPill bg-secondary text-light px-3 m-0 rounded-pill d-block text-center" }, `<small><strong><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 625" width="16px" fill="#ffffff"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg></strong> ${checklistCompletedCount}/${checklistLength}</small>`);
            taskFlexContainer.append(checkInput, toastBody, divEditClose);
            divEditClose.append(btnEdit, btnCloseTask);
            checklistAssignedUserIcon.append(paragraphChecklist, assignedUserIconBox)
            deadlineChecklist.append(checklistAssignedUserIcon, paragraphDeadline);
            toastBody.prepend(labelBox);
            fragment.appendChild(taskFlexContainer);
            newTaskItem.appendChild(fragment);
            newTaskItem.appendChild( deadlineChecklist);
            taskContainer.insertBefore(newTaskItem, taskContainer.firstChild);

            if (project) {
                renderLabel(newTaskItem, project);
            }
            
            if (checklistLength === 0) {
                if (!paragraphChecklist.classList.contains("opacity-0")) {
                    paragraphChecklist.classList.add("opacity-0");
                }
            } else {
                if (checklistLength === checklistCompletedCount) {
                    if(!paragraphChecklist.classList.contains("bg-success")) {
                        paragraphChecklist.classList.add("bg-success");
                    }
                }
            }
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
            
            //assign user to task
            let assignedUser = [];
            if (!assignedUsers) {
                assignedUser.push(userID.replace(/\W+/g, ''));
            } else {
                let oldussers = assignedUsers
                assignedUser = oldussers
            }
            renderAssignedUserIcon(newTaskItem, assignedUser, 'card');
            
            // task existence verification
            const tasksExist = tasks.some(t => t.title == title && t.description == description);
            if(!tasksExist){
                const id = generateUUID();
                const assignedUsers = assignedUser;
                tasks.push({title, description, deadline, isChecked, assignedUsers, checkList, id, project});
                let task = {title, description, deadline, isChecked, assignedUsers, checkList, id, project};
                saveTask("add", task, title);
                taskId = id;
            }
            //check button
            checkInput.addEventListener("change", () => toggleTaskStatus(newTaskItem, checkInput, btnEdit, btnCloseTask, paragraphDeadline, assignedUsers, checkList, taskId, project));
    
            //edit task button
            btnEdit.addEventListener('click', () => taskEdition(taskContainer, newTaskItem, checkInput, assignedUsers, taskId, btnEdit, btnCloseTask, paragraphDeadline, checkList, project));
        };

        // checked status function ------------------------------------------------------------------------
        function toggleTaskStatus(newTaskItem, checkInput, btnEdit, btnCloseTask, paragraphDeadline, assignedUsers, checkList, taskId, project){
            //タスクのチェックボタンが押された時、チェックリストが完了していないもがあったら全て完了にする処理
            let incomplete = false;
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            if (tasks[taskIndex].checkList) {
                incomplete = tasks[taskIndex].checkList.some(list => list.listCompleted === false);
            }
            checkList = tasks[taskIndex].checkList;
            if (!incomplete) {
                saveToggleTaskStatus(newTaskItem, checkInput, btnEdit, btnCloseTask, paragraphDeadline, assignedUsers, checkList, taskId, project);
            } else {
                const toggleConfirm = confirm('チェックリストに未完了の項目がありますが、このタスクを完了にしますか。');
                if  (toggleConfirm) {
                    tasks[taskIndex].checkList.forEach(list => {
                        if (list.listCompleted === false) {
                            list.listCompleted = true;
                        }
                    });
                    if(!newTaskItem.querySelector(".checklistPill").classList.contains("bg-success")) {
                        newTaskItem.querySelector(".checklistPill").classList.add("bg-success");
                    }
                    newTaskItem.querySelector('.checklistPill small').innerHTML = `<strong><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 625" width="16px" fill="#ffffff"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg></strong> ${checkList.length}/${checkList.length}`;
                    checkList = tasks[taskIndex].checkList;
                    saveToggleTaskStatus(newTaskItem, checkInput, btnEdit, btnCloseTask, paragraphDeadline, assignedUsers, checkList, taskId, project);
                } else {
                    tasks[taskIndex].isChecked = false;
                    checkInput.checked = false;
                    return;
                }
            }
        }

        function saveToggleTaskStatus(newTaskItem, checkInput, btnEdit, btnCloseTask, paragraphDeadline, assignedUsers, checkList, taskId) {
            const title = newTaskItem.querySelector(".taskTitle strong").textContent;
            const description = newTaskItem.querySelector("p").textContent;
            const deadline = newTaskItem.querySelector(".deadlinePill small").textContent.trim();
            const label = newTaskItem.querySelector(".label-box");
            const projects = [];
            Array.from(label.children).forEach(project => projects.push(project.textContent));
            const id = taskId;
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
            const project = projects;
            const isChecked = checkInput.checked;
            tasks = tasks.filter(task => task.title !== title || task.description !== description);
            tasks.push({title, description, deadline, isChecked, assignedUsers, checkList, id, project});
            let task = {title, description, deadline, isChecked, assignedUsers, checkList, id, project};
            saveTask("edition", task, title);
        }

        // Task edition function ------------------------------------------------------------------------
        function taskEdition(taskContainer, newTaskItem, checkInput, assignedUsers, taskId, btnEdit, btnCloseTask, paragraphDeadline, checkList, project){
            newTaskItem.hidden = true;
            createFormInputs('edit', taskId);

            const title = newTaskItem.querySelector(".taskTitle strong").textContent;
            const description = newTaskItem.querySelector("p").textContent;
            const deadline = newTaskItem.querySelector(".deadlinePill small").textContent.trim();
            const id = taskId;

            document.querySelector("#title").value = title;
            document.querySelector("#description").value = description;
            document.querySelector("#deadline").value = deadline;
            let submitButton = document.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            tasks.forEach(task => {
                if (task.title === title) {
                    if (task.checkList) {
                        checkList = task.checkList;
                    } else {
                        checkList = [];
                    }
                }
            });
            checkList.forEach(list => {
                createCheckItemElm('edit', list.listCompleted, list.listName)
            });
            renderProgressbar();
            
            const validateInputs = () => {
                const currentTitle = document.querySelector("#title").value;
                const currentDescription = document.querySelector("#description").value;
                const currentDeadline = document.querySelector("#deadline").value;
                const label = document.querySelector("#form-label-box");
                const currentProjects = [];
                Array.from(label.children).forEach(project => currentProjects.push(project.textContent));
                const currentCheckList = [];
                const checkListGroup = document.querySelector('#check-list-group');
                const checkListInputAll = document.querySelectorAll('.check-list-input');
                const formTitleTextAll = document.querySelectorAll('.form-title-text');
                for (let i = 0; i < checkListGroup.children.length; i++) {
                    const checkListItem = {
                        listCompleted: checkListInputAll[i].checked,
                        listName: formTitleTextAll[i].value,
                    };
                    currentCheckList.push(checkListItem);
                }
                
                if(currentTitle !== title || currentDescription !== description || currentDeadline !== deadline || JSON.stringify(currentCheckList) !== JSON.stringify(checkList) || JSON.stringify(currentProjects) !== JSON.stringify(project)){
                    submitButton.disabled = false;
                } else{
                    submitButton.disabled = true; 
                }
            };
            setTimeout(() => {
                document.querySelector("#title").addEventListener('input', validateInputs);
                document.querySelector("#description").addEventListener('input', validateInputs);
                document.querySelector("#deadline").addEventListener('input', validateInputs);
                document.querySelector("#add-check-list-item-button").addEventListener('click', validateInputs);
                document.querySelectorAll('.check-list-input').forEach(checkListInput => checkListInput.addEventListener('change', validateInputs));
                document.querySelectorAll('.form-title-text').forEach(checkListInput => checkListInput.addEventListener('input', validateInputs));
                document.querySelectorAll('.check-list-item-remove-button').forEach(checkListInput => checkListInput.addEventListener('click', validateInputs));
                document.querySelectorAll('.project-check-box').forEach(projectCheckInput => projectCheckInput.addEventListener('change', validateInputs));
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
                    let currentCheckList = [];
                    const checkListItems = document.querySelectorAll('.check-list-item');
                    checkListItems.forEach(item => {
                        const listCompleted = item.querySelector(".check-list-input").checked;
                        const listName = item.querySelector(".form-title-text").value;
                        const checkListItem = {listCompleted, listName};
                        currentCheckList.push({listCompleted: checkListItem.listCompleted, listName: checkListItem.listName});
                    });

                    const label = document.querySelector("#form-label-box");
                    const currentProjects = [];
                    Array.from(label.children).forEach(project => currentProjects.push(project.textContent));

                    const newEditTask = {
                        title: document.querySelector("#title").value,
                        description: document.querySelector("#description").value,
                        deadline: document.querySelector("#deadline").value,
                        isChecked: checkInput.checked,
                        assignedUsers: assignedUsers,
                        checkList: currentCheckList,
                        id: id,
                        project: currentProjects
                    };

                    if (title && description && deadline) {
                        newTaskItem.querySelector(".taskTitle strong").textContent = newEditTask.title;
                        newTaskItem.querySelector("p").textContent = newEditTask.description;
                        newTaskItem.querySelector(".deadlinePill small").innerHTML = `<strong><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 600" width="16px" fill="#495057"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg></strong> ${newEditTask.deadline}`;
                        newTaskItem.hidden = false;
                        closeForm();                
                    } else {
                        console.error("Please fill all the fields");
                    }

                    const taskIndex = tasks.findIndex(task => task.id === id);
                    if (taskIndex !== -1) {
                        tasks[taskIndex] = newEditTask; // Sobreescribe la tarea existente
                    } else {
                        console.warn("⚠ La tarea no fue encontrada, agregando como nueva.");
                        tasks.push(newEditTask); // Si por alguna razón la tarea no existe, agrégala
                    }
                    saveTask("edition", newEditTask, newEditTask.title);
                    renderLabel(newTaskItem, currentProjects);
                    const checklistLength = currentCheckList.length;
                    const checklistCompletedCount = currentCheckList.filter(completed => completed.listCompleted).length;
                    newTaskItem.querySelector(".checklistPill small").innerHTML = `<strong><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 625" width="16px" fill="#ffffff"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg></strong> ${checklistCompletedCount}/${checklistLength}`;
                    if (checklistLength === 0) {
                        if (!newTaskItem.querySelector(".checklistPill").classList.contains("opacity-0")) {
                            newTaskItem.querySelector(".checklistPill").classList.add("opacity-0");
                        }
                    } else {
                        newTaskItem.querySelector(".checklistPill").classList.remove("opacity-0");
                        if (checklistCompletedCount === checklistLength) {
                            if(!newTaskItem.querySelector(".checklistPill").classList.contains("bg-success")) {
                                newTaskItem.querySelector(".checklistPill").classList.add("bg-success");
                            }
                            if (!newEditTask.isChecked) {
                                newEditTask.isChecked = true;
                                checkInput.click();
                            }
                        } else {
                            if(newTaskItem.querySelector(".checklistPill").classList.contains("bg-success")) {
                                newTaskItem.querySelector(".checklistPill").classList.remove("bg-success");
                            }
                            if (newEditTask.isChecked) {
                                newEditTask.isChecked = false;
                                checkInput.click();
                            }
                        }
                    }
                    
                    formContainer.removeEventListener('submit', handleFormSubmitEdit);
                    formContainer.innerHTML = "";
                };
                document.querySelector("#cancelBtn").addEventListener('click', handleCancelEdit);
                formContainer.addEventListener('submit', handleFormSubmitEdit);
            };
            addListeners();
        };

        // DB saving function ------------------------------------------------------------------------
        // task DB update
        function saveTask(action, task, title){
            localStorage.setItem(`userTask_${userID}`, JSON.stringify(tasks));
            localStorage.setItem(`achievements_${userID}`, JSON.stringify(achievements));
            
            if(action == "add"){
                fetch(`http://${serverIP}:3000/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(task)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('タスクは作成された:', data);
                    updateAchievements(userID, achievements);
                })
                .catch(err => console.error('Error al agregar la tarea:', err));
            } else if( action == "edition"){
                fetch(`http://${serverIP}:3000/tasks/${encodeURIComponent(title)}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(task)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('タスクはアップデートされた:', data);
                    updateAchievements(userID, achievements);
                })
                .catch(err => console.error('Error al actualizar la tarea:', err));
            } else if( action == "delete"){
                fetch(`http://${serverIP}:3000/tasks/${encodeURIComponent(title)}`, {
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
            fetch(`http://${serverIP}:3000/users/${userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ achievements: achievements })
            })
            .catch(err => console.error('Error actualizando los logros:', err));
        }
        
        // new task button || flow start
        addButton.addEventListener("click", () => {
            createFormInputs('add');
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

        //checklist create
        function createCheckItemElm(action, checkListCompeted, checkListTitle) {
            const checkListProgress = document.querySelector('#check-list-progress');
            checkListProgress.style.display = 'block';
            const checkListGroup = document.getElementById('check-list-group');
            const checkListItem = addElement("div", {class: "check-list-item mb-2 d-flex align-items-center"});
            const checkBoxInput = addElement('input', {
                class:'check-list-input mt-0',
                type:'checkbox',
            });
            const titleInput = addElement('input', {
                class:'form-title-text form-control mx-2',
                type:'text',
                ariaLabel: 'Text input with checkbox'
            });
            const checkListItemRemoveButton = addElement('div', {class:'check-list-item-remove-button btn-close close-btn btn-close-success ms-auto'});
            checkListGroup.append(checkListItem);
            checkListItem.append(checkBoxInput);
            checkListItem.append(titleInput);
            checkListItem.append(checkListItemRemoveButton);

            if (action === 'edit') {
                checkBoxInput.checked = checkListCompeted;
                titleInput.value = checkListTitle;
                if (checkListGroup.children.length > 0) {
                    checkListProgress.style.display = 'block';
                    renderProgressbar();
                }
                if (checkBoxInput.checked) {
                    titleInput.style.textDecoration = 'line-through';
                } else {
                    titleInput.style.textDecoration = 'none';
                }

            } else {
                titleInput.focus();
            }
            //チェック項目のタイトルからフォーカスを外した時の処理
            titleInput.addEventListener('focusout', function() {
                const checkListGroup = document.getElementById('check-list-group');
                const checkListProgress = document.querySelector('#check-list-progress');
                if (titleInput.value === '') {
                    if (titleInput.value !== beforeText && action === 'edit') {
                        titleInput.value = beforeText;
                    } else {
                        checkListItem.remove();
                        if (checkListGroup.children.length > 0) {
                            checkListProgress.style.display = 'block';
                            renderProgressbar();
                        } else {
                            checkListProgress.style.display = 'none';
                        }
                        return;
                    }
                } else {
                    if (checkListGroup.children.length > 0) {
                        checkListProgress.style.display = 'block';
                        renderProgressbar();
                    } else {
                        checkListProgress.style.display = 'none';
                    }
                }
                beforeText = '';
            });
            //チェック項目のチェックボックスをクリックした時の処理
            checkBoxInput.addEventListener('change', ()=> {
                renderProgressbar();
                if (checkBoxInput.checked) {
                    titleInput.style.textDecoration = 'line-through';
                } else {
                    titleInput.style.textDecoration = 'none';
                }
            });
            //チェック項目を削除する処理
            checkListItemRemoveButton.addEventListener('click', function() {
                const checkListGroup = document.getElementById('check-list-group');
                const checkListProgress = document.querySelector('#check-list-progress');
                checkListItem.remove();
                renderProgressbar();
                if (!checkListGroup.children.length) {
                    checkListProgress.style.display = 'none';
                }
            });
            //テキストエリアをフォーカスした時の処理
            let beforeText = '';
            titleInput.addEventListener('focus', function() {
                renderProgressbar();
                if (titleInput.value) {
                    beforeText = titleInput.value;
                }
            });
        }

        //プログレスバーの処理
        function renderProgressbar() {
            const checkListProgress = document.querySelector('#check-list-progress');
            const allFormCheckInput = document.querySelectorAll('.check-list-input');
            if (allFormCheckInput.length > 0) {
                let chekedCount = 0;
                for (let i = 0; i < allFormCheckInput.length; i++) {
                    if (allFormCheckInput[i].checked) {
                        chekedCount++;
                    }
                }
                const progressRate = chekedCount / allFormCheckInput.length * 100;
                checkListProgress.firstElementChild.style.width = `${progressRate}%`;
                checkListProgress.firstElementChild.textContent = Math.trunc(progressRate) + '%';
            } else {
                checkListProgress.firstElementChild.style.width = '0%';
                checkListProgress.firstElementChild.textContent = 0 + '%';
            }
        }

        //label create
        function renderLabel(elm, project) {
            const labelBox = elm.querySelector('.label-box');
            if (project) {
                while(labelBox.firstChild){
                    labelBox.removeChild(labelBox.firstChild)
                }
            }
            project.forEach(taskProject => {
                const taskProjectData = projects.find(projectData => projectData.title === taskProject);
                const labelElm = addElement("div", {class: "labelPill px-3 m-0 rounded-pill col-auto", style: `background: ${taskProjectData.color};`}, taskProject);
                labelBox.appendChild(labelElm);
            });
        }

        //assigned user icon create
        function renderAssignedUserIcon(elm, assignedUsers, type) {
            let assignedUserIconBox;
            if (type === "card") {
                assignedUserIconBox = elm.querySelector('.assigned-user-icon-box');
                while(assignedUserIconBox.firstChild){
                    assignedUserIconBox.removeChild(assignedUserIconBox.firstChild)
                }
            } else if (type === "form") {
                assignedUserIconBox = elm.querySelector('#form-assigned-user-icon-box');
            }
            assignedUsers.forEach(assignedUser => {
                assignedUser = '@' + assignedUser;
                fetch(`http://${serverIP}:3000/users/${assignedUser}`)
                    .then(response => response.json())
                    .then(users => {
                        const assignedUserIcon = addElement("img", {class: "assigned-user-icon position-relative rounded-circle bg-secondary object-fit-cover shadow-sm", src: `${users.image}`});
                        assignedUserIcon.setAttribute("data-bs-toggle", "tooltip");
                        assignedUserIcon.setAttribute("data-bs-placement", "bottom");
                        assignedUserIcon.setAttribute("title", `${users.id.replace(/\W+/g, '')}`);
                        assignedUserIconBox.appendChild(assignedUserIcon);
                        new bootstrap.Tooltip(assignedUserIcon);
                    })
                    .catch(error => console.error('Error al obtener las tareas:', error));
            });
        }

        loadSavedTasks();
        return {tasks};
    };

    // filters ---------------------------------------------------------------------------------------
    // task filter function
    function filterTasksFromDB(keyword, deadline, filterChecked, callback) {
        let index = 0;
        if (userTask.length > 0) {
            let filteredTasks = userTask;
            // userTask.forEach(task => {
            //     task.id = `task${index}-${task.deadline}`;
            //     index++;
            // });

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