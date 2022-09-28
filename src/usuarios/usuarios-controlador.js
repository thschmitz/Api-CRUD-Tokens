const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../erros');
const tokens = require("./tokens")
const jwt = require("jsonwebtoken")
const {EmailVerificacao} = require("./emails");

function getTokenFromHeaders(req) {
  const authHeader = req.headers['x-authorization'] || req.headers['authorization'] || '';
  const token = authHeader?.split(' ')[authHeader?.split(' ').length - 1];
  return token;
}

function geraEndereco(rota, token) {
  const baseURL = process.env.BASE_URL;
  return `${baseURL}${rota}${token}`;
}

module.exports = {
  adiciona: async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email,
        emailVerificado: false,
      });
      await usuario.adicionaSenha(senha);
      await usuario.adiciona();

      const token = tokens.verificacaoEmail.cria(usuario.id);
      const endereco = geraEndereco('/usuario/verifica_email/', token);

      const emailVerificacao = new EmailVerificacao(usuario, endereco);
      emailVerificacao.enviaEmail().catch(console.log)

      res.status(201).json(usuario);
    } catch (erro) {
      console.log("Problema AQUI 2")
      if (erro instanceof InvalidArgumentError) {
        res.status(422).json({ erro: erro.message });
      } else if (erro instanceof InternalServerError) {
        res.status(500).json({ erro: erro.message });
      } else {
        res.status(500).json({ erro: erro.message });
      }
    }
  },

  verificaEmail: async(req, res) => {
    try{
      console.log(req)
      const usuario = req.user;
      console.log("USUARIO: ", usuario);
      await usuario.verificaEmail();
      res.status(200).json();
    } catch(erro) {
      console.log("Problema: ", erro)
      res.status(500).json({erro: erro.message})
    }
  },

  login: async (req, res) => {
    const access_token = tokens.access.cria(req.user.id);
    const refreshToken = await tokens.refresh.cria(req.user.id);
    res.set("Authorization", access_token);
    res.set("RefreshToken", refreshToken)

    const resposta = {
      token: access_token,
      usuario: req.user,
      refreshToken: refreshToken
    }

    console.log("REQResposta: ", resposta)

    res.status(200).send(resposta);
  },

  logout: async (req, res) => {
    try{
      const token = req.token;
      await tokens.access.invalida(token);
      res.status(204).send();
    } catch(erro) {
      res.status(500).json({erro: erro.message})
    }
  },

  lista: async (req, res) => {
    const usuarios = await Usuario.lista();
    console.log("Fui chamado")
    res.json(usuarios);
  },

  deleta: async (req, res) => {
    const usuario = await Usuario.buscaPorId(req.params.id);
    try {
      await usuario.deleta();
      res.status(200).send();
    } catch (erro) {
      res.status(500).json({ erro: erro });
    }
  },

  session: async(req, res) => {
    console.log("Backend: ", req.user)
    const token = getTokenFromHeaders(req);
    console.log("TokenSession: ", token)

    try{
      await jwt.verify(token, process.env.CHAVE_JWT);
      console.log("Token valido");
      const decodedToken = await jwt.decode(token);
      console.log("Token: ", decodedToken)
      const usuarioInfo = await Usuario.buscaPorId(decodedToken.id);
      console.log("INFORMACOES: ", usuarioInfo)

      res.status(200).json({usuarioInfo});
    } catch(erro) {
      res.status(401).json({erro: erro.message});
    }
  
  }
};
