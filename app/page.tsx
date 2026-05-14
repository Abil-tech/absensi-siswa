import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as any)?.role;
  if (role === "admin") redirect("/dashboard/admin");
  else if (role === "walas") redirect("/dashboard/walas");
  else if (role === "bk") redirect("/dashboard/bk");
  else redirect("/dashboard/siswa");
}
