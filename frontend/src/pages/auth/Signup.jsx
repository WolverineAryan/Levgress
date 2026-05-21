import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import socket from "../../socket/socket";

// Engineering & Computer Science Icon Components
const CpuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <line x1="9" y1="1" x2="9" y2="4"></line>
    <line x1="15" y1="1" x2="15" y2="4"></line>
    <line x1="9" y1="20" x2="9" y2="23"></line>
    <line x1="15" y1="20" x2="15" y2="23"></line>
    <line x1="20" y1="9" x2="23" y2="9"></line>
    <line x1="20" y1="14" x2="23" y2="14"></line>
    <line x1="1" y1="9" x2="4" y2="9"></line>
    <line x1="1" y1="14" x2="4" y2="14"></line>
  </svg>
);

const DatabaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

const ServerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="8" rx="2" ry="2"></rect>
    <rect x="2" y="13" width="20" height="8" rx="2" ry="2"></rect>
    <line x1="6" y1="7" x2="6" y2="7"></line>
    <line x1="6" y1="17" x2="6" y2="17"></line>
  </svg>
);

const NetworkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2"></circle>
    <path d="M16.2 7.8a6 6 0 0 1 0 8.4"></path>
    <path d="M7.8 7.8a6 6 0 0 0 0 8.4"></path>
    <circle cx="18" cy="6" r="2"></circle>
    <circle cx="6" cy="6" r="2"></circle>
    <circle cx="18" cy="18" r="2"></circle>
    <circle cx="6" cy="18" r="2"></circle>
  </svg>
);

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const CloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
  </svg>
);

const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4a4 4 0 0 1 3.5 6.1A4 4 0 0 1 16 14a4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 .5-1.9A4 4 0 0 1 12 4z"></path>
    <path d="M12 8v8"></path>
    <path d="M8 12h8"></path>
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

const RobotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="16" r="1"></circle>
    <circle cx="8" cy="16" r="1"></circle>
    <circle cx="16" cy="16" r="1"></circle>
    <line x1="8" y1="11" x2="8" y2="7"></line>
    <line x1="16" y1="11" x2="16" y2="7"></line>
    <rect x="6" y="2" width="4" height="5" rx="1"></rect>
    <rect x="14" y="2" width="4" height="5" rx="1"></rect>
  </svg>
);

