import { PageLayout } from "@/common";
import HistoryTable from "@/action-history/components/table/HistoryTable";
import { HistorialServices } from "@/action-history/services";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ActionHistoryPage() {
  const startDate = startOfDay(subDays(new Date(), 7)).toISOString();
  const endDate = endOfDay(new Date()).toISOString();
  const session = await getServerSession(authOptions);

  const initialData = await HistorialServices.getAllServerSide(
    1,
    10,
    startDate,
    endDate,
    session.backendTokens.accessToken
  );

  return (
    <PageLayout>
      <HistoryTable initialData={initialData} />
    </PageLayout>
  );
}
