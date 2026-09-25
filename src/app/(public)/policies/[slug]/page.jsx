import PolicyPage from '@/features/policies/pages/PolicyPage';


export default async function Page({ params }) {
  const { slug } = await params;
  return <PolicyPage policySlug={slug} />;
}
