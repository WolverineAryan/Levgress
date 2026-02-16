import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-white">
        Levgress
      </h1>

      <button
        onClick={logout}
        className="text-sm bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-lg text-white"
      >
        Logout
      </button>
    </div>
  );
}