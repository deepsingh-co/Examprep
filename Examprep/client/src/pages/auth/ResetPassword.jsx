import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../services/authService";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      return toast.error("Invalid or missing reset token");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword: password });
      toast.success("Password has been reset successfully. You can now login.");
      navigate("/student/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Link</h2>
          <p className="text-gray-600 mb-6">The password reset link is invalid or has expired.</p>
          <button onClick={() => navigate("/student/login")} className="btn-primary w-full py-3">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-transparent">
      {/* Background styling to match login */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/30 blur-[120px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/30 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md glass-panel rounded-3xl p-10 relative z-10 border-t-primary/30 shadow-premium animate-slide-up">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-heading">Set New Password</h2>
          <p className="text-gray-500 text-sm mt-2">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">New Password</label>
            <input
              type="password"
              required
              className="input-field placeholder-gray-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm Password</label>
            <input
              type="password"
              required
              className="input-field placeholder-gray-400"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-base font-semibold py-3.5 mt-2"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
