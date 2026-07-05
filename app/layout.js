export const metadata = {
  title: "NEST",
  description: "Hello world",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
