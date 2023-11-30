import { useSelector } from "react-redux";
import Header from "../components/layout/Header";

const ProfilePage = () => {
  const { user } = useSelector((state) => state.user.user);
  return (
    <>
      <Header />
      <div className="w-full h-[40vh] flex flex-col items-center justify-center text-[48px]">
        <img
          src={`${import.meta.env.VITE_UPLOAD_URL}/${user.avatar}`}
          alt={user.name}
          className="h-40 w-40 rounded-full mt-3 mr-2 object-cover"
        />
        <p>{user.name}</p>
      </div>
    </>
  );
};

export default ProfilePage;
