import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setmsgusers } from "../redux/authSlice";

const useGetMsgUsers = () => {
    const { user } = useSelector((store) => store.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        const setuser = () => {
            if (user?.followers && user?.following) {
                // Merge followers and following, remove duplicates by _id
                const mergedUsers = [...user.followers, ...user.following];
                const uniqueUsers = mergedUsers.filter(
                    (u, index, self) => index === self.findIndex((x) => x._id === u._id)
                );

                dispatch(setmsgusers(uniqueUsers));
            }
        }
        setuser();
    }, []);
};

export default useGetMsgUsers;
