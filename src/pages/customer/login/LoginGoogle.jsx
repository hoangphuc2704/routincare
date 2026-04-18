// import React, {
//   forwardRef,
//   useImperativeHandle,
//   useCallback,
//   useState,
//   useRef,
//   useEffect,
// } from 'react';
// import authApi from '../../../services/api/authApi';
// import { message } from 'antd';
// import { useNavigate } from 'react-router-dom';

// function GoogleButton(props, ref) {
//   const navigate = useNavigate();
//   const [showFallback, setShowFallback] = useState(false);
//   const fallbackRef = useRef(null);
//   const isInitialized = useRef(false);
//   const isPromptActive = useRef(false);

//   const handleCredentialResponse = useCallback(
//     async (response) => {
//       isPromptActive.current = false;
//       try {
//         if (!response?.credential) {
//           throw new Error('No credential received from Google');
//         }

//         const loginData = {
//           idToken: response.credential,
//         };

//         const res = await authApi.loginWithGoogle(loginData);

//         if (res.data?.success === false) {
//           throw new Error(res.data?.message || 'Unauthorized');
//         }

//         const userData = res.data?.data || res.data;

//         if (!userData?.accessToken) {
//           throw new Error('No access token received');
//         }

//         localStorage.setItem('accessToken', userData.accessToken);
//         if (userData.refreshToken) {
//           localStorage.setItem('refreshToken', userData.refreshToken);
//         }

//         const user = {
//           userId: userData.userId || userData.id,
//           fullName: userData.fullName || userData.name,
//           email: userData.email,
//           roleId: userData.roleId,
//           roleName: userData.roleName || userData.role,
//           avatar: userData.avatar,
//         };

//         localStorage.setItem('user', JSON.stringify(user));
//         message.success('Đăng nhập Google thành công');

//         const isAdmin = user.roleName?.toLowerCase() === 'admin';
//         navigate(isAdmin ? '/admin' : '/home', { replace: true });
//       } catch (err) {
//         console.error('Login error detail:', err.response?.data || err.message);
//         const errorMsg = err.response?.data?.message || 'Đăng nhập Google thất bại!';
//         message.error(errorMsg);
//       }
//     },
//     [navigate]
//   );

//   // Initialize GSI once when google script is loaded
//   useEffect(() => {
//     const tryInit = () => {
//       const google = window.google;
//       if (google && !isInitialized.current) {
//         google.accounts.id.initialize({
//           client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
//           callback: handleCredentialResponse,
//           use_fedcm_for_prompt: false,
//         });
//         isInitialized.current = true;
//       }
//     };
//     tryInit();
//     // Retry if google not loaded yet (GoogleOAuthProvider loads it async)
//     if (!isInitialized.current) {
//       const interval = setInterval(() => {
//         tryInit();
//         if (isInitialized.current) clearInterval(interval);
//       }, 300);
//       return () => clearInterval(interval);
//     }
//   }, [handleCredentialResponse]);

//   useImperativeHandle(ref, () => ({
//     triggerLogin() {
//       // Prevent multiple concurrent calls
//       if (isPromptActive.current) return;

//       const google = window.google;
//       if (!google) {
//         message.error('Google SDK chưa tải xong, vui lòng thử lại');
//         return;
//       }

//       if (!isInitialized.current) {
//         google.accounts.id.initialize({
//           client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
//           callback: handleCredentialResponse,
//           use_fedcm_for_prompt: false,
//         });
//         isInitialized.current = true;
//       }

//       isPromptActive.current = true;
//       google.accounts.id.prompt((notification) => {
//         if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
//           isPromptActive.current = false;
//           console.warn(
//             'Google One Tap not displayed:',
//             notification.getNotDisplayedReason?.() || notification.getSkippedReason?.()
//           );
//           setShowFallback(true);
//         }
//         if (notification.isDismissedMoment()) {
//           isPromptActive.current = false;
//         }
//       });
//     },
//   }));

//   // Fallback: render nút Google Sign In nếu One Tap bị chặn
//   useEffect(() => {
//     if (showFallback && fallbackRef.current && window.google) {
//       window.google.accounts.id.renderButton(fallbackRef.current, {
//         type: 'standard',
//         theme: 'outline',
//         size: 'large',
//         text: 'signin_with',
//         width: 300,
//       });
//     }
//   }, [showFallback]);

//   if (showFallback) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
//         <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
//           <p className="mb-4 text-sm text-gray-600">Nhấn để đăng nhập bằng Google</p>
//           <div ref={fallbackRef} />
//           <button
//             onClick={() => setShowFallback(false)}
//             className="mt-4 text-xs text-gray-400 hover:text-gray-600"
//           >
//             Đóng
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return null;
// }

