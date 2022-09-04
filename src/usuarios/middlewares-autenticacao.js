const passport = require('passport');
const Usuario = require("./usuarios-modelo");
const tokens = require("./tokens");

module.exports = {
  local: (req, res, next) => {
    passport.authenticate(
      'local',
      { session: false },
      (erro, usuario, info) => {
        console.log("UsuarioAuth: ", usuario);
        if (erro && erro.name === 'InvalidArgumentError') {
          return res.status(401).json({ erro: erro.message });
        }

        if (erro) {
          return res.status(500).json({ erro: erro.message });
        }

        if (!usuario) {
          return res.status(401).json();
        }

        req.user = usuario;
        return next();
      }
    )(req, res, next);
  },

  bearer: (req, res, next) => {
    passport.authenticate(
      'bearer',
      { session: false },
      (erro, usuario, info) => {
        console.log("BearerUsuario: ", usuario)
        if (erro && erro.name === 'JsonWebTokenError') {
          return res.status(401).json({ erro: erro.message });
        }

        if (erro && erro.name === 'TokenExpiredError') {
          return res
            .status(401)
            .json({ erro: erro.message, expiradoEm: erro.expiredAt });
        }

        if (erro) {
          return res.status(500).json({ erro: erro.message });
        }

        if (!usuario) {
          return res.status(401).json();
        }

        console.log("PASSOU")
        req.token = info.token;
        req.user = usuario;
        return next();
      }
    )(req, res, next);
  },

  refresh: async (req, res, next) => {
    try{
      const {refresh_token} = req.body;
      const id = await tokens.refresh.verifica(refresh_token);
      await tokens.refresh.invalida(refresh_token)
      req.user = await Usuario.buscaPorId(id);
      return next();
    } catch(erro) {
      if(erro.name === "InvalidArgumentError") {
        return res.status(401).json({ erro: erro.message });
      } else {
        return res.status(500).json({erro: erro.message});
      }
    }

  },

  verificacaoEmail: async (req, res, next) => {
    try{
      const { token } = req.params;
      console.log("TOKEN: ", token)
      const id = await tokens.verificacaoEmail.verifica(token);
      const usuario = await Usuario.buscaPorId(id);
      console.log("UsuarioAuth: ", usuario)
      req.user = usuario;
      return next();
    } catch(erro) {
      if(erro.name === "JsonWebTokenError") {
        return res.status(401).json({ erro: erro.message });
      }

      if(erro.name === "TokenExpiredError") {
        return res.status(401).json({ erro: erro.message, expiradoEm: erro.expiredAt });
      }

      return res.status(500).json({erro: erro.message})
    }
  }
};