import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StudyPlan = sequelize.define("StudyPlan", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  exam_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  exam_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  plan_data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

export default StudyPlan;
