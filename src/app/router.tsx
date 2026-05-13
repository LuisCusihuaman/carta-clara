import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@components/layout/AppShell";
import { SearchPage } from "@features/search/SearchPage";
import { CardsPage } from "@features/cards/CardsPage";
import { CardDetailPage } from "@features/cards/CardDetailPage";
import { SavedPage } from "@features/saved/SavedPage";
import { CurrentSpreadPage } from "@features/spread/CurrentSpreadPage";
import { PhotoRoute } from "@features/photo/PhotoRoute";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <SearchPage /> },
      { path: "/foto", element: <PhotoRoute /> },
      { path: "/cartas", element: <CardsPage /> },
      { path: "/guardadas", element: <SavedPage /> },
      { path: "/carta/:cardId", element: <CardDetailPage /> },
      { path: "/tirada", element: <CurrentSpreadPage /> }
    ]
  }
]);
