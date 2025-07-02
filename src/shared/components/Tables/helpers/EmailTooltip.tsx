import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";

export default function EmailTooltip({ email }) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={350}>
        <TooltipTrigger>
          <span className="bg-hoverRed p-1 px-3 rounded-md font-semibold text-black text-sm cursor-pointer">
            {email} ⚠️
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-white">
          <p className="font-semibold">
            {" "}
            ❌ This email is not registered as part of your team
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
