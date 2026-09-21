import { useState, useEffect } from "react";
import { Trophy, Medal, ChevronDown, Crown } from "lucide-react";
import { examService } from "../../services/examService";
import { battleService } from "../../services/battleService";
import { useAuth } from "../../hooks/useAuth";
import emptyState from "../../components/common/EmptyState";
import toast from "react-hot-toast";

const podiums = [
  { place: 2, color: "border-gray-400 text-gray-600", label: "2nd", height: "h-20", bg: "bg-dark-600" },
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
    <div className="relative z-10">
      <h1 className="text-3xl font-extrabold mb-2 tracking-wide text-gray-900">Global Ranking</h1>
      <p className="text-gray-500 text-sm mb-8">Compete with the best. Top performers across the platform.</p>

      {/* Exam select */}
      <div className="relative max-w-sm mb-10">
        <select
          value={selectedExam}
          onChange={(e) => {
            setSelectedExam(e.target.value);
            fetchRanking(e.target.value);
          }}
          className="w-full appearance-none surface-card px-5 py-4 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-gray-900 font-medium"
        >
          <option value="" className="bg-background">-- Select an Exam --</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id} className="bg-background">
              {e.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center pointer-events-none">
          <ChevronDown size={18} className="text-primary" />
        </div>
      </div>

      {selectedExam && loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin drop-shadow-sm" />
        </div>
      )}

      {selectedExam && !loading && entries.length === 0 && (
        <div className="surface-card p-16 text-center">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <p className="text-gray-900 text-lg font-medium">No rankings yet for this exam.</p>
          <p className="text-gray-500 mt-2">Be the first to complete an attempt!</p>
        </div>
      )}

      {selectedExam && !loading && entries.length > 0 && (
        <>
          {/* Top 3 Podium */}
          <div className="flex items-end justify-center gap-4 sm:gap-8 mb-12 mt-8">
            {podiums.map((p) => {
              const entry = entries[p.place - 1];
              return (
                <div key={p.place} className="flex flex-col items-center w-28 sm:w-36 group">
                  <div className="flex items-center gap-1 mb-3">
                    {p.place === 1 && <Crown size={20} className="text-yellow-400 drop-shadow-sm animate-bounce" />}
                    <Medal className={`${p.color} drop-shadow-md`} size={28} />
                  </div>
                  {entry ? (
                    <>
                      <p className="text-center font-bold text-gray-900 mb-2 line-clamp-1 w-full px-2">{entry.student?.name}</p>
                      <div
                        className={`w-14 h-14 rounded-2xl ${p.bg} flex items-center justify-center font-extrabold text-2xl text-primary mb-3 shadow-sm border border-gray-200`}
                      >
                        {entry.student?.name?.charAt(0)}
                      </div>
                      <div className={`w-full ${p.height} bg-gradient-to-t from-primary/40 to-primary/10 rounded-t-xl flex items-start justify-center pt-3 border-t border-x border-primary/20 relative overflow-hidden transition-all duration-300 group-hover:from-primary/50 group-hover:shadow-[0_-5px_20px_rgba(139,92,246,0.3)]`}>
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPjxyZWN0IHdpZHRoPSc0JyBoZWlnaHQ9JzQnIGZpbGw9JyNmZmYnIGZpbGwtb3BhY2l0eT0nMC4wNScvPjwvc3ZnPg==')] opacity-50"></div>
                        <span className="text-xl font-black text-gray-900 drop-shadow-md relative z-10">{Math.round(entry.pct * 100)}%</span>
                      </div>
                    </>
                  ) : (
                    <div className={`w-full ${p.height} bg-surface/50 rounded-t-xl flex items-center justify-center text-gray-600 border-t border-x border-gray-100`}>
                      —
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Full Leaderboard */}
          <div className="surface-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-widest bg-background/50 border-b border-gray-200">
                    <th className="px-6 py-5 font-bold">Rank</th>
                    <th className="px-6 py-5 font-bold">Student</th>
                    <th className="px-6 py-5 font-bold text-center">Score</th>
                    <th className="px-6 py-5 font-bold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {entries.map((entry, idx) => {
                    const isMe = entry.student?.id === user?.id;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors duration-200 ${
                          isMe ? "bg-primary/20 border-l-2 border-l-primary" : "hover:bg-gray-50 border-l-2 border-l-transparent"
                        }`}
                      >
                        <td className="px-6 py-4 font-extrabold text-lg">
                          {idx === 0 ? (
                            <Crown className="text-yellow-400 inline drop-shadow-sm" size={20} />
                          ) : (
                            <span className={idx < 3 ? "text-primary drop-shadow-sm" : "text-gray-500"}>
                              #{idx + 1}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-background border border-gray-200 flex items-center justify-center text-primary font-bold shadow-inner">
                              {entry.student?.name?.charAt(0)}
                            </div>
                            <span className={isMe ? "font-bold text-primary text-base" : "font-medium text-gray-900 text-base"}>
                              {entry.student?.name}
                              {isMe && <span className="ml-3 text-xs bg-primary/20 text-primary px-2 py-1 rounded-md font-bold uppercase tracking-wider">You</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-primary font-extrabold text-lg tracking-wide">
                          {Math.round(entry.pct * 100)}%
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500 font-medium">
                          {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Ranking;