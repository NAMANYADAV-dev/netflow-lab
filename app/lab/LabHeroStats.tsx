import { labs } from '@/lib/lab-data';
import styles from './lab.module.css';

/* Catalogue facts that are the same for every visitor. */

const readyCount = labs.filter((lab) => lab.status === 'Ready').length;

/* the layer strings read "Layer 4 · Reliable transport"; the half before the
   separator is the layer itself, and HTTPS spans two, hence the set */
const layerCount = new Set(labs.map((lab) => lab.layer.split('·')[0].trim())).size;

const stats: [string, string][] = [
  [String(readyCount), 'labs ready to run'],
  [String(layerCount), 'layers of the stack covered'],
  ['3', 'depth modes per lab'],
];

export default function LabHeroStats() {
  return (
    <div className={styles.heroStats}>
      {stats.map(([value, label]) => (
        <div key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
