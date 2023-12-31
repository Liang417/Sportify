import { Route, Routes, BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import SignupPage from "./pages/SignupPage";
import SigninPage from "./pages/SigninPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import { getUser } from "./redux/slice/userSlice";
import { useDispatch } from "react-redux";
import Homepage from "./pages/Homepage";
import CreateActivityPage from "./pages/CreateActivityPage";
import MessagePage from "./pages/MessagePage";
import ActivityDetailPage from "./pages/ActivityDetailPage";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />}></Route>
        <Route path="/user/signin" element={<SigninPage />}></Route>
        <Route path="/user/signup" element={<SignupPage />}></Route>
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <CreateActivityPage />
            </ProtectedRoute>
          }
        />
        <Route path="/activity/detail/:id" element={<ActivityDetailPage />} />
        <Route
          path="/message"
          element={
            <ProtectedRoute>
              <MessagePage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer
        position="bottom-center"
        autoClose={1000}
        limit={3}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
};

export default App;
