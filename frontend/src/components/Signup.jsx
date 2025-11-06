import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, UserPlus } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../lib/axios";

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("user/register", input, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
        setInput({ username: "", email: "", password: "" });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl rounded-2xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="flex justify-center items-center gap-2 mb-2">
              <UserPlus className="w-7 h-7 text-primary" />
              <h1 className="text-2xl font-bold text-base-content">LOGO</h1>
            </div>
            <p className="text-sm text-base-content/70">
              Sign up to see photos and videos from your friends
            </p>
          </div>

          {/* Form */}
          <form onSubmit={signupHandler} className="space-y-4">
            {/* Username */}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-medium">Username</span>
              </div>
              <input
                type="text"
                name="username"
                value={input.username}
                onChange={changeEventHandler}
                placeholder="Enter your username"
                className="input input-bordered w-full"
                required
              />
            </label>

            {/* Email */}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-medium">Email</span>
              </div>
              <input
                type="email"
                name="email"
                value={input.email}
                onChange={changeEventHandler}
                placeholder="Enter your email"
                className="input input-bordered w-full"
                required
              />
            </label>

            {/* Password */}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-medium">Password</span>
              </div>
              <input
                type="password"
                name="password"
                value={input.password}
                onChange={changeEventHandler}
                placeholder="Enter your password"
                className="input input-bordered w-full"
                required
              />
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Please wait
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-base-content/70 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