const AllIcons = [
  CpuIcon, DatabaseIcon, CodeIcon, ServerIcon, NetworkIcon, TerminalIcon, 
  ShieldIcon, CloudIcon, GearIcon, BrainIcon, RobotIcon
];

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    batch: "",
    department: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", form);
      const { token, role, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", user.id);

      socket.connect();
      socket.emit("join", user.id);

      if (role === "STUDENT") {
        navigate("/student");
      } else {
        navigate("/staff");
      }

    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FFF8F0] overflow-hidden">
      
      {/* Modern Animated Background with Engineering Icons */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#C08552]/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8C5A3C]/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[#4B2E2B]/5 rounded-full blur-3xl animate-pulse-slow" />
        
        {/* Floating Engineering Icons */}
        {[...Array(60)].map((_, i) => {
          const IconComponent = AllIcons[i % AllIcons.length];
          const size = 12 + Math.random() * 32;
          return (
            <div
              key={`icon-${i}`}
              className="absolute animate-float-gentle text-[#C08552]"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${10 + Math.random() * 25}s`,
                animationDelay: `${Math.random() * 8}s`,
                opacity: 0.08 + Math.random() * 0.2,
              }}
            >
              <div style={{ width: size, height: size }}>
                <IconComponent />
              </div>
            </div>
          );
        })}

        {/* Floating Dots */}
        {[...Array(80)].map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute animate-pulse-subtle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 6}s`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          >
            <div
              className={`bg-[${["#C08552", "#8C5A3C", "#4B2E2B"][Math.floor(Math.random() * 3)]}]/${10 + Math.floor(Math.random() * 25)} rounded-full`}
              style={{
                width: `${1 + Math.random() * 5}px`,
                height: `${1 + Math.random() * 5}px`,
              }}
            />
          </div>
        ))}

        {/* Binary floating numbers */}
        {[...Array(40)].map((_, i) => (
          <div
            key={`binary-${i}`}
            className="absolute animate-float-gentle text-[#C08552] font-mono text-xs"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${10 + Math.random() * 20}s`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.05 + Math.random() * 0.1,
            }}
          >
            {Math.random() > 0.5 ? "1" : "0"}
          </div>
        ))}
      </div>

      {/* Modern Signup Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-[#C08552]/20 animate-slide-up">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#C08552] to-[#8C5A3C] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-[#C08552] to-[#4B2E2B] rounded-xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-105 duration-300">
              <svg width="32" height="32" viewBox="0 0 100 100" className="relative">
                <path d="M25 25 L25 75 L75 75" stroke="#FFF8F0" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M55 35 L75 50 L55 65" stroke="#C08552" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#4B2E2B] mb-2 tracking-tight">
            Create Account
          </h1>
          <p className="text-[#8C5A3C] text-sm">
            Join Levgress and start your journey
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border-l-4 border-red-500 text-red-700 text-sm animate-shake">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            icon="👤"
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            icon="📧"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            icon="🔒"
          />

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#4B2E2B] mb-2">
              Select Role
            </label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="STUDENT"
                  checked={form.role === "STUDENT"}
                  onChange={handleChange}
                  className="hidden peer"
                />
                <div className="p-3 rounded-xl border border-[#C08552]/30 bg-white/50 text-center transition-all peer-checked:border-[#C08552] peer-checked:bg-[#C08552]/10 peer-checked:shadow-md">
                  <span className="text-2xl block mb-1">🎓</span>
                  <span className={`text-sm font-medium ${form.role === "STUDENT" ? "text-[#C08552]" : "text-[#4B2E2B]"}`}>
                    Student
                  </span>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="STAFF"
                  checked={form.role === "STAFF"}
                  onChange={handleChange}
                  className="hidden peer"
                />
                <div className="p-3 rounded-xl border border-[#C08552]/30 bg-white/50 text-center transition-all peer-checked:border-[#C08552] peer-checked:bg-[#C08552]/10 peer-checked:shadow-md">
                  <span className="text-2xl block mb-1">👨‍🏫</span>
                  <span className={`text-sm font-medium ${form.role === "STAFF" ? "text-[#C08552]" : "text-[#4B2E2B]"}`}>
                    Staff
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Student-specific fields */}
          {form.role === "STUDENT" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Batch"
                  name="batch"
                  type="text"
                  value={form.batch}
                  onChange={handleChange}
                  placeholder="2024"
                  icon="📅"
                />
                <Input
                  label="Department"
                  name="department"
                  type="text"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="Computer Science"
                  icon="🏛️"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative w-full py-3 rounded-xl bg-gradient-to-r from-[#C08552] to-[#8C5A3C] hover:from-[#8C5A3C] hover:to-[#4B2E2B] text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 shadow-lg overflow-hidden group mt-6"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#8C5A3C]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#C08552] hover:text-[#4B2E2B] transition-colors hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#C08552]/10">
          <p className="text-xs text-[#8C5A3C]/50 text-center">
            © {new Date().getFullYear()} Levgress. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -30px); }
          66% { transform: translate(-20px, 20px); }
        }
        
        @keyframes float-gentle {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.08; }
          50% { transform: translate(15px, -15px) rotate(10deg); opacity: 0.25; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
        
        .animate-float-gentle {
          animation: float-gentle 15s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 4s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Improved Reusable Input Component
function Input({ label, name, type = "text", value, onChange, placeholder, icon }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#4B2E2B] mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C5A3C] text-lg">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          required
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-[#C08552]/30 bg-white/50 px-4 py-3 text-[#4B2E2B] placeholder:text-[#8C5A3C]/50 outline-none transition-all focus:border-[#C08552] focus:ring-2 focus:ring-[#C08552]/20 focus:bg-white ${icon ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  );
}