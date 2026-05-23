import './globals.css';

export const metadata = {
  title: 'Daily Content Generator',
  description: 'Upload a document and generate marketing content with an ADK agent pipeline.',
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
