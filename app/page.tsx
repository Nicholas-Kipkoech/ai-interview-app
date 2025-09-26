"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Link } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const positions = [
  {
    id: 1,
    name: "November 2024 Hiring Class",
    inProgress: 29,
    completed: 29,
    passed: 29,
  },
  {
    id: 2,
    name: "Hypernova Headphones",
    inProgress: 30,
    completed: 30,
    passed: 30,
  },
  {
    id: 3,
    name: "AeroGlow Desk Lamp",
    inProgress: 34,
    completed: 34,
    passed: 34,
  },
  {
    id: 4,
    name: "TechTonic Energy Drink",
    inProgress: 32,
    completed: 32,
    passed: 32,
  },
  {
    id: 5,
    name: "Gamer Gear Pro Controller",
    inProgress: 38,
    completed: 38,
    passed: 38,
  },
];

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-col w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hiring</h1>
        <div className="flex items-center gap-3">
          <Input placeholder="Search..." className="w-64" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold mb-2">Positions</h2>
            <p className="text-sm text-gray-500 mb-4">
              Manage your positions and monitor their performance
            </p>
          </div>

          <Button onClick={() => router.push("/hiring/add")}>
            Add Position
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2">Name</th>
                <th className="py-2">In Progress</th>
                <th className="py-2">Completed</th>
                <th className="py-2">Passed</th>
                <th className="py-2">Share Link</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr key={pos.id} className="border-b last:border-0">
                  <td className="flex items-center gap-2 py-2">
                    <Image
                      src="https://github.com/shadcn.png"
                      alt="user avatar"
                      width={52}
                      height={52}
                      className=""
                    />
                    <span className="truncate max-w-[200px]">{pos.name}</span>
                  </td>
                  <td>{pos.inProgress}</td>
                  <td>{pos.completed}</td>
                  <td>{pos.passed}</td>
                  <td>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 bg-[#E5E5E5]"
                    >
                      <Link className="h-4 w-4" />
                      Copy Share Link
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
