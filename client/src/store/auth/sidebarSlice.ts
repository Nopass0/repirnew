import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SidebarState, Card, CardType, SidebarPage } from "@/types/sidebar";

const initialState: SidebarState = {
  currentPage: SidebarPage.Home,
  currentCard: null,
};

export const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<SidebarPage>) => {
      state.currentPage = action.payload;
    },
    setCurrentCard: (state, action: PayloadAction<Card | null>) => {
      state.currentCard = action.payload;
    },
  },
});

export const { setCurrentPage, setCurrentCard } = sidebarSlice.actions;

export default sidebarSlice.reducer;
