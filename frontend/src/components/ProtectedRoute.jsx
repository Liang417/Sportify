import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "./layout/Loader";

const ProtectedRoute = ({ children }) => {
  const { isLoading, isAuthenticated } = useSelector((state) => state.user);

  if (isLoading === true) {
    return <Loader />;
  } else {
    if (!isAuthenticated) {
      return <Navigate to="/user/signin" replace />;
    }
    return children;
  }
};

export default ProtectedRoute;
