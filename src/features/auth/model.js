import { normalizeUser } from '../../entities/user/model';

export function toAuthSession(payload = {}) {
  return {
    accessToken: payload.accessToken || payload.data?.accessToken || null,
    refreshToken: payload.refreshToken || payload.data?.refreshToken || null,
    user: normalizeUser(payload.user || payload.data?.user || payload.data || payload),
  };
}
