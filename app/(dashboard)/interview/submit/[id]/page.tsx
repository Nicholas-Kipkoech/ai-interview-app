"use client";
import React from "react";
import InterviewFlow from "./ApplicantInterview";

// <-- make this page fully client-side

export default function InterviewSubmitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <InterviewFlow interviewId={id} />;
}
