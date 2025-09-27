"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Link } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useInterviews } from "@/context/interviews-context"; // <-- use the context
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const { positions, loading } = useInterviews(); // get positions from context
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (loading) return <div>Loading positions...</div>;

  async function handleCopyLink(positionID: string) {
    const shareableLink = `${process.env.NEXT_PUBLIC_APP_URL}/interview/submit/${positionID}`;

    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopiedId(positionID);
      setTimeout(() => setCopiedId(null), 2000); // reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }

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
              {positions &&
                positions.map((pos) => (
                  <tr key={pos.id} className="border-b last:border-0">
                    <td className="flex items-center gap-2 py-2">
                      <Image
                        src="https://github.com/shadcn.png"
                        alt="user avatar"
                        width={52}
                        height={52}
                        className=""
                      />
                      <span className="truncate max-w-[200px]">
                        {pos.position_title}
                      </span>
                    </td>
                    <td>{pos.in_progress ?? 0}</td>
                    <td>{pos.completed ?? 0}</td>
                    <td>{pos.passed ?? 0}</td>
                    <td>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 bg-[#E5E5E5]"
                        onClick={() => handleCopyLink(pos.id)}
                      >
                        <Link className="h-4 w-4" />
                        {copiedId === pos.id
                          ? "Copied to clipboard"
                          : "Copy Share Link"}
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
