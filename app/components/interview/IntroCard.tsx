"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InterviewIntroCard({
  positionTitle,
  questionCount,
  onStart,
  thumbnailUrl,
}: {
  positionTitle: string;
  questionCount: number;
  onStart: () => void;
  thumbnailUrl: string;
}) {
  return (
    <CardContent className="p-0 flex">
      {/* Left side: Image / Video */}
      <div className="w-1/3 bg-gray-100">
        <img
          src={thumbnailUrl}
          alt="Interview thumbnail"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right side: Details */}
      <div className="w-2/3 p-4 flex flex-col justify-between">
        <div>
          <p className="text-sm text-blue-600 font-medium mb-1">Replay</p>
          <h2 className="text-lg font-semibold leading-tight">
            {positionTitle} AI video interview
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {questionCount} Questions
          </p>
        </div>

        <div className="mt-4">
          <Button className="w-full" onClick={onStart}>
            Start Interview
          </Button>
        </div>
      </div>
    </CardContent>
  );
}
