"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-6 bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">
        Oops! The page you are looking for does not exist.
      </p>
      <Button
        onClick={() => router.push("/")}
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        Go Home
      </Button>
    </div>
  );
}
