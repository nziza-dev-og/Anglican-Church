
"use client"; // Add "use client" if using hooks like useTranslation
import Link from 'next/link';
import { Church } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

const Logo = ({ className, iconSize = 24, textSize = "text-xl" }: LogoProps) => {
  const { t } = useTranslation(); // Use the translation hook

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <Church className="text-primary" size={iconSize} />
      <span className={`font-headline font-semibold ${textSize} text-primary`}>
        {t('appName')} {/* Translate appName */}
      </span>
    </Link>
  );
};

export default Logo;
