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
    <div className="relative z-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-wide">Test History</h1>
      <p className="text-gray-500 text-sm mb-8">All your past test attempts</p>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            className="w-full surface-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-gray-900 placeholder-gray-500"
            placeholder="Search by topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative md:w-64">
          <select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className="appearance-none w-full surface-card px-4 py-3 text-sm pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-gray-900 cursor-pointer"
          >
            <option value="" className="bg-surface">All Exams</option>
            {exams.map((e) => (
              <option key={e.id} value={e.name} className="bg-surface">
                {e.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No tests found"
          description="Take your first exam to see it here"
        />
      ) : (
        <div className="surface-card overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-200 uppercase tracking-wider bg-gray-50">
                <th className="px-6 py-4 font-semibold">Exam</th>
                <th className="px-6 py-4 font-semibold">Topic</th>
                <th className="px-6 py-4 font-semibold text-center">Score</th>
                <th className="px-6 py-4 font-semibold text-center">Correct</th>
                <th className="px-6 py-4 font-semibold text-center">Wrong</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => navigate(`/student/result/${a.id}`)}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                    {a.topic?.subject?.exam?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{a.topic?.name}</td>
                  <td className="px-6 py-4 text-center font-bold text-primary">
                    {a.score}/{a.total_questions}
                  </td>
                  <td className="px-6 py-4 text-center text-green-400 font-medium">{a.total_correct}</td>
                  <td className="px-6 py-4 text-center text-red-400 font-medium">{a.total_wrong}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(a.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm opacity-90 ${
                        a.status === "completed"
                          ? "bg-green-400/10 text-green-400 border border-green-400/20"
                          : a.status === "abandoned"
                          ? "bg-red-400/10 text-red-400 border border-red-400/20"
                          : "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
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