/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: shared\components\Icon.jsx
 */
import { Icon as IconifyIcon } from '@iconify/react';

/**
 * A reusable Icon component wrapping Iconify.
 * Allows using any icon from Iconify sets (e.g., 'lucide:search', 'mdi:earth').
 *
 * @param {string} icon - The icon name (e.g. 'lucide:search')
 * @param {string} className - Optional tailwind classes
 */
export default function Icon({ icon, name, className = '', ...props }) {
  const iconName = icon || name;
  return <IconifyIcon icon={iconName} className={className} {...props} />;
}
