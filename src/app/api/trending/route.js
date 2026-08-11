import { NextResponse } from "next/server";
import { loadGraph } from "@/lib/feed";
import { trendingTags } from "@/lib/rank";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const graph = await loadGraph();
    const trending = trendingTags(graph.plainPosts, Date.now(), 12);
    return NextResponse.json({ trending });
  } catch {
    return NextResponse.json({ trending: [] });
  }
}