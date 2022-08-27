import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API, API_CREATE, API_POSTS, API_STATUS } from "../constants";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const initialState = {
  posts: [],
  status: API_STATUS.idle,
  error: null,
};

export const fetchPosts = createAsyncThunk("notes/fetchPosts", async () => {
  // const token = await AsyncStorage.getItem("token");
  // const response = await axios.get(API + API_POSTS, {
  //   headers: { Authorization: `JWT ${token}` },
  // });
  // return response.data;
  const querySnapshot = await getDocs(collection(db, "notes"));
  const notes = querySnapshot.docs.map((doc, index) => {
    return { id: doc.id, ...doc.data(), index };
  });
  return notes;
});

export const addNewPost = createAsyncThunk(
  "notes/addNewPost",
  async (newPost) => {
    // const token = await AsyncStorage.getItem("token");
    // const response = await axios.post(API + API_CREATE, newPost, {
    //   headers: { Authorization: `JWT ${token}` },
    // });
    // return response.data;
    await setDoc(doc(db, "notes", newPost.id), newPost);
    return newPost;
  }
);

export const updatePostThunk = createAsyncThunk(
  "posts/updatePost",
  async (updatedPost) => {
    // const token = await AsyncStorage.getItem("token");
    // const response = await axios.put(
    //   API + API_POSTS + "/" + updatedPost.id,
    //   updatedPost,
    //   {
    //     headers: { Authorization: `JWT ${token}` },
    //   }
    // );
    // return response.data;
    await updateDoc(doc(db, "notes", updatedPost.id), updatedPost);
    return updatedPost;
  }
);

export const deletePostThunk = createAsyncThunk(
  "posts/deletePost",
  async (id) => {
    // const token = await AsyncStorage.getItem("token");
    // const response = await axios.delete(API + API_POSTS + "/" + id, {
    //   headers: { Authorization: `JWT ${token}` },
    // });
    // return id;
    await deleteDoc(doc(db, "notes", id));
    return id;
  }
);

const notesSlice = createSlice({
  name: "notes",
  initialState,
  //   reducers: {
  //     noteAdded(state, action) {
  //       state.push(action.payload);
  //     },
  //   },
  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = API_STATUS.pending;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = API_STATUS.fulfilled;
        state.posts = state.posts.concat(action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = API_STATUS.rejected;
        state.error = action.error.message;
        console.log("Failed to fetch posts. Error:", action.error.message);
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        state.posts.push(action.payload);
      })
      // .addCase(updatePostThunk.fulfilled, (state, action) => {
      //   const { id, title, content } = action.payload;
      //   const existingPost = state.posts.find((post) => post.id === id);
      //   if (existingPost) {
      //     existingPost.title = title;
      //     existingPost.content = content;
      //   }
      // })
      .addCase(updatePostThunk.fulfilled, (state, action) => {
        const { id } = action.payload;
        const posts = state.posts;
        const post = posts.find((post) => post.id === id);
        const postIndex = posts.indexOf(post);
        if (~postIndex) posts[postIndex] = action.payload;;
      })
      .addCase(deletePostThunk.fulfilled, (state, action) => {
        const id = action.payload;
        const updatedPosts = state.posts.filter((item) => item.id != id);
        state.posts = updatedPosts;
      });
  },
});

// export const { noteAdded } = notesSlice.actions;

export default notesSlice.reducer;
