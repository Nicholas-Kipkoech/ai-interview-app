"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefObject } from "react";

export default function AnswerCard({
  index,
  videoRef,
  recording,
  currentAnswerVideo,
  savedAnswerVideo,
  onStart,
  onStop,
  onDone,
}: {
  index: number;
  videoRef: RefObject<HTMLVideoElement>;
  recording: boolean;
  currentAnswerVideo: File | null;
  savedAnswerVideo?: File | null;
  onStart: () => void;
  onStop: () => void;
  onDone: () => void;
}) {
  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle>Answer Question {index + 1}</CardTitle>
      </CardHeader>
      <CardContent>
        <video
          ref={videoRef}
          controls
          className="w-full rounded border"
          src={
            currentAnswerVideo
              ? URL.createObjectURL(currentAnswerVideo)
              : savedAnswerVideo
              ? URL.createObjectURL(savedAnswerVideo)
              : undefined
          }
        />
      </CardContent>
      <CardFooter className="flex gap-3">
        {!recording ? (
          <Button onClick={onStart}>Record</Button>
        ) : (
          <Button onClick={onStop} variant="destructive">
            Stop
          </Button>
        )}
        <Button onClick={onDone}>Done</Button>
      </CardFooter>
    </Card>
  );
}
