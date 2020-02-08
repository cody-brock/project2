module.exports = function(sequelize, DataTypes) {
  var Move = sequelize.define("Move", {
    column: {
      type: DataTypes.STRING,
      allowNull: false
    },
    row: {
      type: DataTypes.STRING,
      allowNull: false
    },
    player: {
      type: DataTypes.STRING,
      allowNull: false
    }
    // moves: {
    //   type: DataTypes.TEXT,
    //   allowNull: false
    // }
  });

  return Move;
};
