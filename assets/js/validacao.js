export function validaInput(input) {
    const dataAtributoInput = input.dataset.tipo

    if (validadores[dataAtributoInput]) {
        validadores[dataAtributoInput](input);
    }

    if (input.validity.valid) {
        input.parentElement.classList.remove("input-container-invalido");

    } else {
        input.parentElement.classList.add("input-container-invalido");
        input.parentElement.querySelector(".mensagem-erro-campo").innerHTML = mostraMensagemDeErro(dataAtributoInput, input);
    }
}

const validadores = {
    dataNascimento: input => validaDataNascimento(input),
    cpf: input => validaCPF(input),
    cep: input => requestCEP(input),
}

const tiposDeErro = ["valueMissing", "typeMismatch", "patternMismatch", "customError"];

const mensagemDeErro = {
    nome: {
        valueMissing: "O campo nome não pode estar vazio."
    },
    email: {
        valueMissing: "O campo email não pode estar vazio.",
        typeMismatch: "O email digiado não é valido."
    },
    senha: {
        valueMissing: "O campo senha não pode estar vazio!",
        patternMismatch: "A senha deve conter ao menos 8 caracteres, sendo ao menos uma letra maiuscula, uma letra minuscula, um numero e ao menos um caracter especial (!@#$%&*)"
    },
    dataNascimento: {
        valueMissing: "O campo data de nascimento não pode estar vazio.",
        customError: "Você deve ser maior de 18 anos para efetuar o cadastro"
    },
    cpf: {
        valueMissing: "O campo cpf não pode estar vazio.",
        customError: "O CPF digitado não é valido."
    },
    cep: {
        valueMissing: "O campo CEP não pode estar vazio.",
        patternMismatch: "O campo CEP não pode estar vazio.",
        customError: "Não foi possivel encontrar seu CEP"
    },
    logradouro: {
        valueMissing: "O campo logradouro não pode estar vazio."
    },
    cidade: {
        valueMissing: "O campo cidade não pode estar vazio."
    },
    estado: {
        valueMissing: "O campo estado não pode estar vazio."
    }
}

function mostraMensagemDeErro(dataAtributoInput, input) {
    let mensagem = "";

    tiposDeErro.forEach(erro => {
        if (input.validity[erro]) {
            mensagem = mensagemDeErro[dataAtributoInput][erro]
        }
    })

    return mensagem
}

/* VALIDANDO DATA DE NASCIMENTO */

function validaDataNascimento(input) {
    const dataRecebida = new Date(input.value);

    if (!maiorIdade(dataRecebida)) {
        input.setCustomValidity("Error"); //STRING QUALQUER PARA SETTAR UMA MENSAGEM DE ERRO CUSTOM
    } else {
        input.setCustomValidity("");
    }
}

function maiorIdade(data) {
    const dataAtual = new Date();
    const dataMaior18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate());

    return dataMaior18 <= dataAtual;
}

/* VALIDANDO CPF */

function validaCPF(input) {
    const cpfFormatado = input.value.replace(/\D/g, "");

    if (cpfFormatado === "") return input.setCustomValidity("");
    if (!(cpfFormatado.length === 11)) return input.setCustomValidity("Error");
    if (eSequencia(cpfFormatado)) input.setCustomValidity("Error");
    if (checaEstruturaCPF(cpfFormatado) === cpfFormatado) {
        return input.setCustomValidity("")
    }  else {
        return input.setCustomValidity("Error");
    }
}

function checaEstruturaCPF(cpf) {
    const cpfSemDigitos = cpf.toString().slice(0, -2);
    const primeiroDigito = checaDigitoVerificador(cpfSemDigitos);
    const segundoDigito = checaDigitoVerificador(cpfSemDigitos + primeiroDigito);

    const newCpf = cpfSemDigitos + primeiroDigito + segundoDigito;

    return newCpf
}

function checaDigitoVerificador(cpfSemDigitos) {
    const cpfArray = Array.from(cpfSemDigitos);
    let contadorRegressivo = cpfArray.length + 1;

    const total = cpfArray.reduce((acumulador, valor) => {
        acumulador += (contadorRegressivo * Number(valor));
        contadorRegressivo--;
        return acumulador
    }, 0);

    const digito = 11 - (total % 11);
    return digito > 9 ? "0" : String(digito);
}

function eSequencia(cpf) {
    return cpf[0].toString().repeat(cpf.length) === cpf;
}

/* REQUEST CEP */

function requestCEP(input) {
    const cep = input.value.replace(/\D/g, "");
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const options = {
        method: "GET",
        mode: "cors",
        headers: {
            "content-type": "application/json;charset=utf-8"
        }
    }

    if (!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url, options).then(
            response => response.json()
        ).then(
            data => {
                if (data.erro) {
                    input.setCustomValidity("Error");
                    return 
                }
                input.setCustomValidity("");
                preencherCamposComCEP(data)
                return
            }
        )
    }

}

function preencherCamposComCEP(data) {
    const logradouro = document.querySelector("[data-tipo='logradouro']")
    const estado = document.querySelector("[data-tipo='estado']")
    const cidade = document.querySelector("[data-tipo='cidade']")

    logradouro.value = data.logradouro;
    cidade.value = data.localidade;
    estado.value = data.uf;
}
