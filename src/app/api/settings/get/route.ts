import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

async function handlePost(req: Request) {
  try {
    const { id } = await req.json();
    console.log("Received request data:", id);

    if (!id) {
      return NextResponse.json({ message: "id is required." }, { status: 400 });
    }

    // Fetch the user's settings using their ID
    const settings = await prisma.settings.findUnique({
      where: { userId: id },
    });

    if (!settings) {
      return NextResponse.json(
        { message: "Settings not found for the given user ID", id },
        { status: 404 }
      );
    }

    console.log("Found user settings:", settings);

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = handlePost;
