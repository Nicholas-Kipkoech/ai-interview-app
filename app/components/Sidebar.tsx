"use client";

import Link from "next/link";
import { useState } from "react";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white transform transition-transform duration-200 z-50 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:static md:translate-x-0`}
      >
        <div className="p-4 text-xl font-bold border-b border-gray-700 flex justify-between items-center">
          AI Interview
          {/* Close button (mobile only) */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarMenu label="Dashboard" href="/" />
          <SidebarMenu
            label="Interviews"
            subItems={[
              { label: "My Interviews", href: "/interviews" },
              { label: "Schedule", href: "/interviews/schedule" },
            ]}
          />
          <SidebarMenu
            label="Settings"
            subItems={[
              { label: "Profile", href: "/settings/profile" },
              { label: "Preferences", href: "/settings/preferences" },
            ]}
          />
        </nav>
      </aside>

      {/* Top bar (mobile only) */}
      <header className="bg-white shadow p-4 flex items-center md:hidden">
        <button className="text-2xl" onClick={() => setSidebarOpen(true)}>
          ☰
        </button>
        <h1 className="ml-4 font-bold text-lg">AI Interview</h1>
      </header>
    </>
  );
}

function SidebarMenu({
  label,
  href,
  subItems,
}: {
  label: string;
  href?: string;
  subItems?: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  if (!subItems) {
    return (
      <Link
        href={href || "#"}
        className="block px-3 py-2 rounded hover:bg-gray-800"
      >
        {label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 flex justify-between items-center"
      >
        <span>{label}</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-1">
          {subItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded hover:bg-gray-700 text-sm"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
