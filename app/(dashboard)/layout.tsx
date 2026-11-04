import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getCaller } from "@/lib/auth/requireAdmin";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isAdmin } = await getCaller();

  const userName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    null;

  return (
    <DashboardShell
      isAdmin={isAdmin}
      userEmail={user?.email}
      userName={userName}
      avatarUrl={user?.user_metadata?.avatar_url as string | undefined}
    >
      {children}
    </DashboardShell>
  );
}
