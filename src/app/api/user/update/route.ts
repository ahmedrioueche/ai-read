import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

async function handlePost(req: Request) {
  try {
    const { email, updateData } = await req.json();
    console.log("Received request data:", { email, updateData });

    if (!email || !updateData) {
      return NextResponse.json(
        { message: "Email and update data are required." },
        { status: 400 }
      );
    }

    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        analytics: true,
        settings: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found", email },
        { status: 404 }
      );
    }

    console.log("Found user:", user);

    try {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          ...updateData,
        },
      });

      console.log("Successfully updated user:", updatedUser);

      return NextResponse.json(
        { message: "User updated successfully", user: updatedUser },
        { status: 200 }
      );
    } catch (prismaError) {
      console.error("Prisma update error:", prismaError);
      throw prismaError; // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.log("Error");
  }
}

export const POST = handlePost;
