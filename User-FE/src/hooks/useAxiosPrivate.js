import { axiosPrivate } from "@/services/api/axios";
import { useEffect } from "react";
import useAuth from "./useAuth";

const useAxiosPrivate = () => {
  const { auth } = useAuth();

  useEffect(() => {
    // Hạn chế log token ra console cho vấn đề bảo mật
    if (auth?.accessToken) {
      console.log("Auth token available in useAxiosPrivate");
    } else {
      console.warn("No auth token in useAxiosPrivate");
    }
    
    const requestIntercept = axiosPrivate.interceptors.request.use(
      config => {
        // Luôn đặt token mới nhất vào header, bất kể đã có trước đó hay không
        if (auth?.accessToken) {
          config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
          console.log(`Request with token: ${config.method} ${config.url}`);
        } else {
          console.warn(`Request without token: ${config.method} ${config.url}`);
        }
        
        return config;
      }, (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      response => {
        console.log(`Response from ${response.config.url}: Status ${response.status}`);
        return response;
      },
      async (error) => {
        console.error("Response error:", error);
        
        // Chi tiết lỗi để debug
        if (error.response) {
          console.error(`Response error ${error.response.status}:`, error.response.data);
          
          // Xử lý lỗi 401 Unauthorized
          if (error.response.status === 401) {
            console.error("Unauthorized error - Invalid or expired token");
            // Thêm xử lý refresh token ở đây nếu cần
          }
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Request setup error:", error.message);
        }
        
        return Promise.reject(error);
      }
    );
    
    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth]);
  
  return axiosPrivate;
};

export default useAxiosPrivate;
