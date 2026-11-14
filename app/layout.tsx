import type { Metadata } from 'next';
import '@fontsource-variable/plus-jakarta-sans';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'JoraIQ.AI · Learn, practice, measure',
  description: 'Quizzes for teachers and students, with live analytics and leaderboards.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
