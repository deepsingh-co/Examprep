import { useState, useEffect } from "react";
import { Trophy, Medal, ChevronDown, Crown } from "lucide-react";
import { examService } from "../../services/examService";
import { battleService } from "../../services/battleService";
import { useAuth } from "../../hooks/useAuth";
import emptyState from "../../components/common/EmptyState";
import toast from "react-hot-toast";

const podiums = [
  { place: 2, color: "border-gray-400 text-gray-300", label: "2nd", height: "h-20", bg: "bg-dark-600" },
  { place: 1, color: "border-yellow-400 text-yellow-400", label: "1st", height: "h-28", bg: "bg-yellow-400/10" },
  { place: 3, color: "border-orange-400 text-orange-400", label: "3rd", height: "h-14", bg: "bg-dark-600" },
];

const Ranking = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const res = await examService.getAll();
      setExams(res.data.data);
    };
    fetch();
  }, []);

  const fetchRanking = async (examId) => {
    if (!examId) return;
    setLoading(true);
    try {
      const res = await battleService.getRanking(examId);
      const list = res.data.data;

      // Aggregate per student: keep best score
      const map = new Map();
      res.data.data.forEach((a) => {
        const uid = a.student_id;
        if (!map.has(uid) || a.score / a.total_questions > map.get(uid).pct) {
          map.set(uid, {
            student: a.student,
            pct: a.total_questions > 0 ? a.score / a.total_questions : 0,
            score: a.score,
            total: a.total_questions,
            date: a.createdAt,
          });
        }
      });
      const agg = Array.from(map.values())
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 20);
      setEntries(agg);
    } catch {
      toast.error("Failed to load ranking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Ranking</h1>
      <p className="text-gray-400 text-sm mb-6">Top performers across the platform</p>

      {/* Exam select */}
      <div className="relative max-w-sm mb-8">
        <select
          value={selectedExam}
          onChange={(e) => {
            setSelectedExam(e.target.value);
            fetchRanking(e.target.value);
          }}
          className="w-full appearance-none bg-dark-800 border border-white/10 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-primary transition"
        >
          <option value="">-- Select exam --</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>

      {selectedExam && loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {selectedExam && !loading && entries.length === 0 && (
        <emptyState
          icon={Trophy}
          title="No rankings yet"
          description="Complete exams to see the leaderboard"
        />
      )}

      {selectedExam && !loading && entries.length > 0 && (
        <>
          {/* Top 3 Podium */}
          <div className="flex items-end justify-center gap-6 mb-8">
            {podiums.map((p) => {
              const entry = entries[p.place - 1];
              return (
                <div key={p.place} className="flex flex-col items-center w-36">
                  <div className="flex items-center gap-1 mb-2">
                    {p.place === 1 && <Crown size={16} className="text-yellow-400" />}
                    <Medal className={`${p.color}`} size={24} />
                  </div>
                  {entry ? (
                    <>
                      <p className="text-center font-medium text-sm mb-1">{entry.student?.name}</p>
                      <div
                        className={`w-11 h-11 rounded-full ${p.bg} flex items-center justify-center font-bold text-primary mb-1`}
                      >
                        {entry.student?.name?.charAt(0)}
                      </div>
                      <div className={`w-full ${p.height} bg-gradient-to-t from-primary/30 to-primary/10 rounded-t-lg flex items-start justify-center pt-2`}>
                        <span className="text-lg font-bold">{Math.round(entry.pct * 100)}%</span>
                      </div>
                    </>
                  ) : (
                    <div className={`w-full ${p.height} bg-white/5 rounded-t-lg flex items-center justify-center text-gray-600`}>
                      —
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Full Leaderboard */}
          <div className="bg-dark-800 border border-white/5 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-white/5">
                  <th className="px-5 py-3 font-medium">Rank</th>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium text-center">Score</th>
                  <th className="px-5 py-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => {
                  const isMe = entry.student?.id === user?.id;
                  return (
                    <tr
                      key={idx}
                      className={`border-b border-white/5 last:border-0 ${
                        isMe ? "bg-primary/10" : "hover:bg-white/5"
                      }`}
                    >
                      <td className="px-5 py-3 font-bold">
                        {idx === 0 ? (
                          <Crown className="text-yellow-400 inline" size={16} />
                        ) : (
                          <span className={idx < 3 ? "text-primary" : "text-gray-500"}>
                            {idx + 1}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {entry.student?.name?.charAt(0)}
                          </div>
                          <span className={isMe ? "font-medium text-primary" : "font-medium"}>
                            {entry.student?.name}
                            {isMe && <span className="ml-2 text-xs text-primary font-normal">(You)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center text-primary font-semibold">
                        {Math.round(entry.pct * 100)}%
                      </td>
                      <td className="px-5 py-3 text-right text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Ranking;