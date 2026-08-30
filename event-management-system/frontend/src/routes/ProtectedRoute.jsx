import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const ProtectedRoute = ({
  children,
  allowedRoles,
}) => {
  const user = useAuthStore(
    (state) => state.user
  );

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;