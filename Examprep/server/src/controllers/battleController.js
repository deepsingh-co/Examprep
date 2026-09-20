import crypto from "crypto";
import GroupBattle from "../models/GroupBattle.js";
import BattleParticipant from "../models/BattleParticipant.js";
import TestAttempt from "../models/TestAttempt.js";
import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
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
      battle_id: battle._id,
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

    const battle = await GroupBattle.findOne({ room_code: room_code.toUpperCase() }).lean();

    if (!battle) return sendError(res, "Room not found", 404);
    if (battle.status !== "waiting") {
      return sendError(res, "Battle already started", 400);
    }

    const participants = await BattleParticipant.find({ battle_id: battle._id });
    
    const alreadyJoined = participants.some(
      (p) => p.student_id.toString() === user_id.toString()
    );
    
    if (!alreadyJoined) {
      await BattleParticipant.create({
        battle_id: battle._id,
        student_id: user_id,
        status: "waiting",
      });
    }

    battle.participants = await BattleParticipant.find({ battle_id: battle._id });

    return sendSuccess(res, battle, "Joined room");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const battle = await GroupBattle.findOne({ room_code: roomCode.toUpperCase() }).lean();
    if (!battle) return sendError(res, "Room not found", 404);
    
    battle.participants = await BattleParticipant.find({ battle_id: battle._id })
      .populate("student_id", "name");
      
    return sendSuccess(res, battle);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getRanking = async (req, res) => {
  try {
    const { examId } = req.params;

    const subjects = await Subject.find({ exam_id: examId }).select("_id");
    const subjectIds = subjects.map((s) => s._id);

    const topics = await Topic.find({ subject_id: { $in: subjectIds } }).select("_id");
    const topicIds = topics.map((t) => t._id);

    const attempts = await TestAttempt.find({
      status: "completed",
      topic_id: { $in: topicIds },
    })
      .populate("student_id", "name email")
      .sort({ score: -1 })
      .limit(100);

    return sendSuccess(res, attempts);
  } catch (err) {
    return sendError(res, err.message);
  }
};