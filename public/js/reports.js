function dashboard(){

    // ---------------------------------------- Getting user's data from localStorage --------------------------------------------------
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    let userImage = localStorage.getItem('userImage');
    const userID = localStorage.getItem('userID');
    const userDescription = localStorage.getItem('userDescription');
    let reports = JSON.parse(localStorage.getItem(`userReports_${userID}`)) || [];

    // ---------------------------------------- displaying data on screen ---------------------------------------------------------------
    document.querySelector('#userName').textContent = userName;
    document.querySelector('#userID').textContent = userID;
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

    //notifications start
    const notificationContainer = addElement("div", { class:"toast-container position-fixed top-0 end-0 p-3" });

    // form creation -------------------------------------------------------------
    const reportsContainer = document.querySelector("#reportList"); 
    const addButton = document.querySelector("#addReport");
    const formContainer = document.querySelector("#reportForm");

    const createFormInputs = () => {
        formContainer.innerHTML = "";
        
        const formCard = addElement("div", { class: "card cardForm shadow p-4 my-3" });
        formCard.style.opacity = "0";
        formCard.style.transform = "translateY(-80px)";

        const fragment = document.createDocumentFragment();

        const switchBtn = addElement("div", { class: "form-check form-switch mb-3 d-flex align-items-center" }, `
            <span class="me-2">週</span>
            <input class="form-check-input switchCustom" type="checkbox" role="switch" id="reportType">
            <span class="ms-2">月</span>
        `);
        const dateStartInput = addElement("input", {
            type: "date",
            id: "startDate",
            class: "form-control mb-3",
            name: "startDate",
            min: "2000-01-01",
            max: "2030-01-01",
            required: true
        });
        const dateEndInput = addElement("input", {
            type: "date",
            id: "endDate",
            class: "form-control mb-3",
            name: "endDate",
            min: "2000-01-01",
            max: "2030-01-01",
            required: true
        });
        const skillsInput = addElement("input", {
            type: "text",
            id: "skills",
            class: "form-control mb-3",
            name: "skills",
            placeholder: "技術",
            required: true
        });
        const completedActivitiesInput = addElement("textarea", {
            id: "completedTask",
            class: "form-control mb-3",
            name: "completedTask",
            placeholder: "作業内容",
            required: true
        });
        const problemsInput = addElement("textarea", {
            id: "complain",
            class: "form-control mb-3",
            name: "complain",
            placeholder: "現場での懸念事項／その他"
        });
        const nextActivitiesInput = addElement("textarea", {
            id: "nextTask",
            class: "form-control mb-3",
            name: "nextTask",
            placeholder: "翌週・翌月作業予定",
            required: true
        });
        const objectiveInput = addElement("textarea", {
            id: "objective",
            class: "form-control mb-3",
            name: "objective",
            placeholder: "個人目標"
        });
        const messageInput = addElement("textarea", {
            id: "message",
            class: "form-control mb-3",
            name: "message",
            placeholder: "会社、メンバーへの意見／その他"
        });
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
        }, "会社、メンバーへの意見／その他"); // cuando se implemente la pagina de admin hay que crear un check para que si se requiere solo el amdin pueda ver esto <--------------------------------------------------------------------------------------------------------------------------------------------------------

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
        formContainer.appendChild(fragment);

        // Insert form's card
        formContainer.parentNode.insertBefore(formCard, formContainer);
        formCard.appendChild(formContainer);

        setTimeout(() => {
            fadeIn(formCard, 100); // 1s fadein
        }, 100);

        // Hide button while form is showed
        addButton.hidden = true;
    };

    // submit button -----------------------------------------------------------------------
    const handleFormSubmit = (event) => {
        event.preventDefault();

        const switchbtn = document.querySelector("#reportType").checked ? '月報' : '週報';
        const dateStart = document.querySelector("#startDate").value;
        const dateEnd = document.querySelector("#endDate").value;
        const skills = document.querySelector("#skills").value;
        const completedTask = document.querySelector("#completedTask").value;
        const complain = document.querySelector("#complain").value;
        const nextTask = document.querySelector("#nextTask").value;
        const objective = document.querySelector("#objective").value;
        const message = document.querySelector("#message").value;
        const idReport = ("report" + dateEnd);
        const commentsArray = [];

        reports = reports.filter(report => report.dateStart !== dateStart || report.dateEnd !== dateEnd);
        reports.push({ id: idReport, type: switchbtn, dateStart: dateStart, dateEnd: dateEnd, skills: skills, completedTask: completedTask, complain: complain, nextTask: nextTask, objective: objective, message: message, commentsArray: commentsArray });
        if (reports) {
            saveReport(reports);
            addReport(switchbtn, dateStart, dateEnd, idReport);
            closeForm();                
        } else {
            alert("Please fill all the fields");
        }
    };

    // cancel button ---------------------------------------------------------------
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

    // new report creation ------------------------------------------------------------------------
    const addReport = (switchbtn, dateStart, dateEnd, id) => {
        const cardContainer = document.querySelector(".reportContainer");
        cardContainer.style.transition = ".5s ease-in-out";
        cardContainer.style.opacity = "0";
        cardContainer.style.transform = "translateY(-80px)";
        const newReportItem = addElement("li",{ class: `list-group-item`, id: `report-${dateEnd}` });
        const reportRow = addElement("div", { class: "row"});
        const reportCol = addElement("div", { class: "col-12 align-content-center d-flex"});
        const reportType = addElement("p", {class:"type text-dark-emphasis m-0"}, `<strong>${switchbtn}</strong>`);
        const reportperiod = addElement("p", {class:"period text-dark-emphasis m-0 ms-2"}, `<strong>${dateStart}　～　${dateEnd}</strong>`);
        const reportBtn = addElement("button", { role: "button", class: "btn btn-primary text-right ms-auto px-4" }, "詳細")
        
        reportCol.appendChild(reportType);
        reportCol.appendChild(reportperiod);
        reportCol.appendChild(reportBtn);
        reportRow.appendChild(reportCol);
        newReportItem.appendChild(reportRow);
        reportsContainer.insertBefore(newReportItem, reportsContainer.firstChild);
        setTimeout(() => {
            fadeIn(cardContainer, 200); // 1s fadein
        }, 20);

        if(switchbtn === '月報'){
            reportType.classList.add("monthly");
        } else if(switchbtn === '週報'){
            reportType.classList.add("weekly");
        }

        reportBtn.addEventListener('click', () => {
            reports.forEach(report => {
                if(id === report.id){
                    const singleReport = report;
                    generateReportView(reports, singleReport, userID, userName, userID, userImage);
                }
            });
        });
    };

    // report saving function ------------------------------------------------------------------------
    function saveReport(reports){
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

    // load previous data ------------------------------------------------------------------------
    const loadPreviousReport = () => {
        reports.forEach((report) => addReport(report.type, report.dateStart, report.dateEnd, report.id));
    };
    loadPreviousReport();
    
    // new task button || flow start
    addButton.addEventListener("click", () => {
        createFormInputs();
        formContainer.addEventListener('submit', handleFormSubmit);
        document.querySelector("#cancelBtn").addEventListener('click', handleCancel);
    });

    //notifications end
    const cardParent = document.querySelector(".reportContainer");
    cardParent.parentNode.insertBefore(notificationContainer, cardParent);

    document.querySelector(".edit").addEventListener('click', () => {
        modalForm();
    });
    
}
dashboard();