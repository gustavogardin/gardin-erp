import Sidebar from "@/components/Sidebar";
import { getCurrentProfile } from "@/lib/profile";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <div className="flex bg-gardin-black min-h-screen print:bg-white">
      <Sidebar userName={profile?.fullName ?? ""} />
      <main className="flex-1 p-6 md:p-8 print:p-0">{children}</main>
    </div>
  );
}
