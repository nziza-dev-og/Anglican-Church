import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import AuthLayout from '@/components/layout/AuthLayout';

export default function LoginPage() {
  return (
    <AuthLayout title="Login to Your Account">
      <LoginForm />
      <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="underline underline-offset-4 hover:text-primary">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}