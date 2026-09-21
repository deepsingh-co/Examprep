import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { CheckCircle, XCircle } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const requestSent = useRef(false);

  const navigate = useNavigate();
  const { setAuthSession } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }
    
    if (requestSent.current) return;
    requestSent.current = true;

    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        const { token: jwtToken, user } = res.data.data;
        setAuthSession(jwtToken, user);
        
        setTimeout(() => {
          navigate(user.role === "admin" ? "/admin/exams" : "/student/exams");
        }, 2000);
      })
      .catch(() => setStatus("error"));
  }, [searchParams, navigate, setAuthSession]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-primary/20 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 text-center relative z-10 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
        {status === "loading" && (
          <div className="py-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-8 animate-float">
            <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">Email Verified!</h2>
            <p className="text-gray-400 mb-8">
              Your account is ready. You can now sign in.
            </p>
            <Link
              to="/student/login"
              className="inline-block bg-primary/90 hover:bg-primary px-8 py-3 rounded-xl font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all hover:-translate-y-1"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-8">
            <div className="w-20 h-20 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">Verification Failed</h2>
            <p className="text-gray-400 mb-8">
              The link is invalid or has expired.
            </p>
            <Link
              to="/"
              className="inline-block bg-primary/90 hover:bg-primary px-8 py-3 rounded-xl font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all hover:-translate-y-1"
            >
              Go Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
