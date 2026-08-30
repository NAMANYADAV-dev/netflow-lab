'use client';

import { useEffect, useState } from 'react';
import styles from './lab.module.css';

const scenes = [
  {
    id: 'unicast',
    name: 'Unicast',
    description: 'One sender, one recipient—the reply returns to PC-A alone.',
    recipients: [0],
    tone: 'green',
  },
  {
    id: 'broadcast',
    name: 'Broadcast',
    description: 'The switch floods the frame to every host in the broadcast domain.',
    recipients: [0, 1, 2, 3, 4, 5],
    tone: 'cyan',
  },
  {
    id: 'multicast',
    name: 'Multicast',
    description: 'Only hosts subscribed to the group receive the packet.',
    recipients: [0, 2, 4],
    tone: 'purple',
  },
] as const;

const hosts = [
  { x: 42, y: 205, label: 'B' },
  { x: 101, y: 216, label: 'C' },
  { x: 160, y: 222, label: 'D' },
  { x: 220, y: 222, label: 'E' },
  { x: 279, y: 216, label: 'F' },
  { x: 338, y: 205, label: 'G' },
] as const;

export default function LabTopology() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const scene = scenes[sceneIndex];

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const timer = window.setInterval(
      () => setSceneIndex((index) => (index + 1) % scenes.length),
      12000,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={styles.topologyCard}>
      <div className={styles.topologyBar}>
        <span className={styles.signalMark} aria-hidden="true">
          <span />
          <span />
        </span>
        <span className={styles.terminalLabel}>netflow-lab · {scene.id}</span>
        <span className={styles.liveLabel}>● live</span>
      </div>

      <div className={styles.topologyBody} data-tone={scene.tone}>
        <svg
          key={scene.id}
          viewBox="0 0 380 250"
          role="img"
          aria-label={`${scene.name} packet topology`}
        >
          <line x1="78" y1="54" x2="158" y2="54" className={styles.baseLine} />
          <line x1="78" y1="54" x2="158" y2="54" className={styles.flowLine} />

          {hosts.map((host, index) => {
            const active = scene.recipients.includes(index as never);
            const branchPath = `M 190 67 L ${host.x} ${host.y - 18}`;
            const packetPath = `M 78 54 L 190 54 L ${host.x} ${host.y - 18}`;
            return (
              <g key={host.label}>
                <path d={branchPath} className={active ? styles.activeBranch : styles.baseLine} />
                {active && <path d={branchPath} className={styles.flowLine} />}
                <g transform={`translate(${host.x - 16} ${host.y - 14})`}>
                  {active && <rect x="-3" y="-3" width="38" height="34" rx="6" className={styles.nodeLit} />}
                  <rect
                    width="32"
                    height="28"
                    rx="4"
                    className={active ? styles.activeNode : styles.node}
                  />
                  <text x="16" y="18" textAnchor="middle" className={styles.nodeText}>
                    {host.label}
                  </text>
                </g>
                {active && (
                  <>
                    <rect
                      width="24"
                      height="11"
                      rx="2"
                      className={styles.packet}
                      style={{ offsetPath: `path('${packetPath}')` }}
                    />
                    <g
                      transform={`translate(${host.x} ${host.y - 38})`}
                      className={styles.folderReceipt}
                      data-received-folder={host.label}
                      aria-hidden="true"
                    >
                      <g className={styles.receivedFolder}>
                        <path d="M-11-6H-4L-1-3H11V8H-11Z" className={styles.folderBack} />
                        <rect x="-4" y="-11" width="8" height="7" rx="1" className={styles.folderPayload} />
                        <path d="M-11-1H11L9 9H-9Z" className={styles.folderFront} />
                      </g>
                      <g className={styles.savedMark}>
                        <circle r="10" />
                        <path d="M-4 0L-1 3L5-4" />
                      </g>
                    </g>
                  </>
                )}
              </g>
            );
          })}

          <g transform="translate(32 40)">
            <rect width="46" height="28" rx="4" className={styles.sourceNode} />
            <text x="23" y="18" textAnchor="middle" className={styles.nodeText}>
              PC-A
            </text>
          </g>
          <g transform="translate(158 40)">
            <rect width="64" height="28" rx="4" className={styles.switchNode} />
            <text x="32" y="18" textAnchor="middle" className={styles.nodeText}>
              SWITCH
            </text>
          </g>
          {scene.id === 'unicast' && (
            <rect
              width="22"
              height="10"
              rx="2"
              className={styles.replyPacket}
              style={{ offsetPath: "path('M 42 187 L 190 54 L 78 54')" }}
            />
          )}
          {scene.id === 'broadcast' && (
            <circle cx="190" cy="54" r="4" className={styles.broadcastRing} />
          )}
        </svg>

        <div className={styles.sceneFooter}>
          <div>
            <strong>{scene.name}</strong>
            <p>{scene.description}</p>
          </div>
          <div className={styles.sceneDots} aria-label="Choose topology scene">
            {scenes.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={index === sceneIndex ? styles.sceneDotActive : styles.sceneDot}
                onClick={() => setSceneIndex(index)}
                aria-label={`Show ${item.name}`}
                aria-pressed={index === sceneIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
