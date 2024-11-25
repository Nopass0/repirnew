import { useState, useEffect, useMemo } from "react";
import { Item, ItemType, SortType, ArchiveStatus } from "@/types/main-sidebar";

const mockData: Item[] = [
  {
    id: "1",
    type: "student",
    name: "Иван Иванов",
    isArchived: false,
    phoneNumber: "+7 (999) 999-99-99",
    email: "ivan@example.com",
    groupIds: ["1"],
    contactFace: "Мама",
  },
  {
    id: "2",
    type: "group",
    name: "Группа A1",
    groupName: "Группа A1",
    isArchived: false,
    students: [],
  },
  {
    id: "3",
    type: "client",
    name: "ООО Компания",
    isArchived: true,
    phoneNumber: "+7 (999) 888-88-88",
    email: "company@example.com",
    studentIds: ["1"],
  },
  // Add more mock data as needed
];

export const useLoadMain = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ItemType>(ItemType.All);
  const [archiveStatus, setArchiveStatus] = useState<ArchiveStatus>(
    ArchiveStatus.WithArchive,
  );
  const [sortType, setSortType] = useState<SortType>(SortType.ByType);

  // Имитация загрузки данных
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 500));
      setItems(mockData);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Фильтрация по архиву
    switch (archiveStatus) {
      case ArchiveStatus.OnlyArchive:
        result = result.filter((item) => item.isArchived);
        break;
      case ArchiveStatus.WithoutArchive:
        result = result.filter((item) => !item.isArchived);
        break;
    }

    // Фильтрация по типу
    if (selectedType !== ItemType.All) {
      result = result.filter((item) => {
        switch (selectedType) {
          case ItemType.Students:
            return item.type === "student";
          case ItemType.Groups:
            return item.type === "group";
          case ItemType.Clients:
            return item.type === "client";
          default:
            return true;
        }
      });
    }

    // Поиск
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.phoneNumber?.toLowerCase().includes(term) ||
          item.email?.toLowerCase().includes(term),
      );
    }

    // Сортировка
    if (sortType === SortType.ByAlpha) {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => {
        const typeOrder = { student: 1, group: 2, client: 3 };
        return typeOrder[a.type] - typeOrder[b.type];
      });
    }

    return result;
  }, [items, searchTerm, selectedType, archiveStatus, sortType]);

  const counts = useMemo(
    () => ({
      total: items.length,
      students: items.filter((item) => item.type === "student").length,
      groups: items.filter((item) => item.type === "group").length,
      clients: items.filter((item) => item.type === "client").length,
    }),
    [items],
  );

  return {
    isLoading,
    items: filteredAndSortedItems,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    archiveStatus,
    setArchiveStatus,
    sortType,
    setSortType,
    counts,
  };
};
