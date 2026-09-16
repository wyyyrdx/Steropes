import type { HardwareStatus } from '@/types';

export const mockHardwareStatus: HardwareStatus = {
  camera: { name: "CAM-01", status: "online", lastSeen: "2026-09-16T10:30:00Z" },
  panTilt: { name: "PTZ-01", status: "standby", lastPosition: { pan: 0, tilt: 0 } },
  edgeDevice: { name: "Pi-5-001", status: "online", cpuUsage: 34, memUsage: 58 },
  agent: { name: "Decision Agent", status: "running", lastDecision: "2026-09-16T10:30:00Z" },
  backend: { name: "AWS Lambda", status: "online" },
  cloud: { name: "Amazon Bedrock", status: "standby" },
};
