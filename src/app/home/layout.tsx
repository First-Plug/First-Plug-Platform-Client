import { ReactNode } from "react";

import { TenantProvider } from "@/providers";
import { Sidebar, Navbar, Layout, AlertProvider, Aside } from "@/shared";

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
