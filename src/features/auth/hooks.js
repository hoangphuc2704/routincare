import { useMemo } from 'react';
import { getAccessToken, getUser } from '../../utils/tokenService';

export function useAuthState() {
  return useMemo(() => {
    const token = getAccessToken();
    const user = getUser();
    return {
      isAuthenticated: Boolean(token),
      token,
      user,
    };
  }, []);
}
