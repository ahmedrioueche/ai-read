import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

// GET - Fetch user settings by ID
async function handleGet(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    console.log("Received GET request for user ID:", id);

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required as a query parameter" },
        { status: 400 }
      );
    }

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

// POST - Create or update user settings
async function handlePost(req: Request) {
  try {
    const { id, ...settingsData } = await req.json();
    console.log("Received POST request data:", { id, ...settingsData });

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required in the request body" },
        { status: 400 }
      );
    }

    // Upsert settings (create or update)
    const settings = await prisma.settings.upsert({
      where: { userId: id },
      create: {
        userId: id,
        ...settingsData,
      },
      update: settingsData,
    });

    console.log("Saved user settings:", settings);
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error saving user settings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = handleGet;
export const POST = handlePost;
