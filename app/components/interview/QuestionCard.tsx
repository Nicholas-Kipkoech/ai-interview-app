"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuestionCard({
  index,
  text,
  videoUrl,
  onNext,
}: {
  index: number;
  text: string;
  videoUrl?: string | null;
  onNext: () => void;
}) {
  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle>Question {index + 1}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{text}</p>
        {videoUrl && (
          <video controls src={videoUrl} className="w-full rounded" />
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onNext}>Answer Question</Button>
      </CardFooter>
    </Card>
  );
}
