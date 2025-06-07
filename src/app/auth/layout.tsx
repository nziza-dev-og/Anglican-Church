"use client";
import type { ReactNode } from 'react';
// AuthLayout will be implicitly used by page.tsx files setting a title.
// No need for explicit AuthLayout here, pages will use it.

export default function AuthPagesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
