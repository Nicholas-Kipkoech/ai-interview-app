"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ViewIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InterviewService } from "@/lib/supabase/interviews";

type Applicant = {
  id: string;
  name: string;
  email: string;
  started: string;
  ended: string;
  progress: "In Process" | "Completed";
  positionTitle: string;
  status: "Not Scored" | "Pass" | "Fail" | null;
  questions?: {
    id: string;
    orderNo: string;
    question: string;
    answer: string;
    videoUrl?: string;
    answerId: string;
  }[];
};

type AnalyticsInterviewProps = {
  interviewId: string;
};

export default function Analytics({ interviewId }: AnalyticsInterviewProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );

  // Accordion state: only one open at a time
  const [openQuestion, setOpenQuestion] = useState<string | undefined>();

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      try {
        const { data: interviews, error: interviewError } =
          await InterviewService.fetchInterviews();
        if (interviewError) throw interviewError;

        const positionTitle =
          interviews?.find((i) => i.id === interviewId)?.position_title ??
          "N/A";

        const responses =
          await InterviewService.getInterviewResponsesForInterview(interviewId);

        const mappedApplicants: Applicant[] = (responses || []).map(
          (response: any) => ({
            id: response.id,
            name: response.applicant_name,
            email: response.applicant_email,
            started: response.created_at || "",
            ended: response.updated_at || "",
            progress: response.progress ?? "In Process",
            status: response.status ?? "Not Scored",
            positionTitle,
            questions: response.answers?.map((a: any, index: number) => ({
              id: a.question_id,
              answerId: a.id,
              question: a.question ?? "",
              answer: a.answer ?? "", // make sure your backend returns this
              videoUrl: a.videoUrl ?? undefined,
              orderNo: index + 1,
            })),
          })
        );

        setApplicants(mappedApplicants);
      } catch (err) {
        console.error("Error fetching applicants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [interviewId]);

  const filteredApplicants = applicants.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    {
      label: "Passed Apps",
      value: applicants.filter((a) => a.status === "Pass").length,
    },
    {
      label: "In Progress Apps",
      value: applicants.filter((a) => a.progress === "In Process").length,
    },
    {
      label: "Completed Apps",
      value: applicants.filter((a) => a.progress === "Completed").length,
    },
  ];

  console.log(selectedApplicant);

  return (
    <div className="p-6 space-y-8">
      {/* Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Analytics</h2>
        <div className="flex flex-wrap gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex-1 min-w-[200px] border rounded-lg p-6 text-center shadow-sm bg-white"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search + Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-[#E5E5E5] text-left text-lg">
              <tr>
                <th className="px-4 py-2">Applicant</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Started</th>
                <th className="px-4 py-2">Ended</th>
                <th className="px-4 py-2">Progress</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Application</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-6">
                    Loading applicants...
                  </td>
                </tr>
              ) : filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    No results found.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{a.name}</td>
                    <td className="px-4 py-2">{a.email}</td>
                    <td className="px-4 py-2">{a.started}</td>
                    <td className="px-4 py-2">{a.ended}</td>
                    <td className="px-4 py-2">{a.progress}</td>
                    <td className="px-4 py-2">{a.status ?? "Null"}</td>
                    <td className="px-4 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApplicant(a);
                          setOpenQuestion(undefined); // reset accordion
                        }}
                      >
                        <ViewIcon className="mr-2 h-4 w-4" />
                        View Application
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sheet with questions */}
      {selectedApplicant && (
        <Sheet
          open={!!selectedApplicant}
          onOpenChange={(open) => !open && setSelectedApplicant(null)}
        >
          <SheetContent
            side="right"
            className="w-[450px] sm:w-[600px] overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>{selectedApplicant.name}</SheetTitle>
              <SheetDescription>
                {selectedApplicant.positionTitle || "N/A"}
              </SheetDescription>
            </SheetHeader>

            {selectedApplicant.questions &&
            selectedApplicant.questions.length > 0 ? (
              <Accordion
                type="single"
                collapsible
                value={openQuestion}
                onValueChange={(val) => setOpenQuestion(val || undefined)}
              >
                {selectedApplicant.questions.map((q) => (
                  <AccordionItem key={q.answerId || q.id} value={`q-${q.id}`}>
                    <AccordionTrigger className="flex justify-between items-center">
                      <span>
                        Question {q.orderNo}:{" "}
                        {q.question.length > 50
                          ? q.question.slice(0, 50) + "..."
                          : q.question}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            if (!q.answerId)
                              return alert("Answer not saved yet");
                            try {
                              await InterviewService.markAnswer(
                                q.answerId,
                                "pass"
                              );
                              alert("Marked as Pass");
                            } catch (err) {
                              console.error(err);
                              alert("Failed to mark answer");
                            }
                          }}
                        >
                          Pass
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (!q.answerId)
                              return alert("Answer not saved yet");
                            try {
                              await InterviewService.markAnswer(
                                q.answerId,
                                "fail"
                              );
                              alert("Marked as Fail");
                            } catch (err) {
                              console.error(err);
                              alert("Failed to mark answer");
                            }
                          }}
                        >
                          Fail
                        </Button>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="space-y-2">
                      <p>{q.answer}</p>
                      {q.videoUrl && (
                        <video
                          src={q.videoUrl}
                          controls
                          className="w-full rounded mt-2"
                        />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-gray-500 mt-4">No questions available.</p>
            )}

            {/* Mark whole interview */}
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await InterviewService.markInterview(
                      selectedApplicant.id,
                      "pass"
                    );
                    alert("Interview marked as Pass");
                  } catch (err) {
                    console.error(err);
                    alert("Failed to mark interview");
                  }
                }}
              >
                Pass Interview
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await InterviewService.markInterview(
                      selectedApplicant.id,
                      "fail"
                    );
                    alert("Interview marked as Fail");
                  } catch (err) {
                    console.error(err);
                    alert("Failed to mark interview");
                  }
                }}
              >
                Fail Interview
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
