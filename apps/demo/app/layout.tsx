import type { Metadata } from 'next';
import { site } from '~/data/constants';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  icons: site.icon,
  openGraph: {
    title: site.name,
    description: site.description,
    images: 'https://opengraph.githubassets.com',
    url: site.url,
  },
};

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: '0' }}>
        {children}
      </body>
    </html>
  );
}
