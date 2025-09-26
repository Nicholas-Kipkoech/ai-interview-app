"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ViewIcon } from "lucide-react";

type Applicant = {
  id: number;
  name: string;
  email: string;
  started: string;
  ended: string;
  progress: "In Process" | "Completed";
  status: "Not Scored" | "Pass" | "Fail" | null;
};

export default function Analytics() {
  const stats = [
    { label: "Passed Apps", value: 29 },
    { label: "In Progress Apps", value: 12 },
    { label: "Completed Apps", value: 41 },
  ];

  const [search, setSearch] = useState("");

  const applicants: Applicant[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      started: "2024-11-01",
      ended: "2024-11-03",
      progress: "In Process",
      status: "Not Scored",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      started: "2024-11-05",
      ended: "2024-11-06",
      progress: "Completed",
      status: "Fail",
    },
    {
      id: 3,
      name: "Michael Johnson",
      email: "michael@example.com",
      started: "2024-11-02",
      ended: "2024-11-04",
      progress: "In Process",
      status: null,
    },
  ];

  const filteredApplicants = applicants.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      {/* Stats Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Analytics</h2>
        <div className="flex flex-wrap gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex-1 min-w-[200px] border rounded-lg p-6 text-center shadow-sm bg-white"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search + Table Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-[#E5E5E5] text-left text-lg">
              <tr>
                <th className="px-4 py-2">Applicant</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Started</th>
                <th className="px-4 py-2">Ended</th>
                <th className="px-4 py-2">Progress</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Application</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{a.name}</td>
                  <td className="px-4 py-2">{a.email}</td>
                  <td className="px-4 py-2">{a.started}</td>
                  <td className="px-4 py-2">{a.ended}</td>
                  <td className="px-4 py-2">{a.progress}</td>
                  <td className="px-4 py-2">{a.status ? a.status : "Null"}</td>
                  <td className="px-4 py-2">
                    <Button variant="outline" size="sm">
                      <ViewIcon />
                      View Application
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredApplicants.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
