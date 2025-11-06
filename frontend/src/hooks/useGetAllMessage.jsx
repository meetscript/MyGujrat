import { setMessages } from "../redux/chatSlice";
import { setPosts } from "../redux/postSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../lib/axios";
const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const {selectedUser} = useSelector(store=>store.auth);
    useEffect(() => {
        const fetchAllMessage = async () => {
            try {
                const res = await api.get(`message/all/${selectedUser?._id}`, { withCredentials: true });
                if (res.data.success) {  
                    dispatch(setMessages(res.data.messages));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllMessage();
    }, [selectedUser]);
};
export default useGetAllMessage;