import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function syncCurrentUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const client = await clerkClient();

    // 1. Check if user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (existingUser) {
      // Sync role to Clerk publicMetadata so client components can read it
      await client.users.updateUser(userId, {
        publicMetadata: { role: existingUser.role },
      });
      return existingUser;
    }

    // 2. If not, fetch their details from Clerk
    const clerkUser = await client.users.getUser(userId);

    // 3. Create the user in our database
    const newUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        role: "ADMIN", 
      }
    });

    // Sync role to Clerk publicMetadata
    await client.users.updateUser(userId, {
      publicMetadata: { role: newUser.role },
    });

    return newUser;
  } catch {
    return null;
  }
}
