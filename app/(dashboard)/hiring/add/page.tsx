"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Trash2, Upload, Bot } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Question = {
  id: number;
  title: string;
  text: string;
  video?: File | null;
  botVoice?: boolean;
};

type Section = {
  video?: File | null;
  botVoice?: boolean;
  text: string;
};

type VideoOrBotProps = {
  video?: File | null;
  botVoice?: boolean;
  onUpload: (file: File) => void;
  onToggleBot: () => void;
};

function VideoOrBot({
  video,
  botVoice,
  onUpload,
  onToggleBot,
}: VideoOrBotProps) {
  return (
    <div className="w-[140px] relative">
      {/* Upload or Video */}
      {!botVoice && !video && (
        <label className="flex flex-col items-center justify-center border rounded p-4 text-gray-500 cursor-pointer h-[140px]">
          <Upload className="h-6 w-6 mb-1" />
          <span className="text-xs">Upload Video</span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files && onUpload(e.target.files[0])}
          />
        </label>
      )}
      {video && (
        <video
          controls
          src={URL.createObjectURL(video)}
          className="rounded border w-[140px] h-[140px] object-cover"
        />
      )}

      {/* Bot button overlay */}
      <Button
        type="button"
        variant={botVoice ? "default" : "outline"}
        size="icon"
        className="absolute top-1 right-1 h-7 w-7 p-0"
        onClick={onToggleBot}
      >
        <Bot className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function AddInterview() {
  const [positionTitle, setPositionTitle] = useState("");
  const [intro, setIntro] = useState<Section>({
    text: "",
    video: null,
    botVoice: false,
  });
  const [farewell, setFarewell] = useState<Section>({
    text: "",
    video: null,
    botVoice: false,
  });
  const [questions, setQuestions] = useState<Question[]>([
    { id: Date.now(), title: "", text: "", video: null, botVoice: false },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now(), title: "", text: "", video: null, botVoice: false },
    ]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSave = () => {
    const newInterview = { positionTitle, intro, questions, farewell };
    console.log("Interview Created:", newInterview);
    // Hook into API call here
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
          <VideoOrBot
            video={intro.video || undefined}
            botVoice={intro.botVoice}
            onUpload={(file) =>
              setIntro({ ...intro, video: file, botVoice: false })
            }
            onToggleBot={() =>
              setIntro({ ...intro, botVoice: !intro.botVoice, video: null })
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
            <VideoOrBot
              video={q.video || undefined}
              botVoice={q.botVoice}
              onUpload={(file) =>
                setQuestions(
                  questions.map((qq) =>
                    qq.id === q.id
                      ? { ...qq, video: file, botVoice: false }
                      : qq
                  )
                )
              }
              onToggleBot={() =>
                setQuestions(
                  questions.map((qq) =>
                    qq.id === q.id
                      ? { ...qq, botVoice: !qq.botVoice, video: null }
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
        <div className="flex items-start gap-4 w-full ">
          <VideoOrBot
            video={farewell.video || undefined}
            botVoice={farewell.botVoice}
            onUpload={(file) =>
              setFarewell({ ...farewell, video: file, botVoice: false })
            }
            onToggleBot={() =>
              setFarewell({
                ...farewell,
                botVoice: !farewell.botVoice,
                video: null,
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

      {/* Add buttons */}
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
