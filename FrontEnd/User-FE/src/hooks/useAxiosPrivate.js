import { useEffect } from "react";
import useAuth from "./useAuth";
import { axiosPrivate } from "../services/api/axios";

const useAxiosPrivate = () => {
  const { auth } = useAuth();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${auth?.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response.status === 401) {
          window.location.href = "/account/login";
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.request.eject(responseIntercept);
    };
  }, [auth]);
  return axiosPrivate
};

export default useAxiosPrivate;
