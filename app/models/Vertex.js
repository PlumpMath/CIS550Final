const Sequelize = require('sequelize');

const sequelize = new Sequelize(MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD, {
	host: MYSQL_HOST
});

var vertex;
vertex = sequelize.define('Vertex', {
	vertex_id: {
    	type: Sequelize.UUID,
    	defaultValue: Sequelize.UUIDV1,
    	primaryKey: true
  	},
  	value: Sequelize.STRING,
  	is_leaf: Sequelize.BOOLEAN,
  	file_id: Sequelize.STRING
}); 

module.exports = vertex;
