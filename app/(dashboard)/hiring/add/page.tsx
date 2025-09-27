"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Trash2, Upload, User, Bot } from "lucide-react";

// -------------------------
// Types
// -------------------------
type Question = {
  id: number;
  title: string;
  text: string;
  video?: File | null;
  videoId?: string | null; // <-- only store HeyGen video_id
  mode: "human" | "bot";
};

type Section = {
  text: string;
  video?: File | null;
  videoId?: string | null; // <-- same for intro/farewell
  mode: "human" | "bot";
};

// -------------------------
// VideoOrAI Component
// -------------------------
type VideoOrAIProps = {
  mode: "human" | "bot";
  video?: File | null;
  videoId?: string | null;
  onUpload: (file: File) => void;
  onToggle: (nextMode: "human" | "bot") => void;
};

function VideoOrAI({
  mode,
  video,
  videoId,
  onUpload,
  onToggle,
}: VideoOrAIProps) {
  return (
    <div className="relative w-[160px] h-[140px]">
      {mode === "human" && video ? (
        <video
          controls
          src={URL.createObjectURL(video)}
          className="w-full h-full rounded border object-cover"
        />
      ) : mode === "bot" && videoId ? (
        <div className="flex items-center justify-center w-full h-full border rounded bg-gray-50">
          <span className="text-xs text-green-600">AI Video ID saved</span>
        </div>
      ) : mode === "bot" ? (
        // Avatar placeholder
        <div className="flex items-center justify-center w-full h-full border rounded bg-gray-50">
          <img
            src="https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_target.webp"
            alt="Bot Avatar"
            className="w-full h-full object-cover rounded"
          />
        </div>
      ) : (
        // Human upload UI
        <label className="flex flex-col items-center justify-center w-full h-full border rounded text-gray-400 cursor-pointer">
          <Upload className="h-6 w-6 mb-1" />
          <span className="text-xs">Upload</span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files && onUpload(e.target.files[0])}
          />
        </label>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => onToggle(mode === "human" ? "bot" : "human")}
        className="absolute top-1 right-1 bg-white border rounded-full p-1 shadow"
      >
        {mode === "human" ? (
          <User className="h-4 w-4 text-gray-700" />
        ) : (
          <Bot className="h-4 w-4 text-gray-700" />
        )}
      </button>
    </div>
  );
}

// -------------------------
// API Function (generate video_id only)
// -------------------------
export const requestAIInterviewVideo = async (
  text: string
): Promise<string> => {
  const res = await fetch("/api/generate-video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to generate video");

  return data.video_id; // <-- only return video_id now
};

// -------------------------
// AddInterview Page
// -------------------------
export default function AddInterview() {
  const [positionTitle, setPositionTitle] = useState("");
  const [intro, setIntro] = useState<Section>({
    text: "",
    video: null,
    videoId: null,
    mode: "human",
  });
  const [farewell, setFarewell] = useState<Section>({
    text: "",
    video: null,
    videoId: null,
    mode: "human",
  });
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now(),
      title: "",
      text: "",
      video: null,
      videoId: null,
      mode: "human",
    },
  ]);

  const addQuestion = () =>
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        title: "",
        text: "",
        video: null,
        videoId: null,
        mode: "human",
      },
    ]);

  const removeQuestion = (id: number) =>
    setQuestions(questions.filter((q) => q.id !== id));

  const handleSave = async () => {
    // generate video_ids only for bot sections/questions
    const updatedIntro =
      intro.mode === "bot" && !intro.videoId
        ? { ...intro, videoId: await requestAIInterviewVideo(intro.text) }
        : intro;

    const updatedFarewell =
      farewell.mode === "bot" && !farewell.videoId
        ? { ...farewell, videoId: await requestAIInterviewVideo(farewell.text) }
        : farewell;

    const updatedQuestions = await Promise.all(
      questions.map(async (q) =>
        q.mode === "bot" && !q.videoId
          ? { ...q, videoId: await requestAIInterviewVideo(q.text) }
          : q
      )
    );

    const newInterview = {
      positionTitle,
      intro: updatedIntro,
      questions: updatedQuestions,
      farewell: updatedFarewell,
    };

    console.log("Interview Created:", newInterview);
    // TODO: Save to Supabase here
  };

  return (
    <div className="space-y-6">
      {/* Position Title */}
      <div className="mt-4">
        <label className="text-sm font-medium">Position Title</label>
        <Input
          placeholder="Enter position title"
          className="mt-1 max-w-sm"
          value={positionTitle}
          onChange={(e) => setPositionTitle(e.target.value)}
        />
      </div>

      <p className="font-semibold mb-2">Interview</p>

      {/* Intro Section */}
      <div className="border rounded p-4">
        <p className="font-semibold mb-2">Introduction</p>
        <div className="flex items-start gap-4">
          <VideoOrAI
            mode={intro.mode}
            video={intro.video || undefined}
            videoId={intro.videoId || undefined}
            onUpload={(file) =>
              setIntro({ ...intro, video: file, videoId: null })
            }
            onToggle={(nextMode) => setIntro({ ...intro, mode: nextMode })}
          />
          <Textarea
            placeholder="Introduction text..."
            value={intro.text}
            onChange={(e) => setIntro({ ...intro, text: e.target.value })}
            className="h-[140px] w-full resize-none"
          />
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, index) => (
        <div key={q.id} className="border rounded p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">Question {index + 1}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeQuestion(q.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <VideoOrAI
              mode={q.mode}
              video={q.video || undefined}
              videoId={q.videoId || undefined}
              onUpload={(file) =>
                setQuestions(
                  questions.map((qq) =>
                    qq.id === q.id ? { ...qq, video: file, videoId: null } : qq
                  )
                )
              }
              onToggle={(nextMode) =>
                setQuestions(
                  questions.map((qq) =>
                    qq.id === q.id ? { ...qq, mode: nextMode } : qq
                  )
                )
              }
            />

            <div className="space-y-2 w-full">
              <Input
                placeholder="Title"
                value={q.title}
                onChange={(e) =>
                  setQuestions(
                    questions.map((qq) =>
                      qq.id === q.id ? { ...qq, title: e.target.value } : qq
                    )
                  )
                }
                className="max-w-md"
              />
              <Textarea
                placeholder="Full question"
                value={q.text}
                onChange={(e) =>
                  setQuestions(
                    questions.map((qq) =>
                      qq.id === q.id ? { ...qq, text: e.target.value } : qq
                    )
                  )
                }
                className="h-[95px] w-full resize-none"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Farewell Section */}
      <div className="border rounded p-4">
        <p className="font-semibold mb-2">Farewell Message</p>
        <div className="flex items-start gap-4">
          <VideoOrAI
            mode={farewell.mode}
            video={farewell.video || undefined}
            videoId={farewell.videoId || undefined}
            onUpload={(file) =>
              setFarewell({ ...farewell, video: file, videoId: null })
            }
            onToggle={(nextMode) =>
              setFarewell({ ...farewell, mode: nextMode })
            }
          />
          <Textarea
            placeholder="Farewell message script"
            value={farewell.text}
            onChange={(e) => setFarewell({ ...farewell, text: e.target.value })}
            className="h-[140px] w-full resize-none"
          />
        </div>
      </div>

      {/* Add Question Button */}
      <div className="flex gap-3">
        <Button onClick={addQuestion}>+ Add Question</Button>
      </div>

      {/* Save */}
      <div className="pt-4">
        <Button onClick={handleSave}>Save Interview</Button>
      </div>
    </div>
  );
}
