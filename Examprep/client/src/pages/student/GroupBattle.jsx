import { useState, useEffect } from "react";
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../hooks/useAuth";
import {
  Swords,
  Copy,
  Check,
  Play,
  Users,
  Trophy,
  Loader2,
  CopyCheck,
} from "lucide-react";
import { battleService } from "../../services/battleService";
import { examService } from "../../services/examService";
import { subjectService } from "../../services/subjectService";
import { topicService } from "../../services/topicService";
import { attemptService } from "../../services/attemptService";
import { questionService } from "../../services/questionService";
import toast from "react-hot-toast";

const GroupBattle = () => {
  const socket = useSocket();
  const { user } = useAuth();

  const [mode, setMode] = useState("menu");
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [room, setRoom] = useState(null);
  const [playerCount, setPlayerCount] = useState(1);
  const [battleStarted, setBattleStarted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Battle questions state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scoreboard, setScoreboard] = useState({});
  const [battleOver, setBattleOver] = useState(false);
  const [winners, setWinners] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      const res = await examService.getAll();
      setExams(res.data.data);
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("battle:playerCount", setPlayerCount);
    socket.on("battle:started", () => {
      setBattleStarted(true);
      loadQuestions();
    });
    socket.on("battle:scoreboard", setScoreboard);
    socket.on("battle:ended", (scores) => {
      setWinners(scores);
      setBattleOver(true);
    });

    return () => socket.off("battle:playerCount");
  }, [socket]);

  const loadSubjects = async (examId) => {
    setSubjects([]);
    setSelectedSubject("");
    const res = await subjectService.getAll(examId);
    setSubjects(res.data.data);
  };

  const loadTopics = async (subjectId) => {
    setTopics([]);
    setSelectedTopic("");
    const res = await topicService.getAll(subjectId);
    setTopics(res.data.data);
  };

  const createRoom = async () => {
    if (!selectedExam || !selectedTopic) {
      toast.error("Select exam and topic");
      return;
    }
    try {
      const res = await battleService.createRoom({
        exam_id: Number(selectedExam),
        topic_id: Number(selectedTopic),
      });
      setRoom(res.data.data.battle);
      socket.emit("battle:join", {
        roomCode: res.data.data.room_code,
        name: user.name,
      });
      setMode("lobby");
      toast.success("Room created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create room");
    }
  };

  const joinRoom = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      const res = await battleService.joinRoom(joinCode.trim().toUpperCase());
      setRoom(res.data.data);
      socket.emit("battle:join", {
        roomCode: joinCode.trim().toUpperCase(),
        name: user.name,
      });
      setMode("lobby");
      toast.success("Joined room!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join room");
    }
  };

  const startBattle = () => {
    socket.emit("battle:start", { roomCode: room.room_code });
  };

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const topicId = Number(selectedTopic || room.topic_id);
      const res = await questionService.getByTopic(topicId);
      setQuestions(res.data.data);
    } catch {
      toast.error("No questions available for this topic");
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswer = (optionId) => {
    const q = questions[currentIndex];
    const isCorrect = q.options.find((o) => o.id === optionId)?.is_correct;
    const newAnswers = { ...answers, [currentIndex]: { id: optionId, correct: isCorrect } };
    setAnswers(newAnswers);

    const score = Object.values(newAnswers).filter((a) => a.correct).length;
    socket.emit("battle:answer", {
      roomCode: room?.room_code,
      name: user.name,
      score,
    });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      socket.emit("battle:end", { roomCode: room?.room_code });
    }
  };

  const matchedPeople = playerCount === 1 ? `${playerCount} person` : `${playerCount} people`;

  const renderMenu = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <Swords className="w-14 h-14 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Group Battle</h2>
        <p className="text-gray-400">Compete with classmates in real-time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Room */}
        <div className="bg-dark-800 border border-white/5 rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4">Create a Room</h3>
          <div className="space-y-3">
            <select
              value={selectedExam}
              onChange={(e) => {
                setSelectedExam(e.target.value);
                loadSubjects(e.target.value);
              }}
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
            >
              <option value="">Select Exam</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                loadTopics(e.target.value);
              }}
              disabled={!selectedExam}
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition disabled:opacity-40"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedSubject}
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition disabled:opacity-40"
            >
              <option value="">Select Topic</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              onClick={createRoom}
              disabled={!selectedTopic}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-40 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Create Room
            </button>
          </div>
        </div>

        {/* Join Room */}
        <div className="bg-dark-800 border border-white/5 rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4">Join a Room</h3>
          <form onSubmit={joinRoom} className="space-y-3">
            <input
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-center uppercase tracking-[0.3em] font-mono focus:outline-none focus:border-primary transition"
              placeholder="ROOM CODE"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button
              type="submit"
              disabled={joinCode.length < 6}
              className="w-full bg-white/10 hover:bg-white/15 disabled:opacity-40 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Join Room
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4">
            Enter the room code shared by a friend to join their battle.
          </p>
        </div>
      </div>
    </div>
  );

  const renderLobby = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-dark-800 border border-white/5 rounded-xl p-8">
        <h2 className="text-xl font-bold mb-1">Battle Lobby</h2>
        {/* Room code display */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="font-mono text-3xl font-bold tracking-[0.3em] text-primary">
            {room?.room_code}
          </span>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(room?.room_code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="text-gray-400 hover:text-white transition"
            title="Copy code"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-gray-400">
          <Users size={16} />
          <span>{matchedPeople} in room</span>
        </div>

        {/* Participants */}
        <div className="mt-5 flex justify-center -space-x-2">
          {Array.from({ length: playerCount }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full bg-primary/20 border-2 border-dark-800 flex items-center justify-center text-primary font-bold text-sm"
            >
              {i === 0 ? user?.name?.charAt(0) : "?"}
            </div>
          ))}
        </div>

        {/* Waiting indicator */}
        {!battleStarted && (
          <div className="mt-6 h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "50%" }} />
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">Waiting for players...</p>

        <button
          onClick={startBattle}
          disabled={battleStarted}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 disabled:opacity-40 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          <Play size={16} /> Start Battle
        </button>
        <p className="text-xs text-gray-500 mt-3">
          Everyone will see the same questions. Fastest correct answers win!
        </p>
      </div>
    </div>
  );

  const renderBattle = () => {
    if (loadingQuestions) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-gray-400 text-sm mt-4">Loading battle questions...</p>
        </div>
      );
    }

    if (battleOver) {
      const sorted = Object.entries(winners).sort((a, b) => b[1] - a[1]);
      return (
        <div className="max-w-md mx-auto text-center">
          <Trophy className="w-14 h-14 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-6">Battle Over!</h2>
          <div className="bg-dark-800 border border-white/5 rounded-xl p-6 space-y-3">
            {sorted.map(([name, score], i) => (
              <div
                key={name}
                className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                  name === user.name ? "bg-primary/10" : "bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2 font-medium">
                  <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                  {name} {name === user.name && "(You)"}
                </span>
                <span className="font-bold text-primary">{score}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setMode("menu");
              setBattleStarted(false);
              setBattleOver(false);
              setQuestions([]);
              setAnswers({});
              setScoreboard({});
              setRoom(null);
            }}
            className="mt-6 bg-primary hover:bg-primary-hover px-6 py-2.5 rounded-lg text-sm font-medium transition"
          >
            Back to Menu
          </button>
        </div>
      );
    }

    const q = questions[currentIndex];
    if (!q) return null;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-lg">Live Battle</h2>
          <span className="text-sm text-gray-400">
            Q{currentIndex + 1}/{questions.length}
          </span>
        </div>

        {/* Scoreboard */}
        <div className="bg-dark-800 border border-white/5 rounded-xl p-4 mb-5">
          <h3 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Trophy size={12} /> LIVE SCOREBOARD
          </h3>
          <div className="flex gap-3 flex-wrap">
            {Object.keys(scoreboard).length === 0 && (
              <span className="text-sm text-gray-500">Answer questions to build the leaderboard!</span>
            )}
            {Object.entries(scoreboard)
              .sort((a, b) => b[1] - a[1])
              .map(([name, score]) => (
                <div
                  key={name}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                    name === user.name ? "bg-primary/20 text-primary" : "bg-white/5 text-gray-300"
                  }`}
                >
                  <span>{name === user.name ? "You" : name}</span>
                  <span className="font-bold">{score}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Question */}
        <div className="bg-dark-800 border border-white/5 rounded-xl p-6">
          <p className="text-lg mb-6">{q.question_text}</p>
          <div className="space-y-2">
            {q.options?.map((opt, oi) => {
              const selected = answers[currentIndex]?.id === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer(opt.id)}
                  disabled={answers[currentIndex] !== undefined}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                    selected
                      ? opt.is_correct
                        ? "bg-green-400/10 border-green-400 text-green-400"
                        : "bg-red-400/10 border-red-400 text-red-400"
                      : answers[currentIndex] && opt.is_correct
                      ? "bg-green-400/10 border-green-400 text-green-400"
                      : "bg-white/5 border-white/10 text-gray-300"
                  }`}
                >
                  <span className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt.option_text}
                </button>
              );
            })}
          </div>

          {answers[currentIndex] !== undefined && (
            <button
              onClick={nextQuestion}
              className="w-full mt-4 bg-primary hover:bg-primary-hover py-3 rounded-lg font-medium transition"
            >
              {currentIndex < questions.length - 1 ? "Next Question" : "Finish Battle"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={mode === "menu" ? "py-8" : "py-4"}>
      {mode === "menu" && renderMenu()}
      {mode === "lobby" && !battleStarted && renderLobby()}
      {(mode === "lobby" || mode === "battle") && battleStarted && renderBattle()}
    </div>
  );
};

export default GroupBattle;