import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getUser } from "../redux/slice/userSlice";

const Signin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    const options = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    };
    const result = await fetch(
      `${import.meta.env.VITE_API_URL}/user/signin`,
      options
    );
    const response = await result.json();
    if (result.ok) {
      toast.success("Login Success😎");
      dispatch(getUser());
      navigate("/");
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="min-h-[70vh] w-[40vw] m-auto flex flex-col font-noto-sans-tc">
      <div className="mt-10">
        <div className="py-8 px-4 shadow-lg">
          <h2 className="text-center text-3xl ">會員登入</h2>
          <form className="space-y-6" onSubmit={handleLogin}>
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

            <button
              type="submit"
              className="relative w-full h-[40px] font flex justify-center py-2 px-4 border border-transparent text-md tracking-widest rounded-md text-white bg-blue-600 hover:bg-green-700"
            >
              登入
            </button>

            <div className="w-full">
              <Link
                to="/user/signup"
                className="text-blue-600 pl-2 hover:text-blue-400"
              >
                沒有帳號?
                <span className="ml-3">立即註冊</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;
