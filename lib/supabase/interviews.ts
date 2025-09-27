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
    } = supabase.storage.from("interview-videos").getPublicUrl(fileName);

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

  /**
   * Add applicant responses for an interview
   * @param interviewId The interview's ID
   * @param applicant_name Applicant's name
   * @param applicant_email Applicant's email
   * @param answers Array of answers with orderNo, text, and optional videoFile
   */
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
      // 1. Upload any human video responses
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

      // 2. Insert the response into Supabase
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

  static async fetchInterviews() {
    const { data, error } = await supabase.from("interviews").select("*");
    if (error) console.error(error);

    return { data, error };
  }
}
