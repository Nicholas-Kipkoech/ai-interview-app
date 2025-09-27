import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("video_id");

    if (!videoId) {
      return NextResponse.json({ error: "Missing video_id" }, { status: 400 });
    }

    let videoUrl = "";
    while (!videoUrl) {
      const pollRes = await fetch(
        `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
        {
          headers: {
            accept: "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_HEYGEN_API_KEY as string,
          },
        }
      );

      const pollData = await pollRes.json();
      const status = pollData.data?.status;

      if (status === "completed") {
        videoUrl = pollData.data.video_url;
      } else if (status === "failed") {
        throw new Error("Video generation failed");
      }

      if (!videoUrl) await new Promise((r) => setTimeout(r, 3000));
    }

    return NextResponse.json({ url: videoUrl });
  } catch (err: any) {
    console.error("Error in /api/get-video-url:", err);
    return NextResponse.json(
      { error: err.message || "Failed to get video url" },
      { status: 500 }
    );
  }
}
