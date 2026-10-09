import { useState, useEffect } from "react";
import { Check, X, Loader2, Mail, GraduationCap, ShieldCheck, User as UserIcon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import api from "../../services/api";
import toast from "react-hot-toast";

const checklist = [
  { key: "name", label: "Full Name" },
  { key: "email", label: "Email Address" },
  { key: "university_id", label: "University" },
  { key: "college_id", label: "College" },
  { key: "department_id", label: "Department" },
  { key: "semester_id", label: "Semester" },
];

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    university_id: user?.university_id || "",
    college_id: user?.college_id || "",
    department_id: user?.department_id || "",
    semester_id: user?.semester_id || "",
  });
  const [universities, setUniversities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [saving, setSaving] = useState(false);

  const completed = checklist.filter((f) => profile[f.key]).length;
  const pct = Math.round((completed / checklist.length) * 100);
  const isComplete = pct === 100;

  useEffect(() => {
    api.get("/universities").then((res) => setUniversities(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (profile.university_id) {
      api.get(`/colleges?university_id=${profile.university_id}`).then((res) => setColleges(res.data.data)).catch(() => {});
    } else setColleges([]);
  }, [profile.university_id]);

  useEffect(() => {
    if (profile.college_id) {
      api.get(`/departments?college_id=${profile.college_id}`).then((res) => setDepartments(res.data.data)).catch(() => {});
    } else setDepartments([]);
  }, [profile.college_id]);

  useEffect(() => {
    if (profile.department_id) {
      api.get(`/semesters?department_id=${profile.department_id}`).then((res) => setSemesters(res.data.data)).catch(() => {});
    } else setSemesters([]);
  }, [profile.department_id]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const res = await authService.updateProfile(profile);
      const updatedUser = { ...user, ...res.data.data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success(isComplete ? "Profile completed!" : "Profile saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (pct / 100) * circumference;

  const selectCls =
    "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition appearance-none disabled:opacity-40";
  const labelCls = "text-sm font-semibold text-gray-600 mb-1.5 block";

  return (
    <div className="max-w-5xl pb-10">
      <h1 className="text-2xl font-bold mb-1">My Profile</h1>
      <p className="text-gray-500 text-sm mb-8">
        {isComplete
          ? "Your profile is complete. You can update your details below."
          : "Complete your profile to unlock enrolled subjects, rankings and a personalised dashboard."}
      </p>

      {/* Completion summary */}
      <div className="surface-card p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={isComplete ? "#22c55e" : "#F52B2B"}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-gray-900">{pct}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Complete</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center text-xl font-extrabold shadow-sm">
              {profile.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.name || "Set your name"}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1 justify-center sm:justify-start">
                <Mail size={13} /> {profile.email}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {checklist.map((f) => {
              const done = !!profile[f.key];
              return (
                <div
                  key={f.key}
                  className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border ${
                    done
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  {done ? <Check size={13} className="flex-shrink-0" /> : <X size={13} className="flex-shrink-0" />}
                  <span className="truncate">{f.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center gap-1 px-5 border-l border-gray-100">
          <ShieldCheck size={26} className={isComplete ? "text-green-500" : "text-orange-400"} />
          <span className="text-xs font-bold text-gray-700 text-center">
            {isComplete ? "Profile Verified" : `${checklist.length - completed} field${checklist.length - completed > 1 ? "s" : ""} pending`}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="surface-card p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 flex items-center gap-2 mb-1">
          <UserIcon size={18} className="text-primary" />
          <h2 className="font-semibold">Basic Information</h2>
        </div>

        <div>
          <label className={labelCls}>Full Name</label>
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input
            type="email"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-2 mt-2 mb-1">
          <GraduationCap size={18} className="text-primary" />
          <h2 className="font-semibold">Academic Details</h2>
        </div>

        <div>
          <label className={labelCls}>University</label>
          <select
            className={selectCls}
            value={profile.university_id || ""}
            onChange={(e) => setProfile({ ...profile, university_id: e.target.value, college_id: "", department_id: "", semester_id: "" })}
          >
            <option value="">Select University</option>
            {universities.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>College</label>
          <select
            className={selectCls}
            value={profile.college_id || ""}
            onChange={(e) => setProfile({ ...profile, college_id: e.target.value, department_id: "", semester_id: "" })}
            disabled={!profile.university_id}
          >
            <option value="">{profile.university_id ? "Select College" : "Select university first"}</option>
            {colleges.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Department</label>
          <select
            className={selectCls}
            value={profile.department_id || ""}
            onChange={(e) => setProfile({ ...profile, department_id: e.target.value, semester_id: "" })}
            disabled={!profile.college_id}
          >
            <option value="">{profile.college_id ? "Select Department" : "Select college first"}</option>
            {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Semester</label>
          <select
            className={selectCls}
            value={profile.semester_id || ""}
            onChange={(e) => setProfile({ ...profile, semester_id: e.target.value })}
            disabled={!profile.department_id}
          >
            <option value="">{profile.department_id ? "Select Semester" : "Select department first"}</option>
            {semesters.map((s) => <option key={s._id} value={s._id}>Semester {s.number}</option>)}
          </select>
        </div>

        <div className="md:col-span-2 flex items-center justify-between gap-4 mt-3 flex-wrap">
          <p className="text-xs text-gray-500">
            {isComplete ? "All fields filled. Your dashboard subjects are unlocked." : `Complete ${checklist.length - completed} more field${checklist.length - completed > 1 ? "s" : ""} to finish your profile.`}
          </p>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold px-7 py-3 rounded-xl text-sm transition-all shadow-sm hover:-translate-y-0.5 flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? "Saving..." : isComplete ? "Save Changes" : "Complete Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
