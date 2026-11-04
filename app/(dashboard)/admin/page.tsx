import { notFound } from "next/navigation";

import { AdminUsers } from "@/components/admin/AdminUsers";
import { getCaller } from "@/lib/auth/requireAdmin";

export const metadata = { title: "Admin | LeadScope AI", robots: { index: false } };

export default async function AdminPage() {
  const { user, isAdmin } = await getCaller();
  // Anyone who is not an admin sees an ordinary "not found": the area does not advertise itself.
  if (!user || !isAdmin) notFound();

  return (
    <div className="mx-auto w-full max-w-container-max">
      <div className="mb-8">
        <h1 className="text-display-lg-mobile tracking-tight text-on-surface md:text-display-lg">Admin</h1>
        <p className="mt-2 text-body-base text-on-surface-variant">
          Invite people, choose their plan, and see how much of it they have used.
        </p>
      </div>
      <AdminUsers currentUserId={user.id} />
    </div>
  );
}
