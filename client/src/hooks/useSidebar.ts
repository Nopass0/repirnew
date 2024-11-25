import { useDispatch, useSelector } from "react-redux";
import { setCurrentPage, setCurrentCard } from "@/store/auth/sidebarSlice";
import { SidebarState, SidebarPage, Card, CardType } from "@/types/sidebar";
import { RootState } from "@/store";

export function useSidebar() {
  const dispatch = useDispatch();
  const sidebarState = useSelector<RootState, SidebarState>(
    (state) => state.sidebar,
  );

  const setCurrentPageAction = (page: SidebarPage) => {
    dispatch(setCurrentPage(page));
  };

  const setCurrentCardAction = (card: Card | null) => {
    dispatch(setCurrentCard(card));
  };

  const getCurrentPage = () => sidebarState.currentPage;

  const getCurrentCard = () => sidebarState.currentCard;

  const openCard = (type: CardType, id?: string) => {
    if (type === CardType.Create) {
      setCurrentCardAction({ type });
    } else if (id) {
      setCurrentCardAction({ type, id });
    } else {
      console.error("ID is required for Edit and View card types");
    }
  };

  const closeCard = () => {
    setCurrentCardAction(null);
  };

  return {
    setCurrentPage: setCurrentPageAction,
    setCurrentCard: setCurrentCardAction,
    getCurrentPage,
    getCurrentCard,
    openCard,
    closeCard,
  };
}
