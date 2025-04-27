import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const foodsStore = createSlice({
  name: "foods",
  initialState: {
    foodsList: [],
    activeIndex: 0,
  },
  reducers: {
    setFoodsList(state, action) {
      state.foodsList = action.payload;
    },
    changeActiveIndex(state, action) {
      state.activeIndex = action.payload;
    },
  },
});

const { setFoodsList, changeActiveIndex } = foodsStore.actions;
const fetchFoodList = () => {
  return async (dispatch) => {
    const res = await axios.get("http://localhost:3004/takeaway");
    dispatch(setFoodsList(res.data));
  };
};

export { fetchFoodList, changeActiveIndex };

const reducer = foodsStore.reducer;

export default reducer;
