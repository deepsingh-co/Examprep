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
    <div className="max-w-4xl mx-auto relative z-10">
      <div className="text-center mb-12">
        <div className="w-20 h-20 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.3)] border border-primary/30">
          <Swords className="w-10 h-10 text-primary drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
        </div>
        <h2 className="text-4xl font-extrabold mb-3 text-white tracking-wide">Live Group Battle</h2>
        <p className="text-gray-400 text-lg">Compete with classmates in real-time, rank on the live scoreboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Room */}
        <div className="glass-panel p-8 relative overflow-hidden group hover:border-primary/50 transition-colors duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full group-hover:bg-primary/20 transition-colors"></div>
          <h3 className="font-bold text-2xl text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm">1</span>
            Create a Room
          </h3>
          <div className="space-y-5 relative z-10">
            <select
              value={selectedExam}
              onChange={(e) => {
                setSelectedExam(e.target.value);
                loadSubjects(e.target.value);
              }}
              className="w-full glass-panel border border-white/10 px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white appearance-none"
            >
              <option value="" className="bg-dark-900">Select Exam</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id} className="bg-dark-900">{e.name}</option>
              ))}
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                loadTopics(e.target.value);
              }}
              disabled={!selectedExam}
              className="w-full glass-panel border border-white/10 px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white appearance-none disabled:opacity-40"
            >
              <option value="" className="bg-dark-900">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-dark-900">{s.name}</option>
              ))}
            </select>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedSubject}
              className="w-full glass-panel border border-white/10 px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white appearance-none disabled:opacity-40"
            >
              <option value="" className="bg-dark-900">Select Topic</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id} className="bg-dark-900">{t.name}</option>
              ))}
            </select>
            <button
              onClick={createRoom}
              disabled={!selectedTopic}
              className="w-full bg-primary/90 hover:bg-primary disabled:opacity-40 py-3.5 rounded-xl text-sm font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all hover:-translate-y-0.5 mt-2"
            >
              Create Room
            </button>
          </div>
        </div>

        {/* Join Room */}
        <div className="glass-panel p-8 relative overflow-hidden group hover:border-accent-cyan/50 transition-colors duration-500">
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-cyan/10 blur-[50px] rounded-full group-hover:bg-accent-cyan/20 transition-colors"></div>
          <h3 className="font-bold text-2xl text-white mb-6 flex items-center gap-3">
             <span className="w-8 h-8 rounded-lg bg-accent-cyan/20 text-accent-cyan flex items-center justify-center text-sm">2</span>
            Join a Room
          </h3>
          <form onSubmit={joinRoom} className="space-y-5 relative z-10">
            <input
              className="w-full glass-panel border border-white/10 px-5 py-4 text-lg text-center uppercase tracking-[0.5em] font-mono focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all text-white placeholder-gray-600"
              placeholder="ROOM CODE"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button
              type="submit"
              disabled={joinCode.length < 6}
              className="w-full bg-accent-cyan/90 hover:bg-accent-cyan disabled:opacity-40 py-3.5 rounded-xl text-sm font-bold text-dark-900 shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all hover:-translate-y-0.5 mt-2"
            >
              Join Battle
            </button>
          </form>
          <div className="mt-8 p-4 bg-dark-900/50 rounded-xl border border-white/5 relative z-10">
            <p className="text-sm text-gray-400 text-center leading-relaxed">
              Enter the 6-character room code shared by your friend to join their private battle room.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLobby = () => (
    <div className="max-w-md mx-auto text-center relative z-10 mt-10">
      <div className="glass-panel p-10 relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
        <h2 className="text-3xl font-extrabold mb-2 text-white tracking-wide relative z-10">Battle Lobby</h2>
        <p className="text-gray-400 mb-6 relative z-10">Invite friends using the code below</p>
        
        {/* Room code display */}
        <div className="bg-dark-900/50 border border-white/10 p-6 rounded-2xl mb-8 relative z-10">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Room Code</p>
          <div className="flex items-center justify-center gap-4">
            <span className="font-mono text-5xl font-black tracking-[0.2em] text-primary drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              {room?.room_code}
            </span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(room?.room_code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-12 h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl flex items-center justify-center transition-all hover:scale-105"
              title="Copy code"
            >
              {copied ? <Check size={24} className="text-green-400" /> : <Copy size={24} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6 text-gray-300 font-medium relative z-10">
          <Users size={18} className="text-primary" />
          <span>{matchedPeople} in room</span>
        </div>

        {/* Participants */}
        <div className="flex justify-center -space-x-4 relative z-10 mb-8">
          {Array.from({ length: Math.max(playerCount, 3) }).map((_, i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-full border-4 border-dark-800 flex items-center justify-center font-bold text-lg shadow-lg ${
                i < playerCount 
                  ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                  : "bg-dark-900 text-gray-600 border-white/5 border-dashed"
              }`}
            >
              {i === 0 ? user?.name?.charAt(0) : i < playerCount ? "?" : ""}
            </div>
          ))}
        </div>

        {/* Waiting indicator */}
        {!battleStarted && (
          <div className="mb-8 relative z-10">
            <div className="h-2.5 bg-dark-900 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-primary to-accent-cyan rounded-full animate-[pulse_2s_ease-in-out_infinite]" style={{ width: "60%" }} />
            </div>
            <p className="text-sm text-gray-400 mt-3 font-medium">Waiting for players to join...</p>
          </div>
        )}

        <button
          onClick={startBattle}
          disabled={battleStarted}
          className="w-full bg-green-500/90 hover:bg-green-500 disabled:opacity-40 py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:-translate-y-1 relative z-10"
        >
          <Play size={20} fill="currentColor" /> START BATTLE
        </button>
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
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-6 flex items-center justify-between glass-panel px-6 py-4 rounded-xl">
          <h2 className="font-extrabold text-xl text-white tracking-wide flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div> Live Battle
          </h2>
          <div className="bg-dark-900 px-4 py-1.5 rounded-full border border-white/10 text-sm font-bold text-gray-300">
            Q {currentIndex + 1} <span className="text-gray-600 mx-1">/</span> {questions.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel p-8 min-h-[400px] flex flex-col">
              <p className="text-2xl leading-relaxed text-white mb-8 font-medium">{q.question_text}</p>
              <div className="space-y-3 mt-auto">
                {q.options?.map((opt, oi) => {
                  const selected = answers[currentIndex]?.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(opt.id)}
                      disabled={answers[currentIndex] !== undefined}
                      className={`w-full text-left flex items-center gap-4 px-6 py-4 rounded-xl border-2 transition-all duration-300 ${
                        selected
                          ? opt.is_correct
                            ? "bg-green-400/20 border-green-400 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                            : "bg-red-400/20 border-red-400 text-red-400 shadow-[0_0_15px_rgba(248,113,113,0.2)]"
                          : answers[currentIndex] && opt.is_correct
                          ? "bg-green-400/20 border-green-400 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                          : "bg-dark-900/50 border-white/5 text-gray-300 hover:border-primary/50 hover:bg-white/5"
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                         selected || (answers[currentIndex] && opt.is_correct) ? "border-current" : "border-gray-600 text-gray-500"
                      }`}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="text-lg">{opt.option_text}</span>
                    </button>
                  );
                })}
              </div>

              {answers[currentIndex] !== undefined && (
                <button
                  onClick={nextQuestion}
                  className="w-full mt-6 bg-primary/90 hover:bg-primary py-4 rounded-xl font-bold text-white text-lg transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:-translate-y-1"
                >
                  {currentIndex < questions.length - 1 ? "Next Question →" : "Finish Battle"}
                </button>
              )}
            </div>
          </div>

          {/* Right Sidebar: Scoreboard */}
          <div className="md:col-span-1">
            <div className="glass-panel p-6 h-full sticky top-24">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                <Trophy size={18} className="text-yellow-400" /> Leaderboard
              </h3>
              <div className="space-y-3">
                {Object.keys(scoreboard).length === 0 && (
                  <p className="text-sm text-gray-500 text-center italic py-4">Waiting for first answers...</p>
                )}
                {Object.entries(scoreboard)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, score], idx) => (
                    <div
                      key={name}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        name === user.name 
                          ? "bg-primary/20 border-primary/30 shadow-[0_0_10px_rgba(139,92,246,0.1)]" 
                          : "bg-dark-900/50 border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-bold w-5 text-center ${idx === 0 ? "text-yellow-400" : idx === 1 ? "text-gray-300" : idx === 2 ? "text-orange-400" : "text-gray-600"}`}>
                          {idx + 1}
                        </span>
                        <span className={`font-medium ${name === user.name ? "text-white" : "text-gray-300"}`}>
                          {name === user.name ? "You" : name}
                        </span>
                      </div>
                      <span className="font-black text-xl text-primary">{score}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
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