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
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-dark-800 border border-white/5 rounded-2xl p-8 text-center">
        {status === "loading" && (
          <div className="py-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
            <p className="text-gray-400 mb-6">
              Your account is ready. You can now sign in.
            </p>
            <Link
              to="/student/login"
              className="inline-block bg-primary hover:bg-primary-hover px-6 py-3 rounded-lg font-semibold transition"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
            <p className="text-gray-400 mb-6">
              The link is invalid or has expired.
            </p>
            <Link
              to="/"
              className="inline-block bg-primary hover:bg-primary-hover px-6 py-3 rounded-lg font-semibold transition"
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
