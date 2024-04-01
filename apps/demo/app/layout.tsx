import '~/styles/globals.css';
import type { Metadata } from 'next';
import { site } from '~/data/constants';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  icons: site.icon,
};

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
