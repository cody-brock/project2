module.exports = function(sequelize, DataTypes) {
  var Result = sequelize.define("Result", {
    winner: {
      type: DataTypes.STRING,
      allowNull: false
    }
    // moves: {
    //   type: DataTypes.TEXT,
    //   allowNull: false
    // }
  });

  return Result;
};
