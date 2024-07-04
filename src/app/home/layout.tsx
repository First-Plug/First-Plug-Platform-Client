import { ReactNode } from "react";
import { Navbar, Sidebar } from "@/components";
import { Layout } from "@/common";
import DataProvider from "./DataProvider";
import { Aside } from "@/components/Aside";
import AlertProvider from "@/components/Alerts/AlertProvider";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <DataProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <section className="flex flex-col w-[90%] flex-grow   h-[100vh] max-h-[100vh]  ">
          <Navbar />
          <Layout>{children}</Layout>
          <Aside />
          <AlertProvider />
        </section>
      </div>
    </DataProvider>
  );
}
