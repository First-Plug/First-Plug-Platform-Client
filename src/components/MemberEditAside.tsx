"use client";
import { Button, Input, DropdownInput } from "@/common";
import { TrashIcon } from "@/common/Icons";
import { useStore } from "@/models/root.store";
import { observer } from "mobx-react-lite";
import Photo from "../../public/employees/member.jpg";
import Image from "next/image";

interface MemberEditAsideProps {
  className?: string;
}

export const MemberEditAside = observer(function ({
  className,
}: MemberEditAsideProps) {
  const { members } = useStore();
  const member = members.selectedMember;

  return (
    <div className={`flex flex-col gap-6 pr-4 pb-10 ${className}`}>
      <div className="flex gap-4">
        <div className="relative w-36 h-36">
          <Image
            src={member.picture || Photo}
            alt="Colaborator"
            fill
            className="object-cover"
          />
        </div>
        <div className="w-[75%] flex flex-col gap-4">
          <Input title="Name" />
          <Input title="Lastname" />
        </div>
      </div>
      <Input title="Date of Birth" type="Date" />
      <div className="flex gap-4">
        <Input title="Phone Number" type="tel" className="w-1/2" />
        <Input title="Email Address" type="email" className="w-1/2" />
      </div>

      <h3 className="text-lg text-black font-inter  font-semibold border-t pt-4">
        Employee Information
      </h3>

      <DropdownInput title="Select Team" />
      <p>Does the theam not exist yet?</p>

      <Input title="Job position" className="pr-4" />

      <div className=" border-t flex justify-between items-center">
        <h3 className="text-lg text-black font-inter font-semibold pt-4">
          Shipment Details
        </h3>
        <span className="pt-4">Complete</span>
      </div>

      <div className="flex gap-4">
        <DropdownInput title="City" />
        <DropdownInput title="State" />
      </div>

      <div className="flex gap-1">
        <Input title="Zip code" className="w-1/6" />
        <Input title="Address" className="w-3/6" />
        <Input title="Appartament, Suite, etc." className="w-2/6" />
      </div>

      <div className="flex gap-4">
        <Input title="Joining Date" type="Date" className="w-1/2" />
        <DropdownInput title="Time slot for delivery" />
      </div>

      <div className="flex flex-col gap-1 m-auto w-[98%]">
        <label className="block text-dark-grey font-sans">
          Additional Information
        </label>
        <textarea
          name=""
          id=""
          cols={30}
          rows={5}
          placeholder="Comments..."
          className="border-2 p-2"
        ></textarea>
      </div>

      <div className="flex justify-end">
        <Button
          icon={
            <TrashIcon
              strokeWidth={2}
              className="text-error y w-[1.2rem] h-[1.2rem]"
            />
          }
          body="Delete Member"
          className="text-error text-md font-bold"
        />
      </div>

      <div className="fixed bottom-5 w-[85%]">
        <Button
          body="Save "
          variant="primary"
          size="big"
          className="w-full rounded-md"
        />
      </div>
    </div>
  );
});
