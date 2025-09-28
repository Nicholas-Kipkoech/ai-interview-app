"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NextLink from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link as LinkIcon, Copy } from "lucide-react";
import { useInterviews } from "@/context/interviews-context";

export default function Home() {
  const router = useRouter();
  const { positions, loading } = useInterviews();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  if (loading) return <div>Loading positions...</div>;

  const filteredPositions =
    positions &&
    positions.filter((pos) =>
      pos.position_title.toLowerCase().includes(search.toLowerCase())
    );

  async function handleCopyLink(positionID: string) {
    const shareableLink = `${process.env.NEXT_PUBLIC_APP_URL}/interview/submit/${positionID}`;

    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopiedId(positionID);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }

  return (
    <div className="flex flex-col w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hiring</h1>
        <Input
          placeholder="Search positions..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Positions Table */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Positions</h2>
            <p className="text-sm text-gray-500">
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
              <tr className="border-b text-left text-gray-500 uppercase">
                <th className="py-2">Name</th>
                <th className="py-2">In Progress</th>
                <th className="py-2">Completed</th>
                <th className="py-2">Passed</th>
                <th className="py-2">Share Link</th>
              </tr>
            </thead>
            <tbody>
              {filteredPositions && filteredPositions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No positions found.
                  </td>
                </tr>
              ) : (
                filteredPositions &&
                filteredPositions.map((pos) => (
                  <tr key={pos.id} className="border-b last:border-0">
                    <td className="flex items-center gap-2 py-2">
                      <Image
                        src="https://github.com/shadcn.png"
                        alt="avatar"
                        width={52}
                        height={52}
                        className="rounded-full"
                      />
                      <NextLink
                        href={`/hiring/${pos.id}`}
                        className="truncate max-w-[200px]  hover:underline"
                      >
                        {pos.position_title}
                      </NextLink>
                    </td>
                    <td>{pos.in_progress ?? 0}</td>
                    <td>{pos.completed ?? 0}</td>
                    <td>{pos.passed ?? 0}</td>
                    <td>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 bg-gray-200"
                        onClick={() => handleCopyLink(pos.id)}
                      >
                        <LinkIcon className="h-4 w-4" />
                        {copiedId === pos.id ? "Copied!" : "Copy Link"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