// export default forwardRef(GoogleButton);

import React, {
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
  useRef,
  useEffect,
} from 'react';
import authApi from '../../../services/api/authApi';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { setAuthTokens, setUser } from '../../../utils/tokenService';

function GoogleButton(props, ref) {
  const navigate = useNavigate();
  const [showFallback, setShowFallback] = useState(false);
  const isInitialized = useRef(false);
  const isPromptActive = useRef(false);
  const fallbackBtnRef = useRef(null);

  const handleCredentialResponse = useCallback(
    async (response) => {
      isPromptActive.current = false;
      setShowFallback(false);
      try {
        if (!response?.credential) {
          throw new Error('No credential received from Google');
        }

        const res = await authApi.loginWithGoogle({ idToken: response.credential });

        if (res.data?.success === false) {
          throw new Error(res.data?.message || 'Unauthorized');
        }

        const userData = res.data?.data || res.data;
        const profile = userData?.user || userData;

        if (!userData?.accessToken) {
          throw new Error('No access token received');
        }

        setAuthTokens(userData.accessToken, userData.refreshToken);

        const user = {
          userId: profile.userId || profile.id,
          fullName: profile.fullName || profile.name,
          email: profile.email,
          roleId: profile.roleId,
          roleName: profile.roleName || profile.role || (Array.isArray(userData.roles) ? userData.roles[0] : undefined),
          avatar: profile.avatar,
          avatarUrl: profile.avatarUrl || profile.avatar,
        };

        setUser(user);
        message.success('Đăng nhập Google thành công');

        const isAdmin = user.roleName?.toLowerCase() === 'admin';
        navigate(isAdmin ? '/admin' : '/home', { replace: true });
      } catch (err) {
        console.error('Login error detail:', err.response?.data || err.message);
        const errorMsg = err.response?.data?.message || 'Đăng nhập Google thất bại!';
        message.error(errorMsg);
      }
    },
    [navigate]
  );

  const initGoogle = useCallback(() => {
    const google = window.google;
    if (!google || isInitialized.current) return;
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      // Dùng popup flow thay vì FedCM/One Tap để tránh bị chặn trên localhost
      ux_mode: 'popup',
      use_fedcm_for_prompt: false,
    });
    isInitialized.current = true;
  }, [handleCredentialResponse]);

  useEffect(() => {
    initGoogle();
    if (!isInitialized.current) {
      const interval = setInterval(() => {
        initGoogle();
        if (isInitialized.current) clearInterval(interval);
      }, 300);
      return () => clearInterval(interval);
    }
  }, [initGoogle]);

  // Render fallback button khi One Tap bị chặn
  useEffect(() => {
    if (showFallback && fallbackBtnRef.current && window.google) {
      // Đảm bảo đã init trước khi render button
      initGoogle();
      window.google.accounts.id.renderButton(fallbackBtnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        width: 300,
        // renderButton dùng callback đã init ở trên → không cần origin check thêm
      });
    }
  }, [showFallback, initGoogle]);

  useImperativeHandle(ref, () => ({
    triggerLogin() {
      if (isPromptActive.current) return;

      const google = window.google;
      if (!google) {
        message.error('Google SDK chưa tải xong, vui lòng thử lại');
        return;
      }

      initGoogle();

      isPromptActive.current = true;

      // Thử One Tap trước
      google.accounts.id.prompt((notification) => {
        const notDisplayed = notification.isNotDisplayed();
        const skipped = notification.isSkippedMoment();

        if (notDisplayed || skipped) {
          isPromptActive.current = false;
          const reason =
            notification.getNotDisplayedReason?.() ||
            notification.getSkippedReason?.() ||
            'unknown';
          console.warn('One Tap blocked, reason:', reason, '→ switching to fallback popup');
          // Hiện fallback button thay vì dùng FedCM popup
          setShowFallback(true);
        }

        if (notification.isDismissedMoment()) {
          isPromptActive.current = false;
        }
      });
    },
  }));

  if (showFallback) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
          <p className="mb-1 text-base font-semibold text-gray-700">Đăng nhập bằng Google</p>
          <p className="mb-4 text-sm text-gray-400">
            Trình duyệt đã chặn One Tap, vui lòng dùng nút bên dưới
          </p>
          {/* renderButton sẽ inject iframe vào đây, dùng callback flow thay FedCM */}
          <div ref={fallbackBtnRef} className="flex justify-center" />
          <button
            onClick={() => {
              setShowFallback(false);
              isPromptActive.current = false;
            }}
            className="mt-4 text-xs text-gray-400 hover:text-gray-600"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default forwardRef(GoogleButton);
