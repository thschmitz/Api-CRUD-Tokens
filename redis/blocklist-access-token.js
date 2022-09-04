const redis = require("redis");
const blocklist = redis.createClient({ prefix: "blocklist-access-token:" });
const manipulaLista = require("./manipula-lista");
const manipulaBlocklist = manipulaLista(blocklist)

const jwt = require('jsonwebtoken');
const { createHash } = require('crypto');

function geraTokenHash(token) {
  return createHash('sha256')
    .update(token)
    .digest('hex');
}

module.exports = {
  adiciona: async token => {
    const dataExpiracao = jwt.decode(token).exp;
    const tokenHash = geraTokenHash(token);
    await manipulaBlocklist.adiciona(tokenHash, "", dataExpiracao);
  },
  contemToken: async token => {
    const tokenHash = geraTokenHash(token);
    await manipulaBlocklist.contemChave(tokenHash);
  }
};