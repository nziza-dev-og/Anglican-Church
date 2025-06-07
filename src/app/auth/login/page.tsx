
"use client";
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import AuthLayout from '@/components/layout/AuthLayout';
import { useTranslation } from '@/hooks/useTranslation';

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <AuthLayout title={t('auth.login.title')}>
      <LoginForm />
      <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
        {t('auth.login.noAccount')}{' '}
        <Link href="/auth/register" className="underline underline-offset-4 hover:text-primary">
          {t('auth.register')}
        </Link>
      </p>
    </AuthLayout>
  );
}
