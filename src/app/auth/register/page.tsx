
"use client";
import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';
import AuthLayout from '@/components/layout/AuthLayout';
import { useTranslation } from '@/hooks/useTranslation';

export default function RegisterPage() {
  const { t } = useTranslation();
  return (
    <AuthLayout title={t('auth.register.title')}>
      <RegisterForm />
      <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
        {t('auth.register.hasAccount')}{' '}
        <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
          {t('auth.login')}
        </Link>
      </p>
    </AuthLayout>
  );
}
