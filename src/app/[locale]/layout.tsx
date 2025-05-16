export async function generateStaticParams() {
  const languages = ["en", "fr", "ar"];
 
  return languages.map((locale) => ({
    locale,
  }));
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
