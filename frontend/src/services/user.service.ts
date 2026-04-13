import axiosInstance from "../core/api/axiosInstance";
import { userEndpoints } from "../core/api/endpoints";
import type { UserProfilePatch } from "../types/api";

const userService = {
  async patchProfile(body: UserProfilePatch) {
    const { data } = await axiosInstance.patch(userEndpoints.me, body);
    return data;
  },
};

export default userService;
