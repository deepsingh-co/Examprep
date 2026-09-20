import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  TrendingUp,
  Award,
  Target,
  BarChart3,
} from "lucide-react";
import { attemptService } from "../../services/attemptService";
import StatCard from "../../components/common/StatCard";
import toast from "react-hot-toast";

const Progress = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await attemptService.getMyAttempts();
        setAttempts(res.data.data.filter((a) => a.status === "completed"));
      } catch {
        toast.error("Failed to load progress");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const stats = useMemo(() => {
    if (attempts.length === 0) {
      return { total: 0, avgScore: 0, bestScore: 0, accuracy: 0 };
    }
    const scores = attempts.map((a) => (a.total_questions > 0 ? a.score / a.total_questions : 0));
    const avg = (scores.reduce((a, b) => a + b, 0) / scores.length) * 100;
    const best = Math.max(...scores) * 100;
    const totalCorrect = attempts.reduce((a, t) => a + t.total_correct, 0);
    const totalAnswered = attempts.reduce((a, t) => a + t.total_correct + t.total_wrong, 0);
    return {
      total: attempts.length,
      avgScore: Math.round(avg),
      bestScore: Math.round(best),
      accuracy: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
    };
  }, [attempts]);

  // Score trend data
  const trendData = useMemo(() => {
    return attempts
      .map((a) => ({
        date: new Date(a.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        pct: a.total_questions > 0 ? Math.round((a.score / a.total_questions) * 100) : 0,
      }))
      .reverse();
  }, [attempts]);

  // Subject-wise performance
  const subjectData = useMemo(() => {
    const map = {};
    attempts.forEach((a) => {
      const key = a.topic?.subject?.name || a.topic?.name || "Unknown";
      if (!map[key]) map[key] = { total: 0, correct: 0, count: 0 };
      map[key].total += a.total_questions;
      map[key].correct += a.total_correct;
      map[key].count += 1;
    });
    return Object.entries(map).map(([name, d]) => ({
      name,
      pct: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
      count: d.count,
    }));
  }, [attempts]);

  const maxTrend = Math.max(100, ...trendData.map((d) => d.pct));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Progress</h1>
      <p className="text-gray-400 text-sm mb-6">Track your performance over time</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Activity} label="Total Attempts" value={stats.total} />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={`${stats.avgScore}%`}
          color="text-blue-400"
          bg="bg-blue-400/10"
        />
        <StatCard
          icon={Award}
          label="Best Score"
          value={`${stats.bestScore}%`}
          color="text-green-400"
          bg="bg-green-400/10"
        />
        <StatCard
          icon={Target}
          label="Accuracy"
          value={`${stats.accuracy}%`}
          color="text-yellow-400"
          bg="bg-yellow-400/10"
        />
      </div>

      {attempts.length === 0 ? (
        <div className="bg-dark-800 border border-white/5 rounded-xl p-12 text-center">
          <BarChart3 className="w-10 h-10 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No completed tests yet. Take your first exam to see progress.</p>
        </div>
      ) : (
        <>
          {/* Score Trend Line Chart */}
          <div className="bg-dark-800 border border-white/5 rounded-xl p-6 mb-6">
            <h2 className="font-semibold mb-4">Score Trend</h2>
            <div className="h-48 flex items-end gap-2">
              {trendData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition">
                    {d.pct}%
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-primary/40 to-primary rounded-t transition-all"
                    style={{ height: `${(d.pct / maxTrend) * 150}px` }}
                  />
                  <span className="text-[10px] text-gray-500">{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject bars */}
            <div className="bg-dark-800 border border-white/5 rounded-xl p-6">
              <h2 className="font-semibold mb-4">Subject Performance</h2>
              <div className="space-y-4">
                {subjectData.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-300">{s.name}</span>
                      <span className="text-gray-500">
                        {s.pct}% ({s.count} tests)
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${s.pct}%`,
                          backgroundColor: s.pct >= 70 ? "#10b981" : s.pct >= 40 ? "#f59e0b" : "#e94560",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic-wise table */}
            <div className="bg-dark-800 border border-white/5 rounded-xl p-6">
              <h2 className="font-semibold mb-4">Topic-wise Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-white/5">
                      <th className="pb-2 font-medium">Topic</th>
                      <th className="pb-2 font-medium">Subject</th>
                      <th className="pb-2 font-medium text-right">Score</th>
                      <th className="pb-2 font-medium text-right">Correct</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.slice(0, 10).map((a) => (
                      <tr key={a.id} className="border-b border-white/5 last:border-0">
                        <td className="py-2.5 text-gray-300">{a.topic?.name}</td>
                        <td className="py-2.5 text-gray-500">{a.topic?.subject?.name}</td>
                        <td className="py-2.5 text-right font-medium text-primary">
                          {a.score}/{a.total_questions}
                        </td>
                        <td className="py-2.5 text-right text-green-400">{a.total_correct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Progress;