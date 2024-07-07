import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function EmailTooltip({ email }) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={350}>
        <TooltipTrigger>
          <span className="cursor-pointer  font-semibold  text-sm bg-hoverRed p-1 px-3 rounded-md text-black ">
            {email} ⚠️
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-white">
          <p className=" font-semibold ">
            {" "}
            ❌ This email is not registered as part of your team
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
