import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

async function handlePost(req: Request) {
  try {
    const { id, updateData } = await req.json();
    console.log("Received request data:", id);

    if (!id) {
      return NextResponse.json(
        { message: "fingerPrint is required." },
        { status: 400 }
      );
    }

    // Check if a visitor with the given fingerprint already exists
    const existingVisitor = await prisma.visitor.findUnique({
      where: { id },
      include: { settings: true },
    });

    let visitor;
    if (existingVisitor) {
      // Update the existing visitor
      visitor = await prisma.visitor.update({
        where: { id },
        data: {
          ...updateData,
        },
        include: { settings: true },
      });
      console.log("Updated existing visitor:", visitor);
    }

    return NextResponse.json(visitor);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}

export const POST = handlePost;
