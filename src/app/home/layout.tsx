import { ReactNode } from "react";
import { Navbar, Sidebar } from "@/components";
import { Layout } from "@/common";
import { Aside } from "@/components/Aside";
import AlertProvider from "@/components/Alerts/AlertProvider";
import { TenantProvider } from "@/providers";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <TenantProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <section className="flex flex-col flex-grow w-[90%] h-[100vh] max-h-[100vh] overflow-y-auto">
          <Navbar />
          <Layout>{children}</Layout>
          <Aside />
          <AlertProvider />
        </section>
      </div>
    </TenantProvider>
  );
}
