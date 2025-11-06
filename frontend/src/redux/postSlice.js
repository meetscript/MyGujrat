import { createSlice } from "@reduxjs/toolkit";
const postSlice = createSlice({
    name:'post',
    initialState:{
        posts:[],
        selectedPost:null,
        cities:[],
    },
    reducers:{
        //actions
        setPosts:(state,action) => {
            state.posts = action.payload;
        },
        setSelectedPost:(state,action) => {
            state.selectedPost = action.payload;
        },
        setcities:(state,action) => {   
            state.cities = action.payload;
        }
    }
});
export const {setPosts, setSelectedPost,setcities} = postSlice.actions;
export default postSlice.reducer;