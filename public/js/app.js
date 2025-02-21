// ------------------------------------------- app stars ----------------------------------------------------------------


// loading screen
const showLoader = () => {
    const loader = addElement("div", {class: "position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-body", id: "loadingScreen", style:"z-index = 9999;"}, `
        <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
        </div>
        `);
        document.body.appendChild(loader);
    };
    const encodedAdminType = btoa("administrator");
    
    const hideLoader = () => {
        const loader = document.getElementById("loadingScreen");
        if (loader) {
            loader.remove();
        }
    };
    
//------------------------------------------------------------------------------------------------------------------------

// get IP from server and put it at localStorage
fetch('http://192.168.11.42:3000/get-server-ip')
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('serverIP', data.ip);
    })
    .catch(error => console.error('Error al obtener la IP del servidor:', error));

const serverIP = localStorage.getItem('serverIP');

if (!serverIP) {
    resetPage();
}
function resetPage(){
    location.reload();
    return;
}

// View controller Function
const loadView = async (view) => {
    showLoader();
    localStorage.setItem('currentView', view);
    try {
        const response = await fetch(`views/${view}.html`); // Archivo HTML
        if (!response.ok) throw new Error('Page not found');
        const html = await response.text();
        document.getElementById('app').innerHTML = html; // Cargar contenido en el div con id 'app'
        loadScript(`js/${view}.js`, () => {
            setTimeout(() => {
                if(view !== 'login' && view !== 'register'){
                    tabCreation(view);
                    responsiveSize();
                    moveNav();
                }
            }, 0);
        });
    } catch (error) {
        document.getElementById('app').innerHTML = `
        <div class="row align-items-center justify-content-center vh-100">
            <div class="text-center">
                <h1>404</h1>
                <p>Page not found.</p>
                <button onclick="loadView('login')">Go to login</button>
            </div>
        </div>
        `;
    } finally {
        setTimeout(() => {
            hideLoader(); // Ocultar el loader una vez que la vista se ha cargado
        }, 100);
    }
};
function loadScript(scriptPath, callback){
    // Eliminamos scripts previos
    const oldScript = document.querySelector("#dynamicJS");
    if(oldScript){
        oldScript.remove();
    }

    // Creamos el nuevo script
    const newScript = document.createElement("script");
    newScript.id = "dynamicJS";
    // newScript.type = "module";

    newScript.src = scriptPath;

    newScript.onload = () => {
        // callback promise for responsive
        if (callback) {
            callback();
        }
    };
    
    document.body.appendChild(newScript);
};
// Cargar vista 
window.addEventListener('load', () => {
    const currentView = localStorage.getItem('currentView') || 'login';
    loadView(currentView);
});

// -----------------------------------------------------------------------------------------------------------------------

// element generation
const addElement = (tag, attributes, children) => {
    const element = document.createElement(tag);
    if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
    if (children) {
        if (typeof children === "string") {
            element.innerHTML = children;
        } else {
            children.forEach((child) => {
                element.appendChild(child);
            });
        }
    }
    return element;
};

// ---------------------------------------------------------------------------------------------------------------------------------

//tabs creation
function tabCreation(view){
    const currentView = view;
    const tabsContainer = document.querySelector(".navbar");
    const views = [
        { name: 'Dashboard', displayName: 'ホーム', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 612" fill="#566d83" width="15"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M96 32l0 32L48 64C21.5 64 0 85.5 0 112l0 48 448 0 0-48c0-26.5-21.5-48-48-48l-48 0 0-32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 32L160 64l0-32c0-17.7-14.3-32-32-32S96 14.3 96 32zM448 192L0 192 0 464c0 26.5 21.5 48 48 48l352 0c26.5 0 48-21.5 48-48l0-272z"/></svg>' },
        { name: 'Profile', displayName: 'タスク', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 612" fill="#566d83" width="15"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>' },
        { name: 'Team', displayName: 'チーム', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 612" fill="#566d83" width="15"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z"/></svg>' },
        { name: 'Reports', displayName: '報告書', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 612" fill="#566d83" width="15"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM112 256l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>' }
    ];

    //confirm admin user
    const isAdmin = userType;
    if (isAdmin) {
        views.push({ name: 'Admin', displayName: '管理', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 612" fill="#566d83" width="15"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M96 128a128 128 0 1 0 256 0A128 128 0 1 0 96 128zm94.5 200.2l18.6 31L175.8 483.1l-36-146.9c-2-8.1-9.8-13.4-17.9-11.3C51.9 342.4 0 405.8 0 481.3c0 17 13.8 30.7 30.7 30.7l131.7 0c0 0 0 0 .1 0l5.5 0 112 0 5.5 0c0 0 0 0 .1 0l131.7 0c17 0 30.7-13.8 30.7-30.7c0-75.5-51.9-138.9-121.9-156.4c-8.1-2-15.9 3.3-17.9 11.3l-36 146.9L238.9 359.2l18.6-31c6.4-10.7-1.3-24.2-13.7-24.2L224 304l-19.7 0c-12.4 0-20.1 13.6-13.7 24.2z"/></svg>' });
    }

    views.forEach((view) => {
        const li = addElement("li", { class: "nav-item" }, `
            <a class="nav-link rounded-pill d-flex align-items-center text-primary-emphasis tab${view.name} ${currentView === view.name.toLowerCase() ? 'active' : ''} custom-active" ${currentView === view.name.toLowerCase() ? 'aria-current="page"' : ''} href="#" role="button" data-view="${view.name.toLowerCase()}">
                <span class="nav-item-icon rounded-circle">${view.icon}</span><span class="nav-item-text">${view.displayName}</span>
            </a>
        `);
        tabsContainer.appendChild(li);
    });
    tabController(tabsContainer);
}

// tabs change
function tabController(tabsContainer) {
    tabsContainer.addEventListener('click', (event) => {
        event.preventDefault();

        const tab = event.target.closest(".nav-link");
        if (!tab) return; // Ignora clics fuera de las tabs

        const view = tab.dataset.view; // Obtén el nombre de la vista desde un atributo data
        if (view) {
            loadView(view);
        }
    });
}

//--------------------------------------------------------------------------------------------------------------------------------------

// fade effects
function fadeIn(element, duration = 500) {
    let startTime = null;
    element.style.opacity = 0;
    element.style.transform = 'translateY(-80px)';
    function animate(time) {
        if (!startTime) startTime = time;
        const progress = (time - startTime) / duration;

        element.style.opacity = Math.min(progress, 1);
        element.style.transform = `translateY(${Math.min(progress * 80, 0)}px)`;
        if (progress < 1) {
            requestAnimationFrame(animate); // Continuamos la animación
        }
    }
    requestAnimationFrame(animate);
    setTimeout(() => {
        element.removeAttribute("style");
    }, 800);
}
function fadeOut(element, duration = 500) {
    let startTime = null;
    function animate(time) {
        if (!startTime) startTime = time;
        const progress = (time - startTime) / duration;

        element.style.opacity = Math.max(1 - progress, 0);
        element.style.transform = `translateY(${Math.max(-progress * 20, -20)}px)`;
        if (progress < 1) {
            requestAnimationFrame(animate); // Continuamos la animación
        }
    }
    requestAnimationFrame(animate);
}

//------------------------------------------------------------------------------------------------------------------------

// const headerCol = addElement("div", { class: "col-12 align-content-center", id: "contenedor" });
// const reportType = addElement("p", { class: "type text-dark-emphasis", draggable:"true", id: "dragMe" }, `<strong>${singleReport.type}</strong>`);

// drag and drop function (still in development...)
// setTimeout(() => {
//     const dragItem = document.getElementById('dragMe');
//     const container = document.getElementById('contenedor');
//         // Evento que se activa cuando se empieza a arrastrar
//     dragItem.addEventListener('dragstart', function (event) {
//         // Se guarda el elemento que estamos arrastrando
//         event.dataTransfer.setData('text', dragItem.id);
//         dragItem.style.opacity = '0.5'; // Cambiamos la apariencia mientras se arrastra
//     });

//     // Evento que se activa cuando se suelta el elemento
//     container.addEventListener('dragover', function (event) {
//         event.preventDefault(); // Necesario para permitir el drop
//     });

//     // Evento que se activa cuando se suelta el elemento sobre el contenedor
//     container.addEventListener('drop', function (event) {
//         event.preventDefault(); // Prevenimos el comportamiento por defecto
//         const id = event.dataTransfer.getData('text'); // Recuperamos el id del elemento arrastrado
//         const draggedElement = document.getElementById(id);
//         const dropX = event.clientX;
//         const dropY = event.clientY;

//         // Movemos el elemento arrastrado a la nueva posición
//         draggedElement.style.position = 'absolute';
//         draggedElement.style.left = dropX - draggedElement.offsetWidth / 2 + 'px';
//         draggedElement.style.top = dropY - draggedElement.offsetHeight / 2 + 'px';

//         draggedElement.style.opacity = '1'; // Restauramos la opacidad
//     });
//     }, 100);

// -----------------------------------------------------------------------------------------------------------------------

//notifications
const currentDate = new Date();
const time = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
function notifications(notificationContainer, NotiDescription, NotiTitle){
    const addNotification = addElement("div", {class: "toast fade show", role:"alert", id:"liveToast"},`
        <div class="toast-header">
            <strong class="me-auto">${NotiTitle}</strong>
            <small>${time}</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${NotiDescription}
        </div>
    `);
    addNotification.setAttribute("aria-live", "assertive");
    addNotification.setAttribute("aria-atomic", "true");

    notificationContainer.appendChild(addNotification);

    addNotification.querySelector(".btn-close").addEventListener('click', () => {
        setTimeout(() => {
            addNotification.remove();
        }, 10);
    });
    setTimeout(() => {
        addNotification.style.opacity = "0";
        setTimeout(() => {
            addNotification.remove();
        }, 300);
    }, 5000);
}  

//------------------------------------------------------------------------------------------------------------------------

// achievement system
function checkAchievements(achievements){
    trophyModal(achievements);
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------

//modal creation
const modalDialog = document.querySelector(".modal-dialog");

//report modal view creation -----------------------------------------------------------------------------
const generateReportView = (reports, reportData, reportUserID, loggedUserName, loggedUserID, userImage) => {
    const modalContent = addElement("div",{class: "modal-content"});
    const modalHeader = addElement("div", { class: "modal-header"}, `<h3 class="modal-title fs-5" id="exampleModalLabel">報告書の詳細</h3><button type="button" class="btn-close btnModalClose" data-bs-dismiss="modal" aria-label="Close"></button>`);
    const modalBody = addElement("div", { class: "modal-body" });
    const reportContainer = addElement("div", { class: "reportContainer" });

    // Report Content Wrapper
    const reportContent = addElement("div", { id: "reportList" });
    reportContainer.appendChild(reportContent);

    // Header Section
    const headerRow = addElement("div", { class: "row mb-2 pb-2" });
    const headerCol = addElement("div", { class: "col-12 align-content-center" });
    const reportType = addElement("p", { class: "type text-dark-emphasis" }, `<strong>${reportData.type}</strong>`);
    headerCol.appendChild(reportType);
    headerCol.appendChild(addElement("p", { class: "deadline text-dark-emphasis" }, `<strong>${reportData.dateStart}　～　${reportData.dateEnd}</strong>`));
    headerRow.appendChild(headerCol);
    reportContent.appendChild(headerRow);

    if(reportData.type === '月報'){
        reportType.classList.add("monthly");
    } else if(reportData.type === '週報'){
        reportType.classList.add("weekly");
    }

    //comments section
    const commentSection = addElement("form");
    const commentInput = addElement("textarea", { class: "form-control commentInput", placeholder:"Leave a comment here", required: true });
    const commentSubmitBtn = addElement("button", { type: "button", class: "btn btn-primary mt-2" }, "コメントを送信");
    
    // Sections Mapping
    const sections = [
        { title: "技術", content: reportData.skills },
        { title: "作業内容", content: reportData.completedTask },
        ...(reportData.complain ? [{ title: "現場での懸念事項／その他", content: reportData.complain }] : []),
        { title: "翌週・翌月作業予定", content: reportData.nextTask },
        ...(reportData.objective ? [{ title: "個人目標", content: reportData.objective }] : []),
        ...(reportData.message ? [{ title: "会社、メンバーへの意見／その他", content: reportData.message }] : []),
        { title: "コメントする", content: commentSection }
    ];
    
    // Generate Each Section
    sections.forEach(section => {
        const sectionRow = addElement("div", { class: "row border-bottom mb-2 pb-2" });
        const sectionCol = addElement("div", { class: "col" });
        if (section.title !== "コメントする") {
            sectionCol.appendChild(addElement("h3", { class: "reportType text-primary-emphasis fs-5 mb-2" }, `<strong>${section.title}</strong>`));
            sectionCol.appendChild(addElement("p", { class: "text-dark-emphasis m-0" }, (section.content).replace(/\\n|\n/g, "<br>")));
        } else {
            sectionRow.classList.remove("border-bottom");
            sectionRow.classList.add("commentSection")
            sectionCol.appendChild(addElement("h3", { class: "reportType text-primary-emphasis fs-5 mt-4 mb-2" }, `<strong>${section.title}</strong>`));
            sectionCol.appendChild(section.content);
            (section.content).appendChild(commentInput);
            commentInput.insertAdjacentElement('afterend', commentSubmitBtn);
        }
        sectionRow.appendChild(sectionCol);
        reportContent.appendChild(sectionRow);
    });
    if(reportData.commentsArray.length !== 0){
        setTimeout(() => {
            commentCreation(reportData.commentsArray);
        }, 10);
    }

    modalDialog.innerHTML = ""; // Clear existing content
    modalBody.appendChild(reportContainer);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalDialog.appendChild(modalContent);

    commentSubmitBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const errorMessage = addElement("span", { class:"comment-alert text-danger" }, "*このフィールドを入力してください。");
        if (commentInput.value.trim() === "") {
            commentInput.insertAdjacentElement('afterend', errorMessage);
            return;  // Salir sin ejecutar commentCreation
        }
        //comment saving
        commentsArray = reportData.commentsArray || [];
        const commentExist = commentsArray.some(c => c == commentInput.value);
        if(!commentExist){
            const commentID = "commentID" + Math.floor(Math.random() * 100000);
            commentsArray.push({comment: commentInput.value, userName: loggedUserName, userID: loggedUserID, image: userImage, id: commentID, time: time});
            reportData.commentsArray = commentsArray;
            reports = reports.filter(report => report.dateStart !== reportData.dateStart || report.dateEnd !== reportData.dateEnd);
            reports.push({ id: reportData.idReport, type: reportData.type, dateStart: reportData.dateStart, dateEnd: reportData.dateEnd, skills: reportData.skills, completedTask: reportData.completedTask, complain: reportData.complain, nextTask: reportData.nextTask, objective: reportData.objective, message: reportData.message, commentsArray: reportData.commentsArray });
        } else{
            return;
        }
        commentCreation(commentsArray);
        saveReportG(reports, reportUserID);
        restoreCommentSection();
    });

    const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    exampleModal.show();
};

//restore section state
function restoreCommentSection(){
    const errorMessage = document.querySelector(".comment-alert");
    if(errorMessage){
        errorMessage.remove();
    }
    document.querySelector(".commentSection textarea").value = "";
    const commentsRow = document.querySelector(".comments")
    if(commentsRow){
        commentsRow.remove();
    }
}

function commentCreation(commentsArray){
    const inputRow = document.querySelector(".commentSection");

    if (commentsArray.length === 0) return;

    //create visualization
    const sectionRow = addElement("div", { class: "row comments border-bottom mb-2 pb-2" });
    const sectionCol = addElement("div", { class: "col" });
    const sectionUl = addElement("ul", { class: "list-group list-group-flush commentList"});
    sectionCol.appendChild(addElement("h3", { class: "reportType text-primary-emphasis fs-5 mb-2" }, `<strong>コメント</strong>`));
    commentsArray.forEach(cmnt => {
        const sectionLi = addElement("li", { class: `list-group-item ps-5 comment-author-${(cmnt.userID).replace(/\W+/g, '')}`, id: `comment-${cmnt.id}`}, `<svg xmlns="http://www.w3.org/2000/svg" class="reply-btn" id="${(cmnt.userID)}${(Math.floor(Math.random() * 100000))}" viewBox="0 0 512 512" style=" width: 15px; position: absolute; right: 0; fill: #7f7f7f; cursor: pointer;"><path d="M205 34.8c11.5 5.1 19 16.6 19 29.2l0 64 112 0c97.2 0 176 78.8 176 176c0 113.3-81.5 163.9-100.2 174.1c-2.5 1.4-5.3 1.9-8.1 1.9c-10.9 0-19.7-8.9-19.7-19.7c0-7.5 4.3-14.4 9.8-19.5c9.4-8.8 22.2-26.4 22.2-56.7c0-53-43-96-96-96l-96 0 0 64c0 12.6-7.4 24.1-19 29.2s-25 3-34.4-5.4l-160-144C3.9 225.7 0 217.1 0 208s3.9-17.7 10.6-23.8l160-144c9.4-8.5 22.9-10.6 34.4-5.4z"/></svg>`);
        sectionLi.appendChild(addElement("img", { class: "teamImage rounded-circle border border-white border-4", src: `${cmnt.image}` }))
        sectionLi.appendChild(addElement("p", { class: "text-dark-emphasis m-0" }, `${cmnt.userName}<span style="display: block; font-size: 0.8rem;">${cmnt.userID}</span>`))
        sectionLi.appendChild(addElement("p", { class: "text-dark-emphasis mt-2" }, `${cmnt.comment}`));
        sectionUl.appendChild(sectionLi);

        setTimeout(() => {
            const reply = document.querySelectorAll(".reply-btn")
            reply.forEach(reply => reply.addEventListener('click', () => { 
                document.querySelector(".commentInput").value = reply.id.replace(/(\w)(\d+)/g, '$1') + " ";
                document.querySelector(".commentInput").focus();
            }));
        }, 100);
    });
    sectionCol.appendChild(sectionUl);
    sectionRow.appendChild(sectionCol);
    
    inputRow.parentNode.insertBefore(sectionRow, inputRow);
}

function saveReportG(reports, userID){
    localStorage.setItem(`userReports_${userID}`, JSON.stringify(reports));
    
    if(reports){
        fetch(`http://192.168.11.42:3000/users/${userID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reports: reports })
        })
        .catch(err => console.error('Error actualizando los informes:', err));
    }
};

// achievement trophy modal start --------------------------------------------------------------------------------------------
const trophyModal = (achievements) => {
    if (!achievements.shownMilestones){
        achievements.shownMilestoness = {
                tasksAdded: [],
                tasksCompleted: [],
                tasksShared: []
            };
    }
    const modalContent = addElement("div",{class: "modal-content"});
    const modalHeader = addElement("div", { class: "modal-header"}, `<button type="button" class="btn-close btnModalClose" data-bs-dismiss="modal" aria-label="Close"></button>`);
    let achievementUnlocked = false;
    if (achievements.milestones.tasksAdded.includes(achievements.tasksAdded)) {
        const reached = achievements.milestones.tasksAdded.shift();
        achievements.shownMilestones.tasksAdded.push(reached);
        achievementUnlocked = true;
        const modalBody = addElement("div", { class: "modal-body text-center" }, `<img src="/img/trophy.svg" class="trophy"/><h3 class="modal-title mt-2 mb-3 fs-5" id="exampleModalLabel">おめでとうございます！</h3> 実績解除！ ${achievements.tasksAdded}つのタスクを追加しました。`);
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
    }
    
    if (achievements.milestones.tasksCompleted.includes(achievements.tasksCompleted)) {
        const reached = achievements.milestones.tasksCompleted.shift();
        achievements.shownMilestones.tasksCompleted.push(reached);
        achievementUnlocked = true;
        const modalBody = addElement("div", { class: "modal-body text-center" }, `<img src="/img/trophy.svg" class="trophy"/><h3 class="modal-title mt-2 mb-3 fs-5" id="exampleModalLabel">おめでとうございます！</h3> 実績解除！ ${achievements.tasksCompleted}つのタスクを完了しました。`);
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
    }
    
    if (achievements.milestones.tasksShared.includes(achievements.tasksShared)) {
        const reached = achievements.milestones.tasksShared.shift();
        achievements.shownMilestones.tasksShared.push(reached);
        achievementUnlocked = true;
        const modalBody = addElement("div", { class: "modal-body text-center" }, `<img src="/img/trophy.svg" class="trophy"/><h3 class="modal-title mt-2 mb-3 fs-5" id="exampleModalLabel">おめでとうございます！</h3> 実績解除！ ${achievements.tasksShared}つのタスクを共有しました。`);
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
    }

    if (achievementUnlocked) {
        modalDialog.innerHTML = ""; // Clear existing content
        modalDialog.appendChild(modalContent);
        
        // Close modal logic
        document.querySelectorAll(".btnModalClose").forEach(btn => {
            btn.addEventListener('click', () => {
                exampleModal.hide();
                modalDialog.innerHTML = "";
            });
        });
        const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'));
        exampleModal.show();
    }
};

//personalization modal start -----------------------------------------------------------------------------------------
const modalForm = () => {
    const modalContent = addElement("form",{class: "modal-content"});
    const modalHeader = addElement("div", { class: "modal-header"}, `<h3 class="modal-title fs-5" id="exampleModalLabel">プロファイル設定</h3>
    <button type="button" class="btn-close btnModalClose" data-bs-dismiss="modal" aria-label="Close"></button>`);
    const modalBody = addElement("div", { class: "modal-body"},`
        <img style="aspect-ratio: 1/1; object-fit: cover;" id="profileImage" class="rounded-circle border border-white border-4 d-block mx-auto" width="100" src="" />
        <!-- profile image input -->
        <div class="my-4">
            <input class="form-control" type="file" id="formFile" aria-describedby="imageFileText">
            <label for="formFile" class="custom-file-upload position-absolute"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="15" height="15"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg></label>
        </div>

        <!-- description input -->
        <div class="mb-3 form-floating">
            <textarea class="form-control" placeholder="Leave a comment here" id="description" style="height: 110px;">${userDescription}</textarea>
            <label for="description">自己紹介</label>
        </div>
    `);
    const modalFooter = addElement("div", { class: "modal-footer"}, `<button type="button" class="btn btn-secondary btnModalClose" data-bs-dismiss="modal">Close</button>
    <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Save changes</button>`);

    modalDialog.innerHTML = ""; // Clear existing content

    modalDialog.appendChild(modalContent);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    document.querySelector("#profileImage").src = localStorage.getItem('userImage') || userImage;
    document.querySelector('#description').textContent = localStorage.getItem('userDescription') || userDescription;
    // modal close
    document.querySelectorAll(".btnModalClose").forEach(btn => {
        btn.addEventListener('click', () => {
            modalDialog.innerHTML = "";
        });
    });
    modalLoaded();
};

// modal loaded
const modalLoaded = () =>{
    const modalContent = document.querySelector('.modal-content');
    const imageInput = document.querySelector('#formFile');
    const profileImage = document.querySelector('#profileImage');
    //modal image load
    imageInput.addEventListener('change', (event) => {
        const instantFile = event.target.files[0];
        if (instantFile){
            const imageURL = URL.createObjectURL(instantFile);
            profileImage.src = imageURL;
        }
    });
    modalContent.addEventListener('submit', (event) => {
        event.preventDefault();
        modalSubmit(imageInput, modalDialog, profileImage);
    });

};

//modal submit
const modalSubmit = (imageInput, modalDialog, profileImage) => {
    const description = document.querySelector('#description').value;
    const instantFile = imageInput.files[0];
    let image;
    
    // Validamos si los datos ingresados coinciden con los del "usuario registrado"
    const userIndex = userID;
    
    if (userIndex !== -1) {
        if(description){
            localStorage.setItem('userDescription', description);
            document.querySelector('#userDescription').textContent = localStorage.getItem('userDescription') || userDescription;
            
            // save user description DB
            const dbRequest = indexedDB.open('userDatabase', 1);
            dbRequest.onsuccess = function(event){
                const db = event.target.result;
                const transaction = db.transaction(["users"], "readwrite");
                const objectStore = transaction.objectStore("users");
                const getUserRequest = objectStore.get(userEmail);
                
                getUserRequest.onsuccess = function() {
                    const user = getUserRequest.result;
                    if(user){
                        user.description = description;
                        const updateUserRequest = objectStore.put(user);

                        updateUserRequest.onerror = function(event){
                            console.error("Error updating user:", event);
                        };
                        updateUserRequest.onsuccess = function(event){
                            console.log(`${userID}:User taks updated`, event)
                        };
                    } else{
                        console.error(`${userID} user not found`);
                    }
                };
                getUserRequest.onerror = function(event){
                    console.error("error: user not found", event)
                };
            };
        }

        if(imageInput.files.length > 0){
            // save user description DB
            const dbRequest = indexedDB.open('userDatabase', 1);
            dbRequest.onsuccess = function(event){
                const db = event.target.result;
                const transaction = db.transaction(["users"], "readwrite");
                const objectStore = transaction.objectStore("users");
                const getUserRequest = objectStore.get(userEmail);
                
                getUserRequest.onsuccess = function() {
                    const user = getUserRequest.result;
                    if(user){
                        user.image = instantFile;
                        const updateUserRequest = objectStore.put(user);

                        updateUserRequest.onerror = function(event){
                            console.error("Error updating user:", event);
                        };
                        updateUserRequest.onsuccess = function(event){
                            console.log(`${userID}:User taks updated`)
                        };
                    } else{
                        console.error(`${userID} user not found`);
                    }
                };
                getUserRequest.onerror = function(event){
                    console.error("error: user not found", event)
                };
            };
            const reader = new FileReader();
            
            reader.onload = function(e){
                imageData = e.target.result;
                const image = imageData;
                localStorage.setItem('userImage', image);
            }
            reader.readAsDataURL(instantFile);
            document.querySelector('#userImage').src = URL.createObjectURL(instantFile);
        }
        
        
        modalDialog.innerHTML = "";
    } else {
        console.error('something went wrong'); // Mostramos una alerta si los datos son incorrectos
    }
};

//------------------------------------------------------------------------------------------------------------------------

// responsive

function responsiveSize() {
    const screenSize = window.innerWidth;
    const mobileArrow = addElement("div", {class: "arrow-sm", id: "infoArrow"}, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>`);
    const profileContainer = document.getElementById("profileInfo");
    moveNav();
}

function midSize() {
    const userDescription = document.getElementById("userDescription");

    userDescription.classList.remove("opacity-0");

    const oldArrow = document.getElementById("infoArrow");
    if(oldArrow){
        oldArrow.remove();
    } 
}

function bigSize() {
    const userDescription = document.getElementById("userDescription");

    userDescription.classList.remove("opacity-0");
    
    const oldArrow = document.getElementById("infoArrow");
    if(oldArrow){
        oldArrow.remove();
    } 
}

let userType;
if(localStorage.getItem('userType') !== ""){
    userType = localStorage.getItem('userType');
}

function moveNav() {
    const nav = document.querySelector(".navbar");
    const header = document.querySelector("#asterisk-members-header");
    if (window.innerWidth <= 768) {
        if (nav.parentElement !== header.parentElement) {
            header.after(nav);
        }
    } else {
        if (nav.parentElement !== header) {
            header.firstElementChild.appendChild(nav);
        }
    }
}


// if size change
window.addEventListener('resize', responsiveSize);

