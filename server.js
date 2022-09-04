const app = require('./app');
const port = 5000;
const db = require('./database');
require("dotenv").config();
require("./redis/blocklist-access-token")
require("./redis/allowlist-refresh-token")

app.use((req,res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
})

const routes = require('./rotas');
routes(app);

app.listen(port, () => console.log(`App listening on port ${port}`));
