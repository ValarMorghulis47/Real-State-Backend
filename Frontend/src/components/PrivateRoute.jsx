import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

function PrivateRoute() {
  const { currentUser, loading, initialFetchDone } = useSelector((state) => state.user);
  if (!initialFetchDone) {
    return null;
  }
  if (!currentUser && loading === false) {
    return <Navigate to="/sign-in" />;
  }
  return <Outlet />;
}

export default PrivateRoute;