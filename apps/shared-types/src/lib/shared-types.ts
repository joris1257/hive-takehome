export interface CpuUsage {
  cpuUsage: number;
  timeStamp: string;
}

export interface CpuRequest {
  userId: string;
  cpuUsage: CpuUsage[];
}
