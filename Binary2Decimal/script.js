document.addEventListener("DOMContentLoaded", ()=>{
    const input = document.getElementById("binary");
    const output = document.getElementById("result");

    input.addEventListener("input",()=>{
        input.value = input.value.replace(/[^01]/g,"").slice(0,8);

        if(input.value === ""){
            output.textContent=0;
            return ;
        }

        let decimal = parseInt(input.value,2);
        output.textContent = decimal;
    })

})