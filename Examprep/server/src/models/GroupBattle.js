import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const GroupBattle = sequelize.define("GroupBattle", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  room_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  topic_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("waiting", "active", "completed"),
    defaultValue: "waiting",
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default GroupBattle;
