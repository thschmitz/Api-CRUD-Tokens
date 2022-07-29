const redis = require("redis");
module.exports = redis.createClient({ profix: "blacklist:" });

