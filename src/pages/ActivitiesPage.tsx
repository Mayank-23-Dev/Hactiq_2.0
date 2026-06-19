import { Layout } from "../app/components/Layout";
import { RecentActivity } from "../app/components/RecentActivity";

export default function ActivitiesPage() {
  return (
    <Layout title="Activities">
      <div className="p-6 max-w-4xl mx-auto">
        <RecentActivity limit={50} showSeeAll={false} />
      </div>
    </Layout>
  );
}
