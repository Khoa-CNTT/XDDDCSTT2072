import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";
import PropTypes from "prop-types";

const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();
  const isAuthorized = auth?.user?.roleName && allowedRoles.includes(auth?.user?.roleName);
  return isAuthorized ? (
    <Outlet />
  ) : (
    <Navigate
      to={"/account/login"}
      state={{ from: location }}
      replace
    />
  );
};

RequireAuth.propTypes = {
  allowedRoles: PropTypes.array.isRequired,
};

export default RequireAuth;
