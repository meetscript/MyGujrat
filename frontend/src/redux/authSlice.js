import {createSlice} from "@reduxjs/toolkit"

const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
        suggestedUsers:[],
        msgusers:[],
        searchResults: [],
        userProfile:null,
        selectedUser:null,
    },
    reducers:{
        setAuthUser:(state,action) => {
            state.user = action.payload;
        },
        setSuggestedUsers:(state,action) => {
            state.suggestedUsers = action.payload;
        },
        setmsgusers:(state,action) => {
            state.msgusers= action.payload;
        },
        setUserProfile:(state,action) => {
            state.userProfile = action.payload;
        },
        setSelectedUser:(state,action) => {
            state.selectedUser = action.payload;
        },
        setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    }
});
export const {
    setAuthUser, 
    setSuggestedUsers, 
    setUserProfile,
    setSelectedUser,
    setmsgusers,
    setSearchResults
} = authSlice.actions;
export default authSlice.reducer;