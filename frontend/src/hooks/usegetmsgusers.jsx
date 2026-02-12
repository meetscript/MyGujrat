import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setmsgusers } from "../redux/authSlice";
import  api from "../lib/axios";
const useGetMsgUsers = () => {
    const { user } = useSelector((store) => store.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        const setuser = () => {
           try{
            const msgusers=api.get("/user/allusers");
            msgusers.then((res)=>{
                const users = res.data.users;
                const uniqueUsers = users.filter((u) => u._id !== user._id);
                dispatch(setmsgusers(uniqueUsers));
            })
           }catch(err){
            console.log("Error in fetching msg users:", err);   
           }
            }
        setuser();
    }, []);
};

export default useGetMsgUsers;