const nodemailer = require("nodemailer");

// Funcao de envio de emails
// Nodemailer tem um modulo para conta teste e assim nao ficar enchendo a caixa de email de alguem

const configuracaoEmailProducao = {
    host: process.env.EMAIL_HOST,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_SENHA,
    },
    secure: true,
}

const configuracaoEmailTeste = (contaTeste) => ({
    host: 'smtp.ethereal.email',
    auth: contaTeste,
})

async function criaConfiguracaoEmail() {
    if(process.env.NODE_ENV === "production") {
        return configuracaoEmailProducao;
    } else {
        const contaTeste = await nodemailer.createTestAccount();
        return configuracaoEmailTeste(contaTeste);
    }
}

class Email {
    async enviaEmail(usuario) {
        const configuracaoEmail = await criaConfiguracaoEmail();
        const transportador = nodemailer.createTransport(configuracaoEmail)
        const info = await transportador.sendMail(this);
    
        if(process.env.NODE_ENV === "production") {
            console.log("URL: ", nodemailer.getTestMessageUrl(info))
        }
    }
}

class EmailVerificacao extends Email {
    constructor(usuario, endereco) {
        super();
        this.from = '"Blog do Codigo" <noreply@blogdocodigo.com.br>';
        this.to = usuario.email;
        this.subject = "Verificação de email";
        this.text = `Ola! Verifique seu e-mail aqui: ${endereco}`;
        this.html = `<h1>Ola!</h1> Verifique seu e-mail aqui: <a href="${endereco}">${endereco}</a>`;
    }
}


module.exports = {EmailVerificacao};