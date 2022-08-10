
import { validaInput } from "./validacao.js";

const inputs = document.querySelectorAll("input");

inputs.forEach(input => {
    input.addEventListener("blur", (event) => {
        validaInput(event.target);
    })
})