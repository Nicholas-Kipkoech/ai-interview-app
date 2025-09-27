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
  videoUrl?: string | null;
  mode: "human" | "bot";
};

type Section = {
  text: string;
  video?: File | null;
  videoUrl?: string | null;
  mode: "human" | "bot";
};

// -------------------------
// VideoOrAI Component
// -------------------------
type VideoOrAIProps = {
  mode: "human" | "bot";
  video?: File | null;
  videoUrl?: string | null;
  onUpload: (file: File) => void;
  onGenerateAI: () => void;
  onToggle: (nextMode: "human" | "bot") => void;
};

function VideoOrAI({
  mode,
  video,
  videoUrl,
  onUpload,
  onGenerateAI,
  onToggle,
}: VideoOrAIProps) {
  const handleToggle = async () => {
    const nextMode = mode === "human" ? "bot" : "human";
    onToggle(nextMode);

    // Generate only if switching to bot AND no AI video yet
    if (nextMode === "bot" && !videoUrl) {
      await onGenerateAI();
    }
  };

  return (
    <div className="relative w-[160px] h-[140px]">
      {/* Video / Upload */}
      {mode === "human" && video ? (
        <video
          controls
          src={URL.createObjectURL(video)}
          className="w-full h-full rounded border object-cover"
        />
      ) : mode === "bot" && videoUrl ? (
        <video
          controls
          src={videoUrl}
          className="w-full h-full rounded border object-cover"
        />
      ) : (
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

      {/* Toggle button at top-right */}
      <button
        type="button"
        onClick={handleToggle}
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
// Mock HeyGen API
// -------------------------
const generateAIInterviewVideo = async (text: string): Promise<string> => {
  // Replace with real HeyGen API call
  return Promise.resolve("https://samplelib.com/lib/preview/mp4/sample-5s.mp4");
};

// -------------------------
// AddInterview Page
// -------------------------
export default function AddInterview() {
  const [positionTitle, setPositionTitle] = useState("");
  const [intro, setIntro] = useState<Section>({
    text: "",
    video: null,
    videoUrl: null,
    mode: "human",
  });
  const [farewell, setFarewell] = useState<Section>({
    text: "",
    video: null,
    videoUrl: null,
    mode: "human",
  });
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now(),
      title: "",
      text: "",
      video: null,
      videoUrl: null,
      mode: "human",
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        title: "",
        text: "",
        video: null,
        videoUrl: null,
        mode: "human",
      },
    ]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSave = () => {
    const newInterview = { positionTitle, intro, questions, farewell };
    console.log("Interview Created:", newInterview);
    // TODO: API call
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
        <div className="flex items-start gap-4 w-full h-full">
          <VideoOrAI
            mode={intro.mode}
            video={intro.video || undefined}
            videoUrl={intro.videoUrl || undefined}
            onUpload={(file) =>
              setIntro({ ...intro, video: file, videoUrl: null })
            }
            onGenerateAI={async () => {
              const url = await generateAIInterviewVideo(intro.text);
              setIntro({ ...intro, videoUrl: url, video: null });
            }}
            onToggle={(nextMode) =>
              setIntro({
                ...intro,
                mode: nextMode,
              })
            }
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
              videoUrl={q.videoUrl || undefined}
              onUpload={(file) =>
                setQuestions(
                  questions.map((qq) =>
                    qq.id === q.id ? { ...qq, video: file, videoUrl: null } : qq
                  )
                )
              }
              onGenerateAI={async () => {
                const url = await generateAIInterviewVideo(q.text);
                setQuestions(
                  questions.map((qq) =>
                    qq.id === q.id ? { ...qq, videoUrl: url, video: null } : qq
                  )
                );
              }}
              onToggle={(nextMode) =>
                setQuestions(
                  questions.map((qq) =>
                    qq.id === q.id
                      ? {
                          ...qq,
                          mode: nextMode,
                        }
                      : qq
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
        <div className="flex items-start gap-4 w-full">
          <VideoOrAI
            mode={farewell.mode}
            video={farewell.video || undefined}
            videoUrl={farewell.videoUrl || undefined}
            onUpload={(file) =>
              setFarewell({ ...farewell, video: file, videoUrl: null })
            }
            onGenerateAI={async () => {
              const url = await generateAIInterviewVideo(farewell.text);
              setFarewell({ ...farewell, videoUrl: url, video: null });
            }}
            onToggle={(nextMode) =>
              setFarewell({
                ...farewell,
                mode: nextMode,
              })
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
