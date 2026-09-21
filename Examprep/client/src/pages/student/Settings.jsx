import { useState, useEffect } from "react";
import {
  User,
  Activity,
  MessageSquare,
  Shield,
  Loader2,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import { attemptService } from "../../services/attemptService";
import { annotationService } from "../../services/annotationService";
import toast from "react-hot-toast";

const tabs = [
  { id: "profile", label: "Profile Settings", icon: User },
  { id: "behaviour", label: "Behaviour Analysis", icon: Activity },
  { id: "feedback", label: "Teacher Feedback", icon: MessageSquare },
];

const typeStyles = {
  tip: { label: "💡 Tip", cls: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
  strength: { label: "💪 Strength", cls: "bg-green-400/10 text-green-400 border-green-400/20" },
  weakness: { label: "⚠️ Weakness", cls: "bg-red-400/10 text-red-400 border-red-400/20" },
};

const Settings = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const [violations, setViolations] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    if (tab === "behaviour" && violations.length === 0) {
      setLoadingAnalytics(true);
      attemptService
        .getMyBehaviour()
        .then((res) => setViolations(res.data.data))
        .catch(() => toast.error("Failed to load behaviour data"))
        .finally(() => setLoadingAnalytics(false));
    }
    if (tab === "feedback" && annotations.length === 0) {
      setLoadingAnalytics(true);
      annotationService
        .getMy()
        .then((res) => setAnnotations(res.data.data))
        .catch(() => toast.error("Failed to load feedback"))
        .finally(() => setLoadingAnalytics(false));
    }
  }, [tab]);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authService.updateProfile(profile);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setSavingPass(true);
    try {
      await authService.changePassword(passwords);
      toast.success("Password changed");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setSavingPass(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  const totalViolations = violations.reduce((a, v) => a + v.violations, 0);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Settings & Analytics</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition border ${
              tab === t.id
                ? "bg-primary/10 border-primary text-primary"
                : "border-gray-200 text-gray-500 hover:text-gray-900"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-gray-100 rounded-xl p-6">
            <h2 className="font-semibold mb-1">Profile Information</h2>
            <p className="text-xs text-gray-500 mb-5">Update your name and email</p>
            <form onSubmit={handleProfile} className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Name</label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Email</label>
                <input
                  type="email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 px-5 py-2.5 rounded-lg text-sm font-medium transition"
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="bg-surface border border-gray-100 rounded-xl p-6">
            <h2 className="font-semibold mb-1">Change Password</h2>
            <p className="text-xs text-gray-500 mb-5">Update your account password</p>
            <form onSubmit={handlePassword} className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Current Password</label>
                <input
                  type="password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">New Password</label>
                <input
                  type="password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={savingPass}
                className="bg-accent hover:bg-accent/80 disabled:opacity-50 px-5 py-2.5 rounded-lg text-sm font-medium transition"
              >
                {savingPass ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Behaviour Tab */}
      {tab === "behaviour" && (
        <div className="bg-surface border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="text-yellow-400" size={20} />
            <h2 className="font-semibold">Proctoring Behaviour</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{totalViolations}</p>
              <p className="text-xs text-gray-500">Total Violations</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{violations.length}</p>
              <p className="text-xs text-gray-500">Tests with Flag</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {violations.length > 0
                  ? Math.max(0, Math.round((violations.filter((v) => v.violations < 3).length / violations.length) * 100))
                  : 100}
                %
              </p>
              <p className="text-xs text-gray-500">Completed in Limits</p>
            </div>
          </div>

          {loadingAnalytics ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : violations.length === 0 ? (
            <div className="text-center py-10">
              <Activity className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500">Great job! No behaviour violations recorded.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((v) => (
                <div key={v.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{v.topic?.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(v.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                        v.violations >= 3
                          ? "bg-red-400/10 text-red-400"
                          : v.violations >= 2
                          ? "bg-yellow-400/10 text-yellow-400"
                          : "bg-orange-400/10 text-orange-400"
                      }`}
                    >
                      <AlertTriangle size={11} /> {v.violations} violation{v.violations > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback Tab */}
      {tab === "feedback" && (
        <div className="bg-surface border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="text-primary" size={20} />
            <h2 className="font-semibold">Teacher Feedback</h2>
          </div>

          {loadingAnalytics ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : annotations.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No feedback received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {annotations.map((a) => (
                <div key={a.id} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full border ${typeStyles[a.type]?.cls}`}>
                      {typeStyles[a.type]?.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {a.admin?.name} · {formatDate(a.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{a.feedback}</p>
                  <p className="text-xs text-gray-500">
                    On: {a.attempt?.topic?.name} ({a.attempt?.topic?.subject?.exam?.name || ""})
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;