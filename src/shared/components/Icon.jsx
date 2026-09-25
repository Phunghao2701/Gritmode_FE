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
export default function Icon({ icon, className = '', ...props }) {
  return <IconifyIcon icon={icon} className={className} {...props} />;
}
