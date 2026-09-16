import React from 'react';
import { Camera, Crosshair, Cpu, Bot, Server, Cloud } from 'lucide-react';
import { useHardwareStatus, useStats } from '@/hooks';
import { LoadingSkeleton, ErrorState, EmptyState } from '@/components/ui';
import HardwareChip from './HardwareChip';
import { formatRelativeTime } from '@/utils';
import type { HardwareStatusValue } from '@/types';
import './HardwareStatusGrid.css';

export default function HardwareStatusGrid() {
  const { status, isLoading, error, refetch } = useHardwareStatus();
  const { error: statsError, lastUpdated: statsLastUpdated } = useStats();

  const getBackendStatus = (): HardwareStatusValue => {
    if (statsLastUpdated && !statsError) return 'online';
    if (statsError) return 'offline';
    return 'unknown';
  };

  if (isLoading && !status) {
    return (
      <div className="hardware-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: '100px' }}>
            <LoadingSkeleton variant="card" />
          </div>
        ))}
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="hardware-error">
        <ErrorState title="Hardware Telemetry Failed" message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="hardware-empty">
        <EmptyState 
          icon={Cpu}
          title="Hardware telemetry pending" 
        />
      </div>
    );
  }

  const { camera, panTilt, edgeDevice, agent, backend, cloud } = status;

  return (
    <div className="hardware-grid">
      <HardwareChip 
        icon={Camera}
        name={camera.name}
        status={camera.status}
        metadata={camera.lastSeen ? formatRelativeTime(camera.lastSeen, new Date()) : undefined}
      />
      <HardwareChip 
        icon={Crosshair}
        name={panTilt.name}
        status={panTilt.status}
        metadata={panTilt.lastPosition ? `Pan ${panTilt.lastPosition.pan}° · Tilt ${panTilt.lastPosition.tilt}°` : undefined}
      />
      <HardwareChip 
        icon={Cpu}
        name={edgeDevice.name}
        status={edgeDevice.status}
        metadata={`CPU ${edgeDevice.cpuUsage}% · MEM ${edgeDevice.memUsage}%`}
      />
      <HardwareChip 
        icon={Bot}
        name={agent.name}
        status={agent.status}
        metadata={agent.lastDecision ? `Last decision ${formatRelativeTime(agent.lastDecision, new Date())}` : undefined}
      />
      <HardwareChip 
        icon={Server}
        name={backend.name}
        status={getBackendStatus()}
      />
      <HardwareChip 
        icon={Cloud}
        name={cloud.name}
        status={cloud.status}
      />
    </div>
  );
}
