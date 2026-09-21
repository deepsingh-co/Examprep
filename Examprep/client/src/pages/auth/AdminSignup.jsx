import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const AdminSignup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, role: "admin" });
      toast.success("Account created! Please verify your email.");
      navigate("/admin/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-pink/20 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-md surface-card rounded-2xl p-8 relative z-10 border-t-accent-pink/50 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent-pink/20 border border-accent-pink/30 shadow-sm rounded-xl flex items-center justify-center font-bold text-accent-pink text-xl mx-auto mb-4 relative">
            E
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-wide">Admin Sign Up</h2>
          <p className="text-gray-500 text-sm mt-1">Create an admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Name</label>
            <input
              type="text"
              required
              className="w-full bg-background/50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-accent-pink focus:ring-1 focus:ring-accent-pink transition-all"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              required
              className="w-full bg-background/50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-accent-pink focus:ring-1 focus:ring-accent-pink transition-all"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                minLength={6}
                className="w-full bg-background/50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-accent-pink focus:ring-1 focus:ring-accent-pink transition-all pr-12"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-pink/90 hover:bg-accent-pink text-gray-900 py-3 rounded-xl font-bold shadow-sm transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 mt-2"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/admin/login" className="text-accent-pink hover:text-pink-400 font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;