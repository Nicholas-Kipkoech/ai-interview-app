"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FarewellCard({
  text,
  videoUrl,
  onSubmit,
  loading,
}: {
  text?: string;
  videoUrl?: string | null;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle>Farewell</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{text}</p>
        {videoUrl && (
          <video controls src={videoUrl} className="w-full rounded mt-4" />
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit Interview"}
        </Button>
      </CardFooter>
    </Card>
  );
}
