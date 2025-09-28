"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Trash2, Upload, User, Bot } from "lucide-react";
import { InterviewService } from "@/lib/supabase/interviews";
import { requestAIInterviewVideo } from "../add/page";

type Question = {
  id?: string; // undefined until saved
  title: string;
  text: string;
  video?: File | null;
  videoId?: string | null;
  mode: "human" | "bot";
};

type Section = {
  text: string;
  video?: File | null;
  videoId?: string | null;
  mode: "human" | "bot";
  contentId?: string;
};

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
        <div className="flex items-center justify-center w-full h-full border rounded bg-gray-50">
          <img
            src="https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_target.webp"
            alt="Bot Avatar"
            className="w-full h-full object-cover rounded"
          />
        </div>
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

type EditInterviewProps = {
  interviewId: string;
};

export default function EditInterview({ interviewId }: EditInterviewProps) {
  const [positionTitle, setPositionTitle] = useState("");
  const [intro, setIntro] = useState<Section>({ text: "", mode: "human" });
  const [farewell, setFarewell] = useState<Section>({
    text: "",
    mode: "human",
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch interview
  useEffect(() => {
    async function fetchInterview() {
      try {
        const interview = await InterviewService.getInterviewById(interviewId);
        setPositionTitle(interview.position_title);

        const introContent = interview.contents.find(
          (c: any) => c.type === "introduction"
        );
        const farewellContent = interview.contents.find(
          (c: any) => c.type === "farewell"
        );
        const questionContents = interview.contents.filter(
          (c: any) => c.type === "question"
        );

        if (introContent)
          setIntro({
            text: introContent.content,
            videoId: introContent.video_id,
            mode: introContent.mode,
            contentId: introContent.id,
          });
        if (farewellContent)
          setFarewell({
            text: farewellContent.content,
            videoId: farewellContent.video_id,
            mode: farewellContent.mode,
            contentId: farewellContent.id,
          });
        setQuestions(
          questionContents.map((q: any) => ({
            id: q.id,
            title: q.title || "",
            text: q.content,
            videoId: q.video_id,
            mode: q.mode,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch interview:", err);
      }
    }

    fetchInterview();
  }, [interviewId]);

  // Actions
  const addQuestion = () =>
    setQuestions([...questions, { title: "", text: "", mode: "human" }]);

  const removeQuestion = async (id: string) => {
    try {
      await InterviewService.deleteContent(id);
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (err: any) {
      console.error("Failed to delete question:", err.message);
    }
  };

  const deleteIntro = async () => {
    if (!intro.contentId) return;
    try {
      await InterviewService.deleteContent(intro.contentId);
      setIntro({
        text: "",
        video: null,
        videoId: null,
        mode: "human",
        contentId: undefined,
      });
    } catch (err: any) {
      console.error("Failed to delete intro:", err.message);
    }
  };

  const deleteFarewell = async () => {
    if (!farewell.contentId) return;
    try {
      await InterviewService.deleteContent(farewell.contentId);
      setFarewell({
        text: "",
        video: null,
        videoId: null,
        mode: "human",
        contentId: undefined,
      });
    } catch (err: any) {
      console.error("Failed to delete farewell:", err.message);
    }
  };

  // Save handler
  const handleSave = async () => {
    try {
      setLoading(true);

      // Intro
      let introVideoId = intro.videoId || null;
      if (intro.mode === "bot" && !introVideoId)
        introVideoId = await requestAIInterviewVideo(intro.text);

      if (intro.text || intro.video || introVideoId) {
        await InterviewService.upsertContent(interviewId, {
          contentId: intro.contentId,
          type: "introduction",
          content: intro.text,
          orderNo: 1,
          mode: intro.mode,
          videoFile: intro.mode === "human" ? intro.video! : null,
          videoId: intro.mode === "bot" ? introVideoId : null,
        });
      }

      // Questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        let videoId = q.videoId || null;
        if (q.mode === "bot" && !videoId)
          videoId = await requestAIInterviewVideo(q.text);

        await InterviewService.upsertContent(interviewId, {
          contentId: q.id, // undefined for new questions
          type: "question",
          title: q.title,
          content: q.text,
          orderNo: i + 2,
          mode: q.mode,
          videoFile: q.mode === "human" ? q.video! : null,
          videoId: q.mode === "bot" ? videoId : null,
        });
      }

      // Farewell
      let farewellVideoId = farewell.videoId || null;
      if (farewell.mode === "bot" && !farewellVideoId)
        farewellVideoId = await requestAIInterviewVideo(farewell.text);

      if (farewell.text || farewell.video || farewellVideoId) {
        await InterviewService.upsertContent(interviewId, {
          contentId: farewell.contentId,
          type: "farewell",
          content: farewell.text,
          orderNo: questions.length + 2,
          mode: farewell.mode,
          videoFile: farewell.mode === "human" ? farewell.video! : null,
          videoId: farewell.mode === "bot" ? farewellVideoId : null,
        });
      }

      alert("Interview updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Failed to update interview: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Position Title */}
      <div className="mt-4 flex flex-col">
        <label className="text-sm font-medium">Position Title</label>
        <Input
          value={positionTitle}
          onChange={(e) => setPositionTitle(e.target.value)}
          className="mt-1 max-w-sm"
        />
      </div>

      <p className="font-semibold mb-2">Interview</p>

      {/* Intro */}
      <div className="border rounded p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Introduction</p>
          {intro.contentId && (
            <Button variant="destructive" size="sm" onClick={deleteIntro}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-start gap-4">
          <VideoOrAI
            mode={intro.mode}
            video={intro.video}
            videoId={intro.videoId}
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
        <div key={q.id || index} className="border rounded p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Question {index + 1}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4" /> Copy
              </Button>
              {q.id && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeQuestion(q.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-start gap-4">
            <VideoOrAI
              mode={q.mode}
              video={q.video}
              videoId={q.videoId}
              onUpload={(file) =>
                setQuestions(
                  questions.map((qq, idx) =>
                    idx === index ? { ...qq, video: file, videoId: null } : qq
                  )
                )
              }
              onToggle={(nextMode) =>
                setQuestions(
                  questions.map((qq, idx) =>
                    idx === index ? { ...qq, mode: nextMode } : qq
                  )
                )
              }
            />
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Title"
                value={q.title}
                onChange={(e) =>
                  setQuestions(
                    questions.map((qq, idx) =>
                      idx === index ? { ...qq, title: e.target.value } : qq
                    )
                  )
                }
              />
              <Textarea
                placeholder="Full question"
                value={q.text}
                onChange={(e) =>
                  setQuestions(
                    questions.map((qq, idx) =>
                      idx === index ? { ...qq, text: e.target.value } : qq
                    )
                  )
                }
                className="h-[95px] w-full resize-none"
              />
            </div>
          </div>
        </div>
      ))}

      <Button onClick={addQuestion}>+ Add Question</Button>

      {/* Farewell */}
      <div className="border rounded p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Farewell</p>
          {farewell.contentId && (
            <Button variant="destructive" size="sm" onClick={deleteFarewell}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-start gap-4">
          <VideoOrAI
            mode={farewell.mode}
            video={farewell.video}
            videoId={farewell.videoId}
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

      {/* Save */}
      <div className="pt-4">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Update Interview"}
        </Button>
      </div>
    </div>
  );
}
