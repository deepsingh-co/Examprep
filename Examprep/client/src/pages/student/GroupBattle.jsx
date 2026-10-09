import { useState, useEffect, useRef } from "react";
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
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

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
  const loadQuestionsRef = useRef(() => {});

  useEffect(() => {
    const fetchExams = async () => {
      const res = await examService.getAll();
      setExams(res.data.data);
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onPlayerCount = (count) => setPlayerCount(count);
    const onStarted = () => {
      setBattleStarted(true);
      loadQuestionsRef.current?.();
    };
    const onScoreboard = (scores) => setScoreboard(scores);
    const onEnded = (scores) => {
      setWinners(scores);
      setBattleOver(true);
    };

    socket.on("battle:playerCount", onPlayerCount);
    socket.on("battle:started", onStarted);
    socket.on("battle:scoreboard", onScoreboard);
    socket.on("battle:ended", onEnded);

    return () => {
      socket.off("battle:playerCount", onPlayerCount);
      socket.off("battle:started", onStarted);
      socket.off("battle:scoreboard", onScoreboard);
      socket.off("battle:ended", onEnded);
    };
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
        exam_id: selectedExam,
        topic_id: selectedTopic,
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
      const topicId = selectedTopic || room?.topic_id;
      const res = await questionService.getByTopic(topicId);
      setQuestions(res.data.data);
    } catch {
      toast.error("No questions available for this topic");
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Keep the socket handler pointed at the latest closure (selectedTopic/room)
  useEffect(() => {
    loadQuestionsRef.current = loadQuestions;
  });

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
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="w-20 h-20 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-primary/30"
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
          <Swords className="w-10 h-10 text-primary drop-shadow-sm" />
        </motion.div>
        <h2 className="text-4xl font-extrabold mb-3 text-gray-900 tracking-wide">Live Group Battle</h2>
        <p className="text-gray-500 text-lg">Compete with classmates in real-time, rank on the live scoreboard.</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Create Room */}
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -6 }}
          className="surface-card p-8 relative overflow-hidden group hover:border-primary/50 transition-colors duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full group-hover:bg-primary/20 transition-colors"></div>
          <h3 className="font-bold text-2xl text-gray-900 mb-6 flex items-center gap-3">
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
              className="w-full surface-card border border-gray-200 px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-gray-900 appearance-none"
            >
              <option value="" className="bg-background">Select Exam</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id} className="bg-background">{e.name}</option>
              ))}
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                loadTopics(e.target.value);
              }}
              disabled={!selectedExam}
              className="w-full surface-card border border-gray-200 px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-gray-900 appearance-none disabled:opacity-40"
            >
              <option value="" className="bg-background">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-background">{s.name}</option>
              ))}
            </select>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedSubject}
              className="w-full surface-card border border-gray-200 px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-gray-900 appearance-none disabled:opacity-40"
            >
              <option value="" className="bg-background">Select Topic</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id} className="bg-background">{t.name}</option>
              ))}
            </select>
            <button
              onClick={createRoom}
              disabled={!selectedTopic}
              className="w-full bg-primary/90 hover:bg-primary disabled:opacity-40 py-3.5 rounded-xl text-sm font-bold text-gray-900 shadow-sm transition-all hover:-translate-y-0.5 mt-2"
            >
              Create Room
            </button>
          </div>
        </motion.div>

        {/* Join Room */}
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -6 }}
          className="surface-card p-8 relative overflow-hidden group hover:border-accent-cyan/50 transition-colors duration-500">
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-cyan/10 blur-[50px] rounded-full group-hover:bg-accent-cyan/20 transition-colors"></div>
          <h3 className="font-bold text-2xl text-gray-900 mb-6 flex items-center gap-3">
             <span className="w-8 h-8 rounded-lg bg-accent-cyan/20 text-accent-cyan flex items-center justify-center text-sm">2</span>
            Join a Room
          </h3>
          <form onSubmit={joinRoom} className="space-y-5 relative z-10">
            <input
              className="w-full surface-card border border-gray-200 px-5 py-4 text-lg text-center uppercase tracking-[0.5em] font-mono focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all text-gray-900 placeholder-gray-600"
              placeholder="ROOM CODE"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button
              type="submit"
              disabled={joinCode.length < 6}
              className="w-full bg-accent-cyan/90 hover:bg-accent-cyan disabled:opacity-40 py-3.5 rounded-xl text-sm font-bold text-dark-900 shadow-sm transition-all hover:-translate-y-0.5 mt-2"
            >
              Join Battle
            </button>
          </form>
          <div className="mt-8 p-4 bg-background/50 rounded-xl border border-gray-100 relative z-10">
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Enter the 6-character room code shared by your friend to join their private battle room.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );

  const renderLobby = () => (
    <div className="max-w-md mx-auto text-center relative z-10 mt-10">
      <motion.div
        className="surface-card p-10 relative overflow-hidden shadow-sm"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
        <h2 className="text-3xl font-extrabold mb-2 text-gray-900 tracking-wide relative z-10">Battle Lobby</h2>
        <p className="text-gray-500 mb-6 relative z-10">Invite friends using the code below</p>
        
        {/* Room code display */}
        <div className="bg-background/50 border border-gray-200 p-6 rounded-2xl mb-8 relative z-10">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Room Code</p>
          <div className="flex items-center justify-center gap-1">
            {(room?.room_code || "").split("").map((ch, i) => (
              <motion.span
                key={i}
                className="font-mono text-5xl font-black tracking-[0.2em] text-primary drop-shadow-sm inline-block"
                initial={{ opacity: 0, y: 28, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 380, damping: 16 }}
                whileHover={{ scale: 1.2, rotate: 8 }}
              >
                {ch}
              </motion.span>
            ))}
            <button
              onClick={() => {
                navigator.clipboard?.writeText(room?.room_code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-12 h-12 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              title="Copy code"
            >
              {copied ? <Check size={24} className="text-green-400" /> : <Copy size={24} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6 text-gray-600 font-medium relative z-10">
          <Users size={18} className="text-primary" />
          <motion.span
            key={playerCount}
            initial={{ scale: 1.4, opacity: 0.3 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            {matchedPeople} in room
          </motion.span>
        </div>

        {/* Participants */}
        <div className="flex justify-center -space-x-4 relative z-10 mb-8">
          {Array.from({ length: Math.max(playerCount, 3) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 320, damping: 15 }}
              whileHover={{ scale: 1.12, zIndex: 10 }}
              className={`w-14 h-14 rounded-full border-4 border-dark-800 flex items-center justify-center font-bold text-lg shadow-lg ${
                i < playerCount 
                  ? "bg-primary/20 text-primary border-primary/30 shadow-sm" 
                  : "bg-background text-gray-600 border-gray-100 border-dashed"
              }`}
            >
              {i === 0 ? user?.name?.charAt(0) : i < playerCount ? "?" : ""}
            </motion.div>
          ))}
        </div>

        {/* Waiting indicator */}
        {!battleStarted && (
          <div className="mb-8 relative z-10">
            <div className="h-2.5 bg-background rounded-full overflow-hidden border border-gray-100">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent-cyan rounded-full"
                initial={{ width: "35%" }}
                animate={{ width: ["35%", "92%", "35%"] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              />
            </div>
            <motion.p
              className="text-sm text-gray-500 mt-3 font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              Waiting for players to join...
            </motion.p>
          </div>
        )}

        <motion.button
          onClick={startBattle}
          disabled={battleStarted}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          animate={battleStarted ? {} : { boxShadow: ["0 0 0px rgba(34,197,94,0)", "0 0 24px rgba(34,197,94,0.45)", "0 0 0px rgba(34,197,94,0)"] }}
          transition={{ boxShadow: { repeat: Infinity, duration: 1.8 } }}
          className="w-full bg-green-500/90 hover:bg-green-500 disabled:opacity-40 py-4 rounded-xl font-bold text-gray-900 text-lg transition-all flex items-center justify-center gap-3 shadow-sm relative z-10"
        >
          <Play size={20} fill="currentColor" /> START BATTLE
        </motion.button>
      </motion.div>
    </div>
  );

  const renderBattle = () => {
    if (loadingQuestions) {
      return (
        <motion.div
          className="flex flex-col items-center justify-center py-24"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-gray-500 text-sm mt-4">Loading battle questions...</p>
        </motion.div>
      );
    }

    if (battleOver) {
      const sorted = Object.entries(winners).sort((a, b) => b[1] - a[1]);
      return (
        <motion.div
          className="max-w-md mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 12 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            >
              <Trophy className="w-14 h-14 text-yellow-400 mx-auto mb-4" />
            </motion.div>
          </motion.div>
          <h2 className="text-2xl font-bold mb-6">Battle Over!</h2>
          <div className="bg-surface border border-gray-100 rounded-xl p-6 space-y-3">
            {sorted.map(([name, score], i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -30 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  ...(i === 0 ? { scale: [1, 1.03, 1] } : {}),
                }}
                transition={{
                  delay: 0.2 + i * 0.12,
                  ...(i === 0
                    ? { scale: { repeat: Infinity, duration: 2 } }
                    : {}),
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                  name === user.name ? "bg-primary/10" : "bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-2 font-medium">
                  <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                  {name} {name === user.name && "(You)"}
                </span>
                <span className="font-bold text-primary">{score}</span>
              </motion.div>
            ))}
          </div>
          <motion.button
            whileHover={{ y: -3, scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
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
          </motion.button>
        </motion.div>
      );
    }

    const q = questions[currentIndex];
    if (!q) return null;

    return (
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          className="mb-6 surface-card px-6 py-4 rounded-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-xl text-gray-900 tracking-wide flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div> Live Battle
            </h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="bg-background px-4 py-1.5 rounded-full border border-gray-200 text-sm font-bold text-gray-600"
              >
                Q {currentIndex + 1} <span className="text-gray-600 mx-1">/</span> {questions.length}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="h-1.5 bg-background rounded-full overflow-hidden border border-gray-100 mt-3">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent-cyan rounded-full"
              animate={{
                width: `${((currentIndex + 1) / Math.max(questions.length, 1)) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="md:col-span-2 space-y-6">
            <div className="surface-card p-8 min-h-[400px] flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="flex flex-col flex-1"
                >
                  <p className="text-2xl leading-relaxed text-gray-900 mb-8 font-medium">{q.question_text}</p>
                  <div className="space-y-3 mt-auto">
                    {q.options?.map((opt, oi) => {
                      const selected = answers[currentIndex]?.id === opt.id;
                      const answered = answers[currentIndex] !== undefined;
                      return (
                        <motion.button
                          key={opt.id}
                          onClick={() => handleAnswer(opt.id)}
                          disabled={answered}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.12 + oi * 0.07, duration: 0.3 }}
                          whileHover={answered ? {} : { x: 8 }}
                          whileTap={answered ? {} : { scale: 0.98 }}
                          className={`w-full text-left flex items-center gap-4 px-6 py-4 rounded-xl border-2 transition-all duration-300 ${
                            selected
                              ? opt.is_correct
                                ? "bg-green-400/20 border-green-400 text-green-400 shadow-sm"
                                : "bg-red-400/20 border-red-400 text-red-400 shadow-sm"
                              : answered && opt.is_correct
                              ? "bg-green-400/20 border-green-400 text-green-400 shadow-sm"
                              : "bg-background/50 border-gray-100 text-gray-600 hover:border-primary/50 hover:bg-gray-50"
                          }`}
                        >
                          <span className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                             selected || (answered && opt.is_correct) ? "border-current" : "border-gray-600 text-gray-500"
                          }`}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="text-lg">{opt.option_text}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>
                {answers[currentIndex] !== undefined && (
                  <motion.button
                    onClick={nextQuestion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full mt-6 bg-primary/90 hover:bg-primary py-4 rounded-xl font-bold text-gray-900 text-lg transition-all shadow-sm"
                  >
                    {currentIndex < questions.length - 1 ? "Next Question →" : "Finish Battle"}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Sidebar: Scoreboard */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="surface-card p-6 h-full sticky top-24 shadow-premium border-primary/20 bg-gradient-to-b from-white to-gray-50/50"
            >
              <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 pb-4">
                <Trophy size={18} className="text-yellow-500 drop-shadow-sm" /> Live Leaderboard
              </h3>
              <div className="space-y-3">
                {Object.keys(scoreboard).length === 0 && (
                  <motion.p
                    className="text-sm text-gray-500 text-center italic py-4"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    Waiting for first answers...
                  </motion.p>
                )}
                {Object.entries(scoreboard)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, score], idx) => (
                    <motion.div
                      key={name}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                        name === user.name 
                          ? "bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30 shadow-glow" 
                          : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-black w-6 text-center text-lg ${
                          idx === 0 ? "text-yellow-500 drop-shadow-sm" : 
                          idx === 1 ? "text-slate-400" : 
                          idx === 2 ? "text-amber-600" : "text-gray-400"
                        }`}>
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                        </span>
                        <span className={`font-semibold ${name === user.name ? "text-gray-900" : "text-gray-700"}`}>
                          {name === user.name ? "You" : name}
                        </span>
                      </div>
                      <motion.span
                        key={score}
                        initial={{ scale: 1.7 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 420, damping: 14 }}
                        className={`font-black text-2xl ${name === user.name ? "text-primary" : "text-gray-900"}`}
                      >
                        {score}
                      </motion.span>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  const viewKey =
    mode === "menu" ? "menu" : battleStarted ? "battle" : "lobby";

  return (
    <MotionConfig reducedMotion="user">
      <div className={mode === "menu" ? "py-8" : "py-4"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={viewKey}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {viewKey === "menu" && renderMenu()}
            {viewKey === "lobby" && renderLobby()}
            {viewKey === "battle" && renderBattle()}
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default GroupBattle;