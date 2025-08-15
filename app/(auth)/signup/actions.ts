'use server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { sign } from 'crypto';
import z from 'zod';

export const handleSignUpAction = async (formData: FormData) => {
  const input = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
  };

  const signUpSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(255),
    lastName: z.string().min(1, 'Last name is required').max(255),
    email: z.email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  });

  // Validate the form data
  const validationResult = signUpSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      error: 'Validation failed. Please check your inputs.',
      prevInputs: input,
      validationErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  // Check if passwords match
  if (input.password !== input.confirmPassword) {
    return {
      error: 'Passwords do not match.',
      prevInputs: input,
    };
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return {
        error: 'User with this email already exists.',
        prevInputs: input,
      };
    }

    const hashedPassword = await hashPassword(input.password);
    await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        password: hashedPassword,
      },
    });

    return {
      error: '',
      success: true,
      message: 'Sign up successful',
    };
  } catch (error) {
    console.error('Sign up failed:', error);
    return {
      error: 'Sign up failed. Please try again.',
      prevInputs: input,
    };
  }
};
