import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setAllUsers } from "../redux/authSlice";
import api from "../lib/axios";

const useGetAllUsers = () => {
  const user = useSelector((store) => store.auth.user);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!user?._id) return;

    const fetchUsers = async () => {
      try {
        const res = await api.get("/user/allusers");
        const users = res.data.users;

        const uniqueUsers = users.filter(
          (u) => u._id !== user._id
        );
        dispatch(setAllUsers(uniqueUsers));
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, [user?._id, dispatch]);
};

export default useGetAllUsers;
