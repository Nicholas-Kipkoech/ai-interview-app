"use client";
import { useEffect, useState, useRef } from "react";
import { InterviewService } from "@/lib/supabase/interviews";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InterviewIntroCard from "@/app/components/interview/IntroCard";
import ApplicantDetailsCard from "@/app/components/interview/ApplicantDetailsCard";
import MediaTestCard from "@/app/components/interview/MediaTestCard";

type InterviewContent = {
  orderNo: number;
  type: "introduction" | "question" | "farewell";
  text: string;
  videoUrl?: string | null;
};

type Response = {
  orderNo: number;
  type: string;
  text: string;
  answerVideoFile?: File | null;
};

export default function InterviewFlow({
  interviewId,
}: {
  interviewId: string;
}) {
  const [interview, setInterview] = useState<any>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [step, setStep] = useState(0);

  // applicant details
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");

  // recording
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [currentAnswerVideo, setCurrentAnswerVideo] = useState<File | null>(
    null
  );

  const [loading, setLoading] = useState(false);

  // fetch interview
  useEffect(() => {
    async function fetchInterview() {
      const data = await InterviewService.getInterviewById(interviewId);
      setInterview(data);

      const mappedResponses: Response[] = data.contents.map(
        (c: InterviewContent) => ({
          orderNo: c.orderNo,
          type: c.type,
          text: c.text,
          answerVideoFile: null,
        })
      );
      setResponses(mappedResponses);
    }
    fetchInterview();
  }, [interviewId]);

  if (!interview) return <div>Loading...</div>;

  const questions = responses.filter((r) => r.type === "question");
  const currentQuestionIndex = Math.floor((step - 3) / 2);
  const currentQuestion = questions[currentQuestionIndex];

  // --- recording logic ---
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (videoRef.current) videoRef.current.srcObject = stream;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    recordedChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const file = new File([blob], `answer-${currentQuestion.orderNo}.webm`, {
        type: "video/webm",
      });
      setCurrentAnswerVideo(file);
      if (videoRef.current) videoRef.current.srcObject = null;
      videoRef.current.src = URL.createObjectURL(file);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
  };

  const saveAnswerVideo = () => {
    if (currentAnswerVideo && currentQuestion) {
      setResponses((prev) =>
        prev.map((r) =>
          r.orderNo === currentQuestion.orderNo
            ? { ...r, answerVideoFile: currentAnswerVideo }
            : r
        )
      );
      setCurrentAnswerVideo(null);
    }
  };

  const handleSubmit = async () => {
    saveAnswerVideo();
    try {
      setLoading(true);
      await InterviewService.addInterviewResponse(interviewId, {
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        answers: responses.map((r) => ({
          orderNo: r.orderNo,
          text: r.text,
          videoFile: r.answerVideoFile ?? undefined,
        })),
      });
      alert("Interview submitted!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Step Cards */}
      <Card className="rounded-2xl">
        {/* Step 0: Introduction */}
        {step === 0 && (
          <InterviewIntroCard
            positionTitle={interview.position_title}
            questionCount={questions.length}
            onStart={() => setStep(1)}
            thumbnailUrl={
              "https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_target.webp"
            }
          />
        )}

        {/* Step 1: Applicant Details */}
        {step === 1 && (
          <ApplicantDetailsCard
            name={applicantName}
            email={applicantEmail}
            onNameChange={(val: string) => setApplicantName(val)}
            onEmailChange={(val: string) => setApplicantEmail(val)}
            onNext={() => setStep(2)}
          />
        )}

        {/* Step 2: Mic/Camera Test */}
        {step === 2 && (
          <MediaTestCard
            videoRef={videoRef}
            recording={recording}
            onStart={startRecording}
            onStop={stopRecording}
            onNext={() => setStep(3)}
          />
        )}

        {/* Steps 3...N: Questions */}
        {step >= 3 && step < questions.length * 2 + 3 && (
          <>
            {step % 2 === 1 ? (
              <>
                <CardHeader>
                  <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{currentQuestion.text}</p>
                  <video
                    controls
                    src={currentQuestion.videoUrl ?? ""}
                    className="w-full rounded"
                  />
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setStep(step + 1)}>
                    Answer Question
                  </Button>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader>
                  <CardTitle>
                    Answer Question {currentQuestionIndex + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <video
                    ref={videoRef}
                    controls
                    className="w-full rounded border"
                    src={
                      currentAnswerVideo
                        ? URL.createObjectURL(currentAnswerVideo)
                        : currentQuestion.answerVideoFile
                        ? URL.createObjectURL(currentQuestion.answerVideoFile)
                        : undefined
                    }
                  />
                </CardContent>
                <CardFooter className="flex gap-3">
                  {!recording ? (
                    <Button onClick={startRecording}>Record</Button>
                  ) : (
                    <Button onClick={stopRecording} variant="destructive">
                      Stop
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      saveAnswerVideo();
                      setStep(step + 1);
                    }}
                  >
                    Done
                  </Button>
                </CardFooter>
              </>
            )}
          </>
        )}

        {/* Final Step: Farewell */}
        {step === questions.length * 2 + 3 && (
          <>
            <CardHeader>
              <CardTitle>Farewell</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{responses.find((r) => r.type === "farewell")?.text}</p>
              <video
                controls
                src={
                  responses.find((r) => r.type === "farewell")?.videoUrl ?? ""
                }
                className="w-full rounded mt-4"
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit Interview"}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
