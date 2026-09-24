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
        
        // Inject demo history data
        const demoHistory = [
          {
            id: 'hist1',
            topic: { name: 'Full Syllabus Mock Test 1', subject: { exam: { name: 'Lakshya JEE 2024 Test Series' } } },
            score: 180,
            total_questions: 90,
            total_correct: 45,
            total_wrong: 15,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          },
          {
            id: 'hist2',
            topic: { name: 'Part Test - Mechanics', subject: { exam: { name: 'Lakshya JEE 2024 Test Series' } } },
            score: 95,
            total_questions: 50,
            total_correct: 25,
            total_wrong: 5,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          }
        ];
        
        setAttempts([...attemptRes.data.data, ...demoHistory]);
        
        // Also add the mock exams to the dropdown
        const demoExams = [
          { id: 'demo1', name: 'Lakshya JEE 2024 Test Series' },
          { id: 'demo2', name: 'Arjuna NEET Mock Tests' }
        ];
        setExams([...examRes.data.data, ...demoExams]);
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
      <h1 className="text-3xl font-extrabold text-secondary mb-2 tracking-wide font-heading">Test History</h1>
      <p className="text-gray-500 text-sm mb-8">Review your past performance</p>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-secondary placeholder-gray-400 shadow-sm"
            placeholder="Search by test name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative md:w-64">
          <select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-secondary cursor-pointer shadow-sm font-semibold"
          >
            <option value="" className="bg-white text-secondary">All Test Series</option>
            {exams.map((e) => (
              <option key={e.id} value={e.name} className="bg-white text-secondary">
                {e.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No tests found"
          description="Take your first exam to see it here"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-200 uppercase tracking-wider bg-gray-50">
                <th className="px-6 py-4 font-bold">Test Series</th>
                <th className="px-6 py-4 font-bold">Test Name</th>
                <th className="px-6 py-4 font-bold text-center">Score</th>
                <th className="px-6 py-4 font-bold text-center">Accuracy</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => {
                    if (a.id.startsWith('hist')) {
                      toast.error("This is demo history. Analysis not available.");
                      return;
                    }
                    navigate(`/student/result/${a.id}`);
                  }}
                  className="border-b border-gray-100 last:border-0 hover:bg-primary-light/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-5 text-gray-500 font-medium group-hover:text-primary transition-colors">
                    {a.topic?.subject?.exam?.name || "—"}
                  </td>
                  <td className="px-6 py-5 text-secondary font-bold text-base">{a.topic?.name}</td>
                  <td className="px-6 py-5 text-center font-bold text-primary text-base">
                    {a.score} <span className="text-xs text-gray-400">/{a.total_questions * 4 || 300}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-500 font-bold">{a.total_correct}</span>
                      <span className="text-gray-300">/</span>
                      <span className="text-red-500 font-bold">{a.total_wrong}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-500 font-medium">{formatDate(a.createdAt)}</td>
                  <td className="px-6 py-5 text-right">
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm opacity-90 ${
                        a.status === "completed"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : a.status === "abandoned"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
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