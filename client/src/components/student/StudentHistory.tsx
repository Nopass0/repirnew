import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronDown, ChevronUp, X, Edit2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHistory } from "@/hooks/useHistory";
import { Subject } from "@/types/subject";
import { Prepayment, HistoryRecord } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface StudentHistoryProps {
  subjects: Subject[];
  prepayments: Prepayment[];
  initialHistory?: HistoryRecord[];
  currentSubject?: string;
  disabled?: boolean;
}

const HistoryItem = motion(Card);
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const StudentHistory: React.FC<StudentHistoryProps> = ({
  subjects,
  prepayments,
  initialHistory,
  currentSubject,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingPrepaymentId, setEditingPrepaymentId] = useState<string | null>(
    null,
  );

  const { history, combinedHistory, stats, getSubjectStats, cancelLesson } =
    useHistory({
      subjects,
      prepayments,
      initialHistory,
    });

  const currentStats = currentSubject ? getSubjectStats(currentSubject) : stats;

  // Find the nearest lesson to today
  useEffect(() => {
    if (isExpanded && scrollRef.current) {
      const today = new Date();
      const nearestIndex = combinedHistory.findIndex(
        (item) => new Date(item.dateTime) >= today,
      );

      if (nearestIndex !== -1) {
        const element = scrollRef.current.children[nearestIndex];
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [isExpanded, combinedHistory]);

  // Generate unique color for each subject
  const getSubjectColor = (subjectName: string) => {
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) {
      hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), "dd.MM.yy HH:mm", { locale: ru });
  };

  return (
    <Card className="w-full bg-white border border-gray-200 rounded-lg">
      <CardHeader
        className="flex flex-row items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-lg font-medium">
          История занятий и оплат
        </CardTitle>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              visible: { height: "auto", opacity: 1 },
              hidden: { height: 0, opacity: 0 },
              exit: { height: 0, opacity: 0 },
            }}
          >
            <CardContent className="p-4">
              {/* Statistics Section */}
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>Всего занятий: {currentStats.totalLessons}</p>
                  <p>Сумма: {currentStats.totalAmount}₽</p>
                </div>
                <div>
                  <p>Прошло: {currentStats.completedLessons}</p>
                  <p>
                    Оплачено: {currentStats.paidLessons} (
                    {currentStats.paidAmount}₽)
                  </p>
                </div>
                <div className="col-span-2">
                  <p>Не оплачено: {currentStats.unpaidLessons}</p>
                  <p className="text-red-500">
                    Долг: {currentStats.unpaidAmount}₽
                  </p>
                </div>
              </div>

              {/* History List */}
              <ScrollArea
                className="h-[300px] rounded-md border"
                ref={scrollRef}
              >
                <div className="space-y-2 p-4">
                  {combinedHistory.map((item, index) => (
                    <HistoryItem
                      key={
                        item.type === "lesson" ? item.id : `prepayment-${index}`
                      }
                      variants={itemVariants}
                      className={cn(
                        "p-3 flex items-center justify-between",
                        item.type === "lesson" &&
                          item.isCancelled &&
                          "bg-red-50 border-red-200",
                        !disabled && "hover:shadow-md transition-shadow",
                      )}
                    >
                      {item.type === "lesson" ? (
                        // Lesson item
                        <>
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-1 h-8 rounded"
                              style={{
                                backgroundColor: getSubjectColor(
                                  item.subjectName,
                                ),
                              }}
                            />
                            <div>
                              <p className="font-medium">
                                {formatDateTime(item.dateTime)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {item.subjectName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                item.eventType === "Оплачено" &&
                                  "text-green-600",
                                item.eventType === "Не оплачено" &&
                                  "text-red-600",
                              )}
                            >
                              {item.paymentAmount}₽
                            </span>
                            <Checkbox
                              checked={item.hasPassed}
                              disabled={true}
                            />
                            <Checkbox
                              checked={item.eventType === "Оплачено"}
                              disabled={true}
                            />
                            {!disabled && !item.isCancelled && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelLesson(item.id)}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </>
                      ) : (
                        // Prepayment item
                        <>
                          <div className="flex items-center space-x-3">
                            <div className="w-1 h-8 rounded bg-green-500" />
                            <div>
                              <p className="font-medium">
                                {formatDateTime(item.dateTime)}
                              </p>
                              <p className="text-sm text-green-600">
                                Предоплата
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-green-600">
                              +{item.amount}₽
                            </span>
                            {!disabled && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setEditingPrepaymentId(item.id)
                                  }
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </HistoryItem>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default StudentHistory;
