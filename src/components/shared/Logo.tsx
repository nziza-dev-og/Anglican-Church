
import Link from 'next/link';
import { Church } from 'lucide-react'; // Using Church icon as a placeholder
import { APP_NAME } from '@/lib/constants';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

const Logo = ({ className, iconSize = 24, textSize = "text-xl" }: LogoProps) => {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <Church className="text-primary" size={iconSize} />
      <span className={`font-headline font-semibold ${textSize} text-primary`}>
        {APP_NAME}
      </span>
    </Link>
  );
};

export default Logo;
