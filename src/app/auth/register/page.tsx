import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';
import AuthLayout from '@/components/layout/AuthLayout';

export default function RegisterPage() {
  return (
    <AuthLayout title="Create Your Account">
      <RegisterForm />
      <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}