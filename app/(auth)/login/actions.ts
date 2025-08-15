'use server';
import { signIn } from '@/auth';
import z from 'zod';

export const handleLogin = async (formData: FormData) => {
  const input = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const loginSchema = z.object({
    email: z.email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  });

  // Validate the form data
  const validationResult = loginSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      error: 'Validation failed. Please check your inputs.',
      prevInputs: input,
      validationErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    await signIn('credentials', {
      email: input.email,
      password: input.password,
      redirect: false,
    });
    return {
      error: '',
      success: true,
      message: 'Login successful',
    };
  } catch (error) {
    console.error('Login failed:', error);
    return {
      error: 'Login failed. Please check your credentials.',
      prevInputs: input,
    };
  }
};
