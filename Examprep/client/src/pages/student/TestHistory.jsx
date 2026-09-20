import { useState, useEffect } from "react";
import { History, Search, ChevronDown } from "lucide-react";
import { attemptService } from "../../services/attemptService";
import { examService } from "../../services/examService";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";
import toast from "react-hot-toast";

const TestHistory = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterExam, setFilterExam] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const [attemptRes, examRes] = await Promise.all([
          attemptService.getMyAttempts(),
          examService.getAll(),
        ]);
        setAttempts(attemptRes.data.data);
        setExams(examRes.data.data);
      } catch {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const examName = (topic) => topic?.subject?.exam?.name || "";

  const filtered = attempts.filter((a) => {
    if (filterExam && examName(a.topic) !== filterExam) return false;
    if (search && !String(a.topic?.name).toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Test History</h1>
      <p className="text-gray-400 text-sm mb-6">All your past test attempts</p>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            className="w-full bg-dark-800 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
            placeholder="Search by topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className="appearance-none bg-dark-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm pr-10 focus:outline-none focus:border-primary transition"
          >
            <option value="">All Exams</option>
            {exams.map((e) => (
              <option key={e.id} value={e.name}>
                {e.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No tests found"
          description="Take your first exam to see it here"
        />
      ) : (
        <div className="bg-dark-800 border border-white/5 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-white/5">
                <th className="px-5 py-3 font-medium">Exam</th>
                <th className="px-5 py-3 font-medium">Topic</th>
                <th className="px-5 py-3 font-medium text-center">Score</th>
                <th className="px-5 py-3 font-medium text-center">Correct</th>
                <th className="px-5 py-3 font-medium text-center">Wrong</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => navigate(`/student/result/${a.id}`)}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5 transition cursor-pointer"
                >
                  <td className="px-5 py-3 text-gray-300">
                    {a.topic?.subject?.exam?.name || "—"}
                  </td>
                  <td className="px-5 py-3">{a.topic?.name}</td>
                  <td className="px-5 py-3 text-center font-medium text-primary">
                    {a.score}/{a.total_questions}
                  </td>
                  <td className="px-5 py-3 text-center text-green-400">{a.total_correct}</td>
                  <td className="px-5 py-3 text-center text-red-400">{a.total_wrong}</td>
                  <td className="px-5 py-3 text-gray-400">{formatDate(a.createdAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        a.status === "completed"
                          ? "bg-green-400/10 text-green-400"
                          : a.status === "abandoned"
                          ? "bg-red-400/10 text-red-400"
                          : "bg-yellow-400/10 text-yellow-400"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TestHistory;