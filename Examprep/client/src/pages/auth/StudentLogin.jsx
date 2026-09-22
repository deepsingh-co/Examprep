import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { auth } from "../../config/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const StudentLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { firebaseLogin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin/exams" : "/student/exams");
    }
  }, [user, navigate]);

  const handleFirebaseLogin = async (firebaseUser, role) => {
    const token = await firebaseUser.getIdToken();
    await firebaseLogin({ token, role });
    toast.success("Welcome back!");
    navigate("/student/exams");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ ...form, role: "student" });
      toast.success("Welcome back!");
      navigate("/student/exams");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await handleFirebaseLogin(userCredential.user, "student");
    } catch (err) {
      toast.error(err.message || "Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-transparent">
      {/* Advanced Animated Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/30 blur-[120px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/30 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md glass-panel rounded-3xl p-10 relative z-10 border-t-primary/30 shadow-premium animate-slide-up">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary shadow-glow rounded-2xl flex items-center justify-center font-bold text-white text-3xl mx-auto mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10">E</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-heading">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-2">Sign in to continue your learning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email Address</label>
            <input
              type="email"
              required
              className="input-field placeholder-gray-400"
              placeholder="you@university.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                className="input-field pr-12 placeholder-gray-400"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-base font-semibold py-3.5 mt-2"
          >
            {loading ? "Signing in..." : "Sign In with Email"}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center space-x-4">
          <span className="h-px bg-gray-200 w-full"></span>
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Or continue with</span>
          <span className="h-px bg-gray-200 w-full"></span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-8 w-full bg-white/80 border border-gray-200/80 text-gray-700 hover:bg-white hover:border-gray-300 py-3.5 rounded-xl font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center group active:scale-[0.98]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
          Sign In with Google
        </button>

        <p className="text-center text-gray-500 text-sm mt-8">
          Don't have an account?{" "}
          <Link to="/student/signup" className="text-primary hover:text-primary-hover font-semibold transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;