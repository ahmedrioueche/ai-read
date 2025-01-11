import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

async function handlePost(req: Request) {
  try {
    const { fingerprint } = await req.json();
    console.log("Received request data:", fingerprint);

    if (!fingerprint) {
      return NextResponse.json(
        { message: "fingerPrint is required." },
        { status: 400 }
      );
    }

    const visitor = await prisma.visitor.create({
      data: {
        fingerprint,
      },
      include: {
        settings: true,
      },
    });

    return NextResponse.json(visitor);
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = handlePost;
