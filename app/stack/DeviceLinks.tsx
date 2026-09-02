import Link from 'next/link';
import { Fragment } from 'react';
import type { DeviceLink } from '@/lib/stack-data';
import styles from './stack.module.css';

/* The trailing "· Router, L3 switch" on a layer's examples line. It lives in
   its own file because the chart renders it from a Client Component and the
   detail list renders it from the page's Server Component, and duplicating it
   would be two places to fix a link. */
export default function DeviceLinks({ devices }: { devices?: DeviceLink[] }) {
  if (!devices?.length) return null;
  return (
    <>
      {' · '}
      {devices.map((d, i) => (
        <Fragment key={d.label}>
          {i > 0 && ', '}
          <Link href={d.href} className={styles.deviceLink}>
            {d.label}
          </Link>
        </Fragment>
      ))}
    </>
  );
}
