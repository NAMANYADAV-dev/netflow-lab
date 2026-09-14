'use client';

import { BellRinging, Desktop, EnvelopeSimple, HardDrives, Key, LockKey, Siren } from '@phosphor-icons/react';
import type { Scenario, SnmpStep } from './snmp-data';
import styles from './snmp-lab.module.css';

/* The whole exchange as two machines and one message between them.

   Everything a beginner needs is visible without reading a label: which
   machine is talking (it lights up and speaks), which way the message is
   going (it travels), and what kind of message it is (an envelope for a
   question or answer, a lock once it is encrypted, a bell for an alarm). */
export default function SnmpStage({ sc, step, current, tick }: {
  sc: Scenario;
  step: number;
  current: SnmpStep | null;
  tick: number;
}) {
  const poll = sc === 'poll';
  const flow = current?.flow;
  const toRouter = flow === 'req';
  const alarm = flow === 'trap';
  const tone = flow === 'req' ? 'b' : flow === 'resp' ? 'a' : flow === 'trap' ? 'rst' : 'idle';
  const serverTalks = flow === 'req';
  const routerTalks = flow === 'resp' || flow === 'trap';
  const portDown = poll && step >= 7;
  const Message = alarm ? BellRinging : current?.sealed ? LockKey : EnvelopeSimple;

  return (
    <div className={styles.stage} data-tone={tone}>
      {/* ------------------------------------------------ monitoring server */}
      <div className={styles.device} data-active={serverTalks || undefined}>
        {current && serverTalks && (
          <div key={`bubble-${sc}-${step}-${tick}`} className={styles.bubble}>{current.callout}</div>
        )}
        <div className={styles.deviceIcon}><Desktop weight="duotone" size={48} /></div>
        <strong className={styles.deviceName}>Monitoring server</strong>
        <code className={styles.deviceAddr}>10.0.0.50</code>
        <span className={styles.deviceRole}>asks the questions</span>

        <div className={styles.badges}>
          {poll && step >= 6 && <span className={styles.badge} data-tone="ok">45 Mbit/s on Gi0/2</span>}
          {portDown && <span className={styles.badge} data-tone="rst"><Siren weight="fill" size={13} /> alarm received</span>}
          {!poll && step >= 2 && <span className={styles.badge} data-tone="ok"><Key weight="fill" size={13} /> knows the router’s ID</span>}
        </div>
      </div>

      {/* ------------------------------------------------------- the wire */}
      <div className={styles.track}>
        {current ? (
          <>
            <div className={styles.trackTop}>
              <span className={styles.pill}>{current.label}</span>
              <code className={styles.tag}>{current.tag}</code>
            </div>
            <div className={styles.rail} data-dir={toRouter ? 'right' : 'left'}>
              <span className={styles.railLine} />
              <span key={`packet-${sc}-${step}-${tick}`} className={styles.packet} data-dir={toRouter ? 'right' : 'left'}>
                <Message weight="fill" size={22} />
              </span>
            </div>
            <div className={styles.trackMeta}>
              <span>{toRouter ? 'server → router' : 'router → server'}</span>
              <span className={styles.port} data-alarm={alarm || undefined}>UDP {alarm ? 162 : 161}</span>
            </div>
          </>
        ) : (
          <div className={styles.trackIdle}>
            <EnvelopeSimple weight="duotone" size={26} />
            <span>Nothing sent yet — press <b>Next</b></span>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------- router */}
      <div className={styles.device} data-active={routerTalks || undefined}>
        {current && routerTalks && (
          <div key={`bubble-${sc}-${step}-${tick}`} className={styles.bubble}>{current.callout}</div>
        )}
        <div className={styles.deviceIcon}><HardDrives weight="duotone" size={48} /></div>
        <strong className={styles.deviceName}>Router</strong>
        <code className={styles.deviceAddr}>10.0.0.1</code>
        <span className={styles.deviceRole}>answers, and raises alarms</span>

        <div className={styles.ports} aria-label="Router ports">
          {['Gi0/0', 'Gi0/1', 'Gi0/2'].map((name, index) => {
            const down = portDown && index === 2;
            return (
              <span key={name} data-state={down ? 'down' : 'up'} title={`${name} ${down ? 'down' : 'up'}`}>
                <i />
                {name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
