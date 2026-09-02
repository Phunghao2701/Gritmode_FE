import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import PolicyLayout from '../components/PolicyLayout';
import { POLICIES_DATA } from '../data/policies.data';

export default function PolicyPage({ policySlug: propSlug }) {
  const { slug: paramSlug } = useParams();
  const activeSlug = propSlug || paramSlug || 'return';

  const policy = POLICIES_DATA[activeSlug];

  if (!policy) {
    return <Navigate to="/policies/return" replace />;
  }

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
