import axiosInstance from "../core/api/axiosInstance";
import { routingEndpoints } from "../core/api/endpoints";
import type { RouteCalculateBody, RouteCalculated } from "../types/api";

const routingService = {
  async calculate(body: RouteCalculateBody): Promise<RouteCalculated> {
    const { data } = await axiosInstance.post<RouteCalculated>(routingEndpoints.calculate, body);
    return data;
  },

  async fetchById(routeId: string): Promise<RouteCalculated> {
    const { data } = await axiosInstance.get<RouteCalculated>(routingEndpoints.byId(routeId));
    return data;
  },
};

export default routingService;
