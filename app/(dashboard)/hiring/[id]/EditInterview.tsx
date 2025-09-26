"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Trash2, Upload } from "lucide-react";
import Image from "next/image";

type Question = {
  id: number;
  title: string;
  text: string;
  img?: string;
};

export default function EditInterview() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      title: "Motivation",
      text: "It is very important to us that the person that fills this position is excited about working here. Why do you think ABC Company would be a good fit for you?",
      img: "/placeholder.png",
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now(), title: "", text: "", img: "" },
    ]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Position Title */}
      <div className="mt-4">
        <label className="text-sm font-medium">Position Title</label>
        <Input defaultValue="November 2024 Hiring Class" className="mt-1" />
      </div>

      <p className="font-semibold mb-2">Interview</p>

      {/* Intro */}
      <div className="border rounded p-4">
        <p className="font-semibold mb-2">Introduction</p>
        <div className="flex items-start gap-4">
          <Image
            src="/placeholder.png"
            alt="intro"
            width={60}
            height={60}
            className="rounded border"
          />
          <Input placeholder="Introduction text..." />
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
            {q.img ? (
              <Image
                src={q.img}
                alt={q.title || "question"}
                width={60}
                height={60}
                className="rounded border"
              />
            ) : (
              <div className="w-[60px] h-[60px] flex items-center justify-center border rounded text-gray-400">
                <Upload className="h-5 w-5" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <Input placeholder="Title" defaultValue={q.title} />
              <Input placeholder="Full question" defaultValue={q.text} />
            </div>
          </div>
        </div>
      ))}

      {/* Farewell */}
      <div className="border rounded p-4">
        <p className="font-semibold mb-2">Farewell Message</p>
        <div className="flex items-start gap-4">
          <Image
            src="/placeholder.png"
            alt="farewell"
            width={60}
            height={60}
            className="rounded border"
          />
          <Input placeholder="Farewell message script" />
        </div>
      </div>

      {/* Add buttons */}
      <div className="flex gap-3">
        <Button onClick={addQuestion}>+ Add Question</Button>
        <Button variant="outline">+ Add Introduction</Button>
        <Button variant="outline">+ Add Farewell Message</Button>
      </div>
    </div>
  );
}
