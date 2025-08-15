import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { verifyPassword } from './lib/password';
import z from 'zod';
import prisma from './lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const validationSchema = z.object({
          email: z.email(),
          password: z.string().min(6),
        });

        const parsedCredentials = validationSchema.safeParse(credentials);
        if (!parsedCredentials.success) {
          return null;
        }

        // Find the user by email
        const user = await prisma.user.findFirst({
          where: {
            email: parsedCredentials.data.email,
          },
        });
        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          return null;
        }

        // Verify the password
        const isPasswordValid = await verifyPassword(
          parsedCredentials.data.password,
          user.password,
        );

        if (!isPasswordValid) {
          return null;
        }

        // return user object with their profile data
        return user;
      },
    }),
  ],
});
