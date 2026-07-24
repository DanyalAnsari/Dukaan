import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading" aria-busy="true">
      <div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72" /></div>
      <div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((key) => <Card key={key}><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>)}</div>
      <Card><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent className="space-y-3">{[1, 2, 3, 4, 5].map((key) => <Skeleton key={key} className="h-10 w-full" />)}</CardContent></Card>
    </div>
  );
}
