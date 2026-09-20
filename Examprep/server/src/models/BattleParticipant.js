import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const BattleParticipant = sequelize.define("BattleParticipant", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  battle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("waiting", "active", "finished"),
    defaultValue: "waiting",
  },
});

export default BattleParticipant;
