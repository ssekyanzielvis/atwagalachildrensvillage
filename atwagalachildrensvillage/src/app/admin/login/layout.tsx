export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout bypasses the admin authentication layout
  // so the login page can be displayed without authentication
  return <>{children}</>;
}
