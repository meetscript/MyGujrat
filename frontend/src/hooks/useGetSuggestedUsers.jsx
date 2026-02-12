import { setSuggestedUsers } from "../redux/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import api from "../lib/axios";
const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();
    console.log("Fetching suggested users...");
    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const res = await api.get('user/suggested', { withCredentials: true });
                if (res.data.success) { 
                    dispatch(setSuggestedUsers(res.data.users));
                    // console.log(res.data.users);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSuggestedUsers();
    }, []);
};
export default useGetSuggestedUsers;

