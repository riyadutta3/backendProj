const Sequelize = require('sequelize');
const sequelize = new Sequelize('node','root','Shiv@3121',
{dialect: 'mysql',
 host: 'localhost'
});

module.exports = sequelize;
