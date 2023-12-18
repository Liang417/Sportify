import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getUser } from "../redux/slice/userSlice";
import validator from "validator";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || name.trim().length < 2) {
      return toast.error("暱稱至少兩個字且不可包含空白");
    }

    if (!validator.isEmail(email)) {
      return toast.error("請輸入正確的email格式");
    }

    if (!validator.isLength(password, { min: 6 })) {
      return toast.error("密碼至少六個字");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("avatar", avatar);

    const options = {
      method: "POST",
      body: formData,
      credentials: "include",
    };

    try {
      const result = await fetch(
        `${import.meta.env.VITE_API_URL}/user/signup`,
        options
      );
      const response = await result.json();
      if (result.ok) {
        toast.success("註冊成功");
        dispatch(getUser());
        navigate("/");
      } else {
        toast.error(response.errors);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  return (
    <div className="min-h-[70vh] w-[40vw] m-auto flex flex-col font-noto-sans-tc">
      <div className="mt-10">
        <div className="py-8 px-4 shadow-lg">
          <h2 className="text-center text-3xl">註冊會員</h2>
          <form className="space-y-6" onSubmit={handleSignup}>
            <div>
              <label
                htmlFor="name"
                className="block text-md font-medium text-gray-700 pl-1"
              >
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-md font-medium text-gray-700 pl-1"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-md font-medium text-gray-700 pl-1"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="mt-2 flex items-center">
                <label
                  htmlFor="avatar"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-500 cursor-pointer"
                >
                  <span>Upload image</span>
                  <input
                    type="file"
                    name="avatar"
                    id="avatar"
                    required
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <div className="ml-5 h-8 w-8 rounded-full overflow-hidden">
                  {avatar ? (
                    <img
                      src={URL.createObjectURL(avatar)}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="relative w-full h-[40px] font flex justify-center py-2 px-4 border border-transparent text-md tracking-widest rounded-md text-white bg-blue-600 hover:bg-green-700"
            >
              註冊
            </button>

            <div className="w-full">
              <Link
                to="/user/signin"
                className="text-blue-600 pl-2 hover:text-blue-400"
              >
                已有帳號?
                <span className="ml-3">立即登入</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
