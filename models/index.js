'use strict';

const Sequelize = require('sequelize');
const db = {};

const sequelize = new Sequelize('mysql://root:1234@localhost:3306/gana');
//TODO: add table
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
