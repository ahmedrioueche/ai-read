import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { User } from "@prisma/client";

export class UserService {
  async updateUser(email: string, updateData: Partial<User>) {
    try {
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
  }
}
