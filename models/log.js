module.exports = (sequelize, DataTypes) => { 
  return sequelize.define('log', {
    operName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    eventInitBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('now()')
    }
  }, {
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  })
}
