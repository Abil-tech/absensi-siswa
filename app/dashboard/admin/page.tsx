import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as { name?: string; email?: string; role?: string };
  if (user.role !== "admin") redirect("/login?error=unauthorized");

  return <AdminDashboardClient user={{ name: user.name ?? "", email: user.email ?? "" }} />;
}
