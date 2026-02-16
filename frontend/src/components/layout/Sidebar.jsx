import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const role = localStorage.getItem("role");

  const studentLinks = [
    { name: "Dashboard", path: "/student" },
    { name: "Skills", path: "/student/skills" },
    { name: "Projects", path: "/student/projects" },
    { name: "Badges", path: "/student/badges" }
  ];

  const staffLinks = [
  { name: "Dashboard", path: "/staff" },
  { name: "Project Review", path: "/staff/projects" },
  { name: "Analytics", path: "/staff/analytics" },
  { name: "Alerts", path: "/staff/alerts" }
];


  const links = role === "STAFF" ? staffLinks : studentLinks;

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-6">
      <nav className="space-y-3">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm transition ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
