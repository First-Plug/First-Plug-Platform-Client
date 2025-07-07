import { Member, useMemberStore } from "@/features/members";
import {
  Button,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  useAsideStore,
} from "@/shared";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { DeleteAction } from "@/shared/components/Alerts/delete-actions";
import { ElipsisVertical } from "@/shared/icons/icons";
import { PenIcon } from "@/shared/icons/icons";

export const ActionsTableMembers = ({ member }: { member: Member }) => {
  const { setSelectedMember } = useMemberStore();

  const { setAside } = useAsideStore();
  const handleEdit = () => {
    setSelectedMember(member);
    setAside("EditMember");
  };

  const handleViewDetail = () => {
    setSelectedMember(member);
    setAside("MemberDetails");
  };

  const isEditDisabled = (member as any).hasOnTheWayShipment === true;
  const isDeleteDisabled = member.activeShipment === true;

  return (
    <div className="flex justify-end items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="text"
                onClick={handleEdit}
                disabled={isEditDisabled}
                className="hover:bg-transparent"
                icon={
                  <PenIcon
                    strokeWidth={2}
                    className={`
                    w-[1.2rem] 
                    h-[1.2rem] 
                    ${
                      isEditDisabled
                        ? "text-disabled"
                        : "text-blue hover:text-blue/80"
                    }
                  `}
                  />
                }
              />
            </div>
          </TooltipTrigger>

          {isEditDisabled && (
            <TooltipContent
              side="bottom"
              align="end"
              className="z-50 bg-blue/80 p-2 rounded-md font-normal text-white text-xs"
            >
              Members involved in a shipment that&apos;s &quot;On the way&quot;
              cannot be edited.
              <TooltipArrow className="fill-blue/80" />
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DeleteAction
                type="member"
                id={member._id}
                disabled={isDeleteDisabled}
              />
            </div>
          </TooltipTrigger>
          {isDeleteDisabled && (
            <TooltipContent
              side="bottom"
              align="end"
              className="z-50 bg-blue/80 p-2 rounded-md font-normal text-white text-xs"
            >
              Members with active shipments cannot be deleted.
              <TooltipArrow className="fill-blue/80" />
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <div>
        <Button
          variant="text"
          onClick={() => handleViewDetail()}
          className="hover:bg-transparent"
          icon={
            <ElipsisVertical
              strokeWidth={2}
              className="w-[1.2rem] h-[1.2rem] text-dark-grey hover:text-dark-grey/80"
            />
          }
        />
      </div>
    </div>
  );
};
