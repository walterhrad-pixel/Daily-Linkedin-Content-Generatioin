import './globals.css';

export const metadata = {
  title: 'Yaya Daily - Content Engine',
  description: 'AI-generated humanized LinkedIn posts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
