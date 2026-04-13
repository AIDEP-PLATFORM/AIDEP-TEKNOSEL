import axiosInstance from "../core/api/axiosInstance";
import { damageEndpoints } from "../core/api/endpoints";
import type { DamageReport, DamageReportListResponse } from "../types/api";

const damageService = {
  async fetchAll(params?: {
    skip?: number;
    limit?: number;
    severity_min?: number;
    report_status?: string;
  }): Promise<DamageReportListResponse> {
    const { data } = await axiosInstance.get<DamageReportListResponse>(damageEndpoints.base, {
      params,
    });
    return data;
  },

  async fetchById(id: string): Promise<DamageReport> {
    const { data } = await axiosInstance.get<DamageReport>(damageEndpoints.byId(id));
    return data;
  },
};

export default damageService;
