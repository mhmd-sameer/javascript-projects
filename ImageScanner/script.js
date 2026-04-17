

document.addEventListener("DOMContentLoaded",()=>{

    const imageUpload = document.getElementById('image-upload');
    const inputFile = document.getElementById('input-file');
    const viewImage = document.getElementById('view-image');

    inputFile.addEventListener("change",uploadImage);
    
    function uploadImage(){
        let imgLink = URL.createObjectURL(inputFile.files[0]);
        viewImage.style.backgroundImage = `url(${imgLink})`;
        viewImage.textContent = "";
    }

    imageUpload.addEventListener("dragover",(event)=>{
        event.preventDefault();
    })

    imageUpload.addEventListener("drop",(event)=>{
        event.preventDefault();
        inputFile.files = event.dataTransfer.files;
        uploadImage();
    })
});
