import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import socket from "../../socket/socket";

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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

        <h1 className="text-2xl font-semibold mb-2">Create Account</h1>
        <p className="text-zinc-400 mb-6">
          Join Levgress
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
            >
              <option value="STUDENT">Student</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>

          {form.role === "STUDENT" && (
            <>
              <Input
                label="Batch"
                name="batch"
                value={form.batch}
                onChange={handleChange}
              />
              <Input
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-zinc-500 mt-6 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

/* Reusable Input Component */
function Input({ label, name, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        required
        onChange={onChange}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 outline-none focus:border-indigo-500"
      />
    </div>
  );
}
