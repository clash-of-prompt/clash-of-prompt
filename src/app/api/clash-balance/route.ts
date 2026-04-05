import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address");
    const res = await fetch(`${BACKEND_URL}/api/clash-balance?address=${address}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ balance: 0 });
  }
}
