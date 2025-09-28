import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface InterviewPayload {
  title: string | null;
  createdBy: string; // user id
  contents: {
    type: "introduction" | "farewell" | "question";
    text: string;
    orderNo: number;
    mode: "human" | "bot";
    videoFile?: File | null;
    videoId?: string | null;
  }[];
}

export class InterviewService {
  // Create new interview entry
  static async createInterview(positionTitle: string) {
    const { data, error } = await supabase
      .from("interviews")
      .insert([{ position_title: positionTitle }])
      .select()
      .single();

    if (error) throw new Error(`Create Interview failed: ${error.message}`);
    return data;
  }

  // Upload video file to Supabase storage
  private static async uploadVideo(
    interviewId: string,
    file: File,
    prefix: string
  ): Promise<string> {
    const fileName = `${interviewId}/${prefix}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Video upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("videos").getPublicUrl(fileName);

    return publicUrl;
  }

  // Add a single content block (intro/question/farewell)
  static async addContent(
    interviewId: string,
    {
      type,
      title,
      content,
      orderNo,
      mode,
      videoFile,
      videoId,
    }: {
      type: "introduction" | "question" | "farewell";
      title?: string | null;
      content: string;
      orderNo: number;
      mode: "human" | "bot";
      videoFile?: File | null;
      videoId?: string | null;
    }
  ) {
    let videoUrl: string | null = null;

    if (mode === "human" && videoFile) {
      videoUrl = await this.uploadVideo(interviewId, videoFile, type);
    }

    const { data, error } = await supabase
      .from("interview_content")
      .insert([
        {
          interview_id: interviewId,
          type,
          title,
          content,
          video_id: mode === "bot" ? videoId : null,
          video_url: videoUrl,
          order_no: orderNo,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Add Content failed: ${error.message}`);
    }

    return data;
  }

  // Update a single content block
  static async updateContent(
    interviewId: string,
    {
      contentId,
      type,
      title,
      content,
      orderNo,
      mode,
      videoFile,
      videoId,
    }: {
      contentId?: string; // optional if updating by interview/type
      type: "introduction" | "question" | "farewell";
      title?: string | null;
      content: string;
      orderNo: number;
      mode: "human" | "bot";
      videoFile?: File | null;
      videoId?: string | null;
    }
  ) {
    let videoUrl: string | null = null;

    if (mode === "human" && videoFile) {
      videoUrl = await this.uploadVideo(interviewId, videoFile, type);
    }

    // Determine which row to update
    const query = supabase.from("interview_content").update({
      title,
      content,
      video_id: mode === "bot" ? videoId : null,
      video_url: videoUrl,
      order_no: orderNo,
      type,
    });

    if (contentId) {
      query.eq("id", contentId);
    } else {
      query
        .eq("interview_id", interviewId)
        .eq("type", type)
        .eq("order_no", orderNo);
    }

    const { data, error } = await query.select().maybeSingle();

    if (error) {
      throw new Error(`Update Content failed: ${error.message}`);
    }

    return data;
  }

  // NEW: Upsert helper (create if missing, update if exists)
  static async upsertContent(
    interviewId: string,
    payload: {
      contentId?: string;
      type: "introduction" | "question" | "farewell";
      title?: string | null;
      content: string;
      orderNo: number;
      mode: "human" | "bot";
      videoFile?: File | null;
      videoId?: string | null;
    }
  ) {
    if (payload.contentId) {
      // try update first
      const updated = await this.updateContent(interviewId, payload);
      if (updated) return updated;
    }
    // fallback → add
    return this.addContent(interviewId, payload);
  }

  // Delete a single content block
  static async deleteContent(contentId: string) {
    const { data, error } = await supabase
      .from("interview_content")
      .delete()
      .eq("id", contentId)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Delete Content failed: ${error.message}`);
    }

    if (!data) {
      console.log(`No content found with ID ${contentId}, nothing deleted.`);
      return null;
    }

    return data;
  }
  static async getInterviewById(interviewId: string) {
    // 1. Fetch interview details
    const { data: interview, error: interviewError } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", interviewId)
      .single();

    if (interviewError) {
      throw new Error(`Failed to fetch interview: ${interviewError.message}`);
    }

    // 2. Fetch associated content
    const { data: contents, error: contentError } = await supabase
      .from("interview_content")
      .select("*")
      .eq("interview_id", interviewId)
      .order("order_no", { ascending: true });

    if (contentError) {
      throw new Error(
        `Failed to fetch interview contents: ${contentError.message}`
      );
    }

    // 3. Resolve missing video URLs by calling HeyGen directly
    const resolvedContents = await Promise.all(
      (contents || []).map(async (c) => {
        if (!c.video_url && c.video_id) {
          try {
            let videoUrl = "";
            while (!videoUrl) {
              const res = await fetch(
                `https://api.heygen.com/v1/video_status.get?video_id=${c.video_id}`,
                {
                  headers: {
                    accept: "application/json",
                    "x-api-key": process.env
                      .NEXT_PUBLIC_HEYGEN_API_KEY as string,
                  },
                }
              );

              if (!res.ok) {
                console.error("HeyGen API error:", res.statusText);
                break;
              }

              const pollData = await res.json();
              const status = pollData.data?.status;

              if (status === "completed") {
                videoUrl = pollData.data.video_url;
              } else if (status === "failed") {
                console.error("Video generation failed for:", c.video_id);
                break;
              }

              if (!videoUrl) {
                // wait 3s before retry
                await new Promise((r) => setTimeout(r, 3000));
              }
            }

            return { ...c, video_url: videoUrl || c.video_url };
          } catch (err) {
            console.error("Error resolving HeyGen video:", err);
            return c;
          }
        }
        return c;
      })
    );

    return {
      ...interview,
      contents: resolvedContents,
    };
  }

  static async fetchInterviews() {
    const { data, error } = await supabase.from("interviews").select("*");
    if (error) console.error(error);

    return { data, error };
  }

  // Add applicant responses
  static async addInterviewResponse(
    interviewId: string,
    {
      applicant_name,
      applicant_email,
      answers,
    }: {
      applicant_name: string;
      applicant_email: string;
      answers: {
        orderNo: number;
        text: string;
        videoFile?: File | null;
      }[];
    }
  ) {
    try {
      const answersWithUrls = await Promise.all(
        answers.map(async (a) => {
          let videoUrl: string | null = null;
          if (a.videoFile) {
            const fileName = `${interviewId}/responses/${
              a.orderNo
            }-${Date.now()}-${a.videoFile.name}`;
            const { error: uploadError } = await supabase.storage
              .from("videos")
              .upload(fileName, a.videoFile, {
                cacheControl: "3600",
                upsert: false,
              });

            if (uploadError) throw new Error(uploadError.message);

            const { data: urlData } = supabase.storage
              .from("videos")
              .getPublicUrl(fileName);

            videoUrl = urlData.publicUrl;
          }

          return { orderNo: a.orderNo, text: a.text, videoUrl };
        })
      );

      console.log("answerWithUrls....", answersWithUrls);

      const { data, error } = await supabase
        .from("interview_responses")
        .insert([
          {
            interview_id: interviewId,
            applicant_name,
            applicant_email,
            answers: answersWithUrls,
          },
        ]);

      if (error) throw new Error(error.message);
      return data;
    } catch (err: any) {
      throw new Error(`Failed to save applicant responses: ${err.message}`);
    }
  }
}
