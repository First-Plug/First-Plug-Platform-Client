import { useMemo } from "react";
import {
  AssetsWidget,
  ComputerUpdatesWidget,
  LatestActivityWidget,
  MembersByCountryWidget,
  UpcomingBirthdaysWidget,
  SwapyItem,
} from "@/features/dashboard";

import { LoggedInUser, ProductTable } from "@/types";
import { Member } from "@/features/members";
import { Datum } from "@/features/activity";

interface Props {
  sortedWidgets: string[];
  assets: ProductTable[];
  user: LoggedInUser;
  members: Member[];
  activityLatest: Datum[];
}

export const Widgets = ({
  sortedWidgets,
  assets,
  user,
  members,
  activityLatest,
}: Props) => {
  const widgetsMap: Record<string, JSX.Element> = useMemo(
    () => ({
      "my-assets": <AssetsWidget assets={assets} user={user} />,
      "computer-updates": <ComputerUpdatesWidget assets={assets} user={user} />,
      "upcoming-birthdays": (
        <UpcomingBirthdaysWidget members={members} user={user} />
      ),
      "members-by-country": <MembersByCountryWidget members={members} />,
      "latest-activity": <LatestActivityWidget history={activityLatest} />,
    }),
    [assets, user, members, activityLatest]
  );

  return (
    <>
      {sortedWidgets.map((id) => (
        <SwapyItem key={id} id={id}>
          <div className="h-[42vh]">{widgetsMap[id]}</div>
        </SwapyItem>
      ))}
    </>
  );
};
