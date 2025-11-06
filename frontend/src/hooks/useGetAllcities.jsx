import { setcities } from "../redux/postSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import api from "../lib/axios";

const useGetAllcities = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchAllPost = async () => {
            try {
                const res = await api.get('post/cities', { withCredentials: true });
                if (res.data.success) { 
                    console.log(res.data.cities);
                    dispatch(setcities(res.data.cities));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllPost();
    }, []);
};
export default useGetAllcities;