document.addEventListener("DOMContentLoaded", () => {

    const imageUpload = document.getElementById('image-upload');
    const inputFile = document.getElementById('input-file');
    const viewImage = document.getElementById('view-image');
    const detailsReview = document.getElementById('details-review');
    const historyDiv = document.querySelector(".history");


    inputFile.addEventListener("change", async () => {
        const file = inputFile.files[0];
        if (!file) return;

        uploadImage(file);
        await processOCR(file);
    });


    imageUpload.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    imageUpload.addEventListener("drop", async (e) => {
        e.preventDefault();

        const file = e.dataTransfer.files[0];
        if (!file) return;

        inputFile.files = e.dataTransfer.files;

        uploadImage(file);
        await processOCR(file);
    });


    function uploadImage(file) {
        const imgLink = URL.createObjectURL(file);
        viewImage.style.backgroundImage = `url(${imgLink})`;
        viewImage.textContent = "";
    }

    async function processOCR(file) {

        detailsReview.innerHTML = `<p class="review-container">Processing...</p>`;

        const worker = await Tesseract.createWorker();

    

        const { data: { text } } = await worker.recognize(file);

        await worker.terminate();

        console.log("OCR TEXT:\n", text);

        const result = extractDetails(text);

        renderResults(result);
    }

    function extractDetails(text) {



        const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
        const phoneRegex = /(\+91[\s-]?|91[\s-]?|0)?[6-9]{4}[\s]\d{5}/g;
        const urlRegex = /\b(https?:\/\/|www\.)[^\s]+/gi;

        const emails = [...new Set(text.match(emailRegex) || [])];
        const phones = [...new Set(text.match(phoneRegex) || [])];
        const urls = [...new Set(text.match(urlRegex) || [])];

        return { emails, phones, urls };
    }

    function renderResults({ emails, phones, urls }) {

        detailsReview.innerHTML = `
            <div class="display-info">
            
                <h3 class="details-title">Extracted Details</h3>

                <div class="details-grid">
                    <b>Emails:</b><br>
                    ${renderEditableList(emails, "email")}
                </div>

                <div class="details-grid">
                    <b>Phone Numbers:</b><br>
                    ${renderEditableList(phones, "phone")}
                </div>

                <div class="details-grid">
                    <b>Websites:</b><br>
                    ${renderEditableList(urls, "url")}
                </div>

                <button id="save-btn" class="save-btn">Save</button>

            </div>
        `;

        document.getElementById("save-btn")
            .addEventListener("click", () => getUpdatedData());
    }

    function renderEditableList(arr, type) {

        if (arr.length === 0) {
            return `
                <input 
                    type="text"
                    placeholder="No ${type} found"
                    class="editable-field"
                    data-type="${type}"
                />
            `;
        }

        return arr.map((item, index) => `
            <input 
                type="text"
                value="${item}"
                class="editable-field"
                data-type="${type}"
                data-index="${index}"
            /><br>
        `).join("");
    }


    function getUpdatedData() {

        const inputs = document.querySelectorAll(".editable-field");

        const updatedData = {
            emails: [],
            phones: [],
            urls: []
        };

        inputs.forEach(input => {
            const type = input.dataset.type;
            const value = input.value.trim();

            if (!value) return;

            if (type === "email") updatedData.emails.push(value);
            if (type === "phone") updatedData.phones.push(value);
            if (type === "url") updatedData.urls.push(value);
        });

        console.log("Updated Data:", updatedData);

        const file = inputFile.files[0];
        if (file) {
            saveToDB(updatedData, file);
        }

        
    }

    const openRequest = indexedDB.open("OCR_DB",1);

    openRequest.onupgradeneeded = function(event){
        const db = event.target.result;

        if(!db.objectStoreNames.contains("contacts")){
            db.createObjectStore("contacts", {keyPath: "id", autoIncrement : true});
        }
    }

    function saveToDB(data, file){
        const request = indexedDB.open("OCR_DB",1);

        request.onsuccess = function (event){
            const db = event.target.result;

            const tx = db.transaction("contacts","readwrite");
            const store = tx.objectStore("contacts");

            const record = {
                image : file,
                emails : data.emails,
                phones : data.phones, 
                urls : data.urls,
                date : new Date().toISOString()
            };

            store.add(record);
            tx.oncomplete = function () {
                loadHistory(); 
            };
        }
        
    }

    function loadHistory() {
    const request = indexedDB.open("OCR_DB", 1);

    request.onsuccess = function (event) {
        const db = event.target.result;

        const tx = db.transaction("contacts", "readonly");
        const store = tx.objectStore("contacts");

        const getAll = store.getAll();

        getAll.onsuccess = function () {
            const history = getAll.result;

            const historyDiv = document.getElementById("history-panel");


            history.forEach(item => {
                const imgURL = URL.createObjectURL(item.image);

                historyDiv.innerHTML += `
                    <div class="history-grid">
                        <img src="${imgURL}" width="80"/>
                        <div>
                            <p>${item.emails.length + item.phones.length + item.urls.length} items</p>
                        </div>
                    </div>
                `;
            });
        };
    };
}
loadHistory();

});