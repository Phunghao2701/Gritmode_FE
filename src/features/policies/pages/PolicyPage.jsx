'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PolicyLayout from '../components/PolicyLayout';
import { POLICIES_DATA } from '../data/policies.data';

export default function PolicyPage({ policySlug: propSlug }) {
  const router = useRouter();
  const params = useParams();
  const activeSlug = propSlug || params?.slug || params?.type || 'return';

  const policy = POLICIES_DATA[activeSlug];

  useEffect(() => {
    if (!policy) {
      router.replace('/policies/return');
    }
  }, [policy, router]);

  if (!policy) return null;

  return (
    <PolicyLayout
      title={policy.title}
      subtitle={policy.subtitle}
      lastUpdated={policy.lastUpdated}
      tableOfContents={policy.tableOfContents}
      sections={policy.sections}
      activeSlug={activeSlug}
    />
  );
}
