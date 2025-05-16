import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

// POST - Create a new visitor
async function handlePost(req: Request) {
  try {
    const { fingerprint } = await req.json();
    console.log("Received POST request data:", fingerprint);

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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("POST Error:", errorMessage);
    return NextResponse.json(
      { message: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

// GET - Retrieve a visitor by fingerprint
async function handleGet(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fingerprint = searchParams.get("fingerprint");

    console.log("Received GET request with fingerprint:", fingerprint);

    if (!fingerprint) {
      return NextResponse.json(
        { message: "fingerPrint is required." },
        { status: 400 }
      );
    }

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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("GET Error:", errorMessage);
    return NextResponse.json(
      { message: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH - Update a visitor
async function handlePatch(req: Request) {
  try {
    const { id, updateData } = await req.json();
    console.log("Received PATCH request with ID:", id);

    if (!id) {
      return NextResponse.json({ message: "ID is required." }, { status: 400 });
    }

    const existingVisitor = await prisma.visitor.findUnique({
      where: { id },
      include: { settings: true },
    });

    if (!existingVisitor) {
      return NextResponse.json(
        { message: "Visitor not found" },
        { status: 404 }
      );
    }

    const visitor = await prisma.visitor.update({
      where: { id },
      data: updateData,
      include: { settings: true },
    });

    console.log("Updated visitor:", visitor);
    return NextResponse.json(visitor);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("PATCH Error:", errorMessage);
    return NextResponse.json(
      {
        message: "An error occurred while processing your request.",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export const POST = handlePost;
export const GET = handleGet;
export const PATCH = handlePatch;
