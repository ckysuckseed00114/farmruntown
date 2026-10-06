import type { Metadata } from 'next';
import { Outfit, Prompt } from 'next/font/google';
import './globals.css';
import BackgroundAtmosphere from '@/components/BackgroundAtmosphere';

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'RUNTOWN | ระบบคำนวณฟาร์มหมู',
  description: 'Website คำนวณการฟาร์มหมู เมือง:RUNTOWN',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${prompt.variable} ${outfit.variable}`}>
      <body>
        <BackgroundAtmosphere />
        {children}
      </body>
    </html>
  );
}
