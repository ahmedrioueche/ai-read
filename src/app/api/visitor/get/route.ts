import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

async function handleGet(req: Request) {
  try {
    const { fingerprint } = await req.json();
    console.log("Received request data:", fingerprint);

    if (!fingerprint) {
      return NextResponse.json(
        { message: "fingerPrint is required." },
        { status: 400 }
      );
    }

    // Check if visitor exists
    const visitor = await prisma.visitor.findUnique({
      where: { fingerprint },
      include: {
        settings: true,
      },
    });

    if (!visitor) {
      return NextResponse.json(
        { message: "Visitor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(visitor);
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = handleGet;
