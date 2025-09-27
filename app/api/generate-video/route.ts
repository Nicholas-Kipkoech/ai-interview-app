import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, avatarId, voiceId } = await req.json();

    const res = await fetch("https://api.heygen.com/v2/video/generate", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_HEYGEN_API_KEY as string,
      },
      body: JSON.stringify({
        caption: false,
        title: "AI Interview",
        dimension: { width: 1280, height: 720 },
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: avatarId ?? "Abigail_expressive_2024112501",
              scale: 1,
              avatar_style: "normal",
              talking_style: "stable",
              expression: "default",
            },
            voice: {
              type: "text",
              voice_id: voiceId ?? "73c0b6a2e29d4d38aca41454bf58c955",
              input_text: text,
              speed: 1,
              pitch: 1,
              emotion: "Excited",
              locale: "en_us",
            },
            background: { type: "color", value: "#ffffff" },
          },
        ],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "HeyGen API error" },
        { status: res.status }
      );
    }

    const videoId = data.data?.video_id;
    if (!videoId) throw new Error("No video_id returned");

    // return only video_id for storing in Supabase
    return NextResponse.json({ video_id: videoId });
  } catch (err: any) {
    console.error("Error in /api/generate-video:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate video" },
      { status: 500 }
    );
  }
}
