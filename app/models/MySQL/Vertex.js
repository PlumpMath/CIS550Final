
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {

	const Vertex = sequelize.define('Vertex', {
		vertex_id: {
	    	type: Sequelize.UUID,
	    	defaultValue: Sequelize.UUIDV1,
	    	primaryKey: true
	  	},
	  	value: Sequelize.STRING,
	  	is_leaf: Sequelize.BOOLEAN,
	  	file_id: Sequelize.STRING
	});

	Vertex.belongsToMany(Vertex, { as: 'Edge', foreignKey: 'vertex_id_1', otherKey: 'vertex_id_2', through: 'Edges'})

	return Vertex;
}


