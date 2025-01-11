import { Navigate } from 'react-router-dom';
    import { useAuthState } from 'react-firebase-hooks/auth';
    import { auth } from '../firebase';

    interface PrivateRouteProps {
      children: React.ReactNode;
    }

    const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
      const [user, loading] = useAuthState(auth);

      if (loading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        );
      }

      if (!user) {
        return <Navigate to="/login" />;
      }

      return <>{children}</>;
    };

    export default PrivateRoute;
