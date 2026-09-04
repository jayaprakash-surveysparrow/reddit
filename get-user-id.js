const sequelize = require('./db/sequelize');

sequelize.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1;', {
    type: sequelize.QueryTypes.SELECT
}).then((results) => {
    console.log(results);
    process.exit(0);
});