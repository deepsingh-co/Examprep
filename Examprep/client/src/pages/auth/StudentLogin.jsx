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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan/20 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-md surface-card rounded-2xl p-8 relative z-10 border-t-primary/50 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/20 border border-primary/30 shadow-sm rounded-xl flex items-center justify-center font-bold text-primary text-xl mx-auto mb-4 relative">
            E
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-wide">Student Login</h2>
          <p className="text-gray-500 text-sm mt-1">Start learning smarter</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              required
              className="w-full bg-background/50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-gray-500"
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
                className="w-full bg-background/50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-12 placeholder-gray-500"
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
            className="w-full btn-primary font-bold shadow-sm transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? "Signing in..." : "Sign In with Email"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2">
          <span className="h-px bg-gray-100 w-full"></span>
          <span className="text-sm text-gray-500 font-medium uppercase">Or</span>
          <span className="h-px bg-gray-100 w-full"></span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-6 w-full bg-gray-50 border border-gray-200 text-gray-900 hover:bg-gray-100 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center hover:-translate-y-1"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
          Sign In with Google
        </button>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/student/signup" className="text-primary hover:text-primary-hover font-semibold transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;