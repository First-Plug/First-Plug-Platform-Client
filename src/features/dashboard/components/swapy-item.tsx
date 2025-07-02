import { ReactNode } from "react";

export const SwapyItem = ({
  children,
  id,
}: {
  children: ReactNode;
  id: string;
}) => {
  return (
    <div className="h-full slot" data-swapy-slot={id}>
      <div className="h-full item" data-swapy-item={id}>
        <div className="h-full">{children}</div>
      </div>
    </div>
  );
};
