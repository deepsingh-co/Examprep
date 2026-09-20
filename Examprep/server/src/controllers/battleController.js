import crypto from "crypto";
import { Op } from "sequelize";
import { GroupBattle, BattleParticipant, TestAttempt, Topic, Subject, User } from "../models/index.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const createRoom = async (req, res) => {
  try {
    const { exam_id, topic_id } = req.body;
    const user_id = req.user.id;

    if (!exam_id || !topic_id) {
      return sendError(res, "Exam and topic are required", 400);
    }

    const room_code = crypto.randomBytes(3).toString("hex").toUpperCase();

    const battle = await GroupBattle.create({
      room_code,
      exam_id,
      topic_id,
      created_by: user_id,
      status: "waiting",
    });

    await BattleParticipant.create({
      battle_id: battle.id,
      student_id: user_id,
      status: "waiting",
    });

    return sendSuccess(res, { battle, room_code }, "Room created", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { room_code } = req.body;
    const user_id = req.user.id;

    const battle = await GroupBattle.findOne({
      where: { room_code: room_code.toUpperCase() },
      include: [{ model: BattleParticipant, as: "participants" }],
    });

    if (!battle) return sendError(res, "Room not found", 404);
    if (battle.status !== "waiting") {
      return sendError(res, "Battle already started", 400);
    }

    const alreadyJoined = battle.participants.some(
      (p) => p.student_id === user_id
    );
    if (!alreadyJoined) {
      await BattleParticipant.create({
        battle_id: battle.id,
        student_id: user_id,
        status: "waiting",
      });
    }

    return sendSuccess(res, battle, "Joined room");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const battle = await GroupBattle.findOne({
      where: { room_code: roomCode.toUpperCase() },
      include: [
        {
          model: BattleParticipant,
          as: "participants",
          include: [{ model: User, as: "student", attributes: ["id", "name"] }],
        },
      ],
    });
    if (!battle) return sendError(res, "Room not found", 404);
    return sendSuccess(res, battle);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getRanking = async (req, res) => {
  try {
    const { examId } = req.params;

    const subjects = await Subject.findAll({
      where: { exam_id: examId },
      attributes: ["id"],
    });
    const subjectIds = subjects.map((s) => s.id);

    const topics = await Topic.findAll({
      where: { subject_id: { [Op.in]: subjectIds } },
      attributes: ["id"],
    });
    const topicIds = topics.map((t) => t.id);

    const attempts = await TestAttempt.findAll({
      where: {
        status: "completed",
        topic_id: { [Op.in]: topicIds },
      },
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
      ],
      order: [["score", "DESC"]],
      limit: 100,
    });

    return sendSuccess(res, attempts);
  } catch (err) {
    return sendError(res, err.message);
  }
};