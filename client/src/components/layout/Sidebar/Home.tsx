import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronUp,
  HomeIcon,
  Users,
  Building2,
  ArrowLeftRight,
  SortAsc,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoadMain } from "@/hooks/useLoadMain";
import { ItemType, SortType, ArchiveStatus } from "@/types/main-sidebar";
import { ContactIcons } from "@/components/ContactIcons";
import { cn } from "@/lib/utils";

const ItemSkeleton = () => (
  <div className="py-2">
    <div className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
    <Separator className="my-1" />
  </div>
);

const HomePage = () => {
  const {
    isLoading,
    items,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    archiveStatus,
    setArchiveStatus,
    sortType,
    setSortType,
    counts,
  } = useLoadMain();

  const [openItems, setOpenItems] = React.useState(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const placeholderCount = useMemo(() => {
    if (isLoading) return 5; // При загрузке показываем 5 скелетонов

    const itemHeight = 56;
    const containerHeight = (94 * window.innerHeight) / 100;
    const availableHeight = containerHeight - 200;
    return Math.max(
      Math.floor(availableHeight / itemHeight) - items.length - 3,
      0,
    );
  }, [items.length, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-lg p-4">
      <div className="p-4 space-y-4">
        <div className="border border-primary rounded-lg p-2 space-y-2 w-full">
          <Select
            value={selectedType}
            onValueChange={(value: ItemType) => setSelectedType(value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full border-none">
              <SelectValue>
                {isLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : selectedType === ItemType.All ? (
                  `Все ${counts.total}`
                ) : selectedType === ItemType.Students ? (
                  `Ученики ${counts.students}`
                ) : selectedType === ItemType.Groups ? (
                  `Группы ${counts.groups}`
                ) : (
                  `Заказчики ${counts.clients}`
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ItemType.All}>Все {counts.total}</SelectItem>
              <SelectItem value={ItemType.Students}>
                Ученики {counts.students}
              </SelectItem>
              <SelectItem value={ItemType.Groups}>
                Группы {counts.groups}
              </SelectItem>
              <SelectItem value={ItemType.Clients}>
                Заказчики {counts.clients}
              </SelectItem>
            </SelectContent>
          </Select>

          <Separator />

          <Select
            value={archiveStatus}
            onValueChange={(value: ArchiveStatus) => setArchiveStatus(value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full border-none">
              {isLoading ? <Skeleton className="h-4 w-24" /> : <SelectValue />}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ArchiveStatus.WithArchive}>
                С архивом
              </SelectItem>
              <SelectItem value={ArchiveStatus.OnlyArchive}>
                Только архив
              </SelectItem>
              <SelectItem value={ArchiveStatus.WithoutArchive}>
                Без архива
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full">
          <Input
            placeholder="Поиск..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-primary w-full"
            disabled={isLoading}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex gap-2">
          <Button
            variant={sortType === SortType.ByType ? "default" : "ghost"}
            size="sm"
            onClick={() => setSortType(SortType.ByType)}
            disabled={isLoading}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          <Button
            variant={sortType === SortType.ByAlpha ? "default" : "ghost"}
            size="sm"
            onClick={() => setSortType(SortType.ByAlpha)}
            disabled={isLoading}
          >
            <SortAsc className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 max-h-full">
        <div className="px-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <ItemSkeleton key={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        layout: { duration: 0.3 },
                        opacity: { duration: 0.2 },
                      }}
                    >
                      <div
                        className={cn(
                          "rounded-lg transition-colors",
                          item.isArchived ? "opacity-60" : "",
                          openItems.has(item.id)
                            ? "bg-gray-50"
                            : "hover:bg-gray-50",
                        )}
                      >
                        <div
                          className="p-3 cursor-pointer"
                          onClick={() => toggleItem(item.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {item.type === "student" && (
                                <HomeIcon className="h-5 w-5" />
                              )}
                              {item.type === "group" && (
                                <Users className="h-5 w-5" />
                              )}
                              {item.type === "client" && (
                                <Building2 className="h-5 w-5" />
                              )}
                              <span>
                                {item.type === "group"
                                  ? item.groupName
                                  : item.name}
                              </span>
                            </div>
                            {openItems.has(item.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {openItems.has(item.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 py-2 mx-2 mb-2 bg-gray-100 rounded-md">
                                <ContactIcons
                                  phoneNumber={item.phoneNumber}
                                  email={item.email}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <Separator className="my-1" />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Placeholder lines */}
                {Array.from({ length: placeholderCount }).map((_, i) => (
                  <React.Fragment key={`placeholder-${i}`}>
                    <div className="h-14" />
                    <Separator className="my-1" />
                  </React.Fragment>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

export default HomePage;
