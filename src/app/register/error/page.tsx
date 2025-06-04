import { EmptyCard, EmptyCardLayout } from "@/shared";
import { Navbar } from "@/components";

export default function ErrorRegistration() {
  return (
    <>
      <Navbar title="logo" />

      <div className="flex flex-col justify-center items-center gap-8 shadow-md mx-[40px] my-[32px] border border-boder rounded-lg h-[100vh]">
        <EmptyCardLayout>
          <EmptyCard type="registererror" />
        </EmptyCardLayout>
      </div>
    </>
  );
}
