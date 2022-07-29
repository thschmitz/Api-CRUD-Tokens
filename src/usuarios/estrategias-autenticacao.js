const passport = require("passport")
const { InvalidArgumentError } = require("../erros")
const LocalStrategy = require("passport-local").Strategy
const Usuario = require("./usuarios-modelo")
const bcrypt = require("bcrypt")
const BearerStrategy = require("passport-http-bearer").Strategy
const jwt = require("jsonwebtoken")
const blacklist = require("../../redis/manipula-blacklist")

function verificaUsuario(usuario){
    if(!usuario){
        throw new InvalidArgumentError("Nao existe usuario com este email")
    }
}

async function verificaSenha(senhaDigitada, senhaHash) {
    const senhaValida = await bcrypt.compare(senhaDigitada, senhaHash);
    if(!senhaValida){
        throw new InvalidArgumentError("E-mail ou senha invalidos")
    }
}

async function verificaTokenNaBlacklist(token) {
    const tokenNaBlacklist = await blacklist.contemToken(token);
    if (tokenNaBlacklist) {
      throw new jwt.JsonWebTokenError('Token inválido por logout!');
    }
  }

passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "senha",
        session: false,
    }, async (email, senha, done) => {
        try{
            const usuario = await Usuario.buscaPorEmail(email)
            verificaUsuario(usuario)
            await verificaSenha(senha, usuario.senhaHash)

            done(null, usuario);
        }catch(error){
            done(error)
        }
    })
)

passport.use(
    new BearerStrategy(
        async (token, done) => {
            try{
                const payload = jwt.verify(token, process.env.CHAVE_JWT);
                const usuario = await Usuario.buscaPorId(payload.id);
                done(null, usuario, { token: token });
            } catch(error) {
                done(error)
            }
        }
    )
)