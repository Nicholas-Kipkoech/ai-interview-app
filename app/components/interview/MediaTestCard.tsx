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

export default function MediaTestCard({
  videoRef,
  recording,
  onStart,
  onStop,
  onNext,
}: {
  videoRef: RefObject<HTMLVideoElement>;
  recording: boolean;
  onStart: () => void;
  onStop: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <CardHeader>
        <CardTitle>Audio/Video Test</CardTitle>
      </CardHeader>
      <CardContent>
        <video
          ref={videoRef}
          className="w-full rounded border"
          autoPlay
          muted
        />
      </CardContent>
      <CardFooter className="flex gap-3">
        {!recording ? (
          <Button onClick={onStart}>Start Test</Button>
        ) : (
          <Button onClick={onStop} variant="destructive">
            Stop Test
          </Button>
        )}
        <Button onClick={onNext}>Proceed to Questions</Button>
      </CardFooter>
    </>
  );
}
