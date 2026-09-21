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
    <div className="relative z-10">
      <h1 className="text-3xl font-extrabold mb-2 tracking-wide text-gray-900">Progress Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Track your performance over time and analyze weak areas</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Activity} label="Total Attempts" value={stats.total} />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={`${stats.avgScore}%`}
          color="text-blue-400"
          bg="bg-blue-400/20"
        />
        <StatCard
          icon={Award}
          label="Best Score"
          value={`${stats.bestScore}%`}
          color="text-green-400"
          bg="bg-green-400/20"
        />
        <StatCard
          icon={Target}
          label="Accuracy"
          value={`${stats.accuracy}%`}
          color="text-yellow-400"
          bg="bg-yellow-400/20"
        />
      </div>

      {attempts.length === 0 ? (
        <div className="surface-card p-16 text-center shadow-sm">
          <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-6 drop-shadow-md" />
          <p className="text-gray-900 text-lg font-medium mb-2">No completed tests yet.</p>
          <p className="text-gray-500 text-sm">Take your first exam to unlock powerful analytics and progress tracking.</p>
        </div>
      ) : (
        <>
          {/* Score Trend Line Chart */}
          <div className="surface-card p-8 mb-8 shadow-sm">
            <h2 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} /> Score Trend
            </h2>
            <div className="h-56 flex items-end gap-3 px-2">
              {trendData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <span className="absolute -top-8 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 px-2 py-1 rounded shadow-sm">
                    {d.pct}%
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-primary/20 via-primary/60 to-primary rounded-t-md transition-all duration-500 group-hover:shadow-sm"
                    style={{ height: `${(d.pct / maxTrend) * 180}px` }}
                  />
                  <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Subject bars */}
            <div className="surface-card p-8 shadow-sm">
              <h2 className="font-bold text-xl text-gray-900 mb-6">Subject Performance</h2>
              <div className="space-y-6">
                {subjectData.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-900 font-medium">{s.name}</span>
                      <span className="text-gray-500 font-bold bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                        {s.pct}% <span className="text-gray-500 font-normal ml-1">({s.count} tests)</span>
                      </span>
                    </div>
                    <div className="h-3 bg-background/50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{
                          width: `${s.pct}%`,
                          backgroundColor: s.pct >= 70 ? "#4ade80" : s.pct >= 40 ? "#facc15" : "#f87171",
                          color: s.pct >= 70 ? "#4ade80" : s.pct >= 40 ? "#facc15" : "#f87171",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic-wise table */}
            <div className="surface-card p-8 shadow-sm">
              <h2 className="font-bold text-xl text-gray-900 mb-6">Topic-wise Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-widest border-b border-gray-200">
                      <th className="pb-4 font-bold">Topic</th>
                      <th className="pb-4 font-bold">Subject</th>
                      <th className="pb-4 font-bold text-right">Score</th>
                      <th className="pb-4 font-bold text-right">Correct</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {attempts.slice(0, 10).map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-4 text-gray-900 font-medium group-hover:text-primary transition-colors">{a.topic?.name}</td>
                        <td className="py-4 text-gray-500">{a.topic?.subject?.name}</td>
                        <td className="py-4 text-right font-bold text-primary">
                          {a.score}/{a.total_questions}
                        </td>
                        <td className="py-4 text-right font-bold text-green-400 drop-shadow-sm">{a.total_correct}</td>
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