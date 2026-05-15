import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import SiswaDashboardClient from "./SiswaDashboardClient";

export default async function DashboardSiswaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as { name?: string; email?: string; id?: string; role?: string };
  if (user.role !== "siswa" && user.role !== "admin") redirect("/login");

  return (
    <SiswaDashboardClient
      user={{ name: user.name ?? "", id: user.id ?? "", email: user.email ?? "" }}
    />
  );
}
