import { NextResponse } from "next/server";
import { UserService } from "@/services/userService";

async function handlePost(req: Request) {
  try {
    const { email, updateData } = await req.json();

    if (!email || !updateData) {
      return NextResponse.json(
        { message: "Email and update data are required." },
        { status: 400 }
      );
    }

    const userService = new UserService();
    return await userService.updateUser(email, updateData);
  } catch (error) {
    console.error("Error in handlePost:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const POST = handlePost;
