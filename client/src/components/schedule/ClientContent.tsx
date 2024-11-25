import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ClientScheduleItem, ClientWorkStage } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Calendar,
  Clock,
  DollarSign,
  CheckSquare,
  Square,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface ClientContentProps {
  client: ClientScheduleItem;
  onUpdate: (field: string, value: any) => void;
  relatedWork: ClientScheduleItem[];
}

export const ClientContent: React.FC<ClientContentProps> = ({
  client,
  onUpdate,
  relatedWork,
}) => {
  const formatDate = (date: Date) =>
    format(date, "d MMMM yyyy", { locale: ru });
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
    }).format(amount);

  const calculateProgress = (stage: ClientWorkStage) => {
    let progress = 0;
    if (stage.firstPaymentPaid) progress += 25;
    if (stage.isStarted) progress += 25;
    if (stage.endPaymentPaid) progress += 25;
    if (stage.isCompleted) progress += 25;
    return progress;
  };

  const toggleStageStatus = (stageId: string, field: keyof ClientWorkStage) => {
    const updatedStages = client.workStages.map((stage) => {
      if (stage.id === stageId) {
        return { ...stage, [field]: !stage[field] };
      }
      return stage;
    });
    onUpdate("workStages", updatedStages);
  };

  return (
    <div className="grid grid-cols-[1fr_250px] gap-4 mt-4">
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              <span className="font-medium">
                Общая стоимость: {formatMoney(client.totalPrice)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {client.paymentType === "prepaid" ? "Предоплата" : "Постоплата"}
            </div>
          </div>

          <div className="space-y-6">
            {client.workStages.map((stage) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Progress value={calculateProgress(stage)} className="h-2" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {formatDate(stage.firstPaymentDate)}
                        </span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleStageStatus(stage.id, "firstPaymentPaid")
                              }
                            >
                              {stage.firstPaymentPaid ? (
                                <CheckSquare className="w-5 h-5 text-green-500" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Первый платеж:{" "}
                              {formatMoney(stage.firstPaymentAmount)}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Начало работы</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStageStatus(stage.id, "isStarted")}
                      >
                        {stage.isStarted ? (
                          <CheckSquare className="w-5 h-5 text-green-500" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {formatDate(stage.endPaymentDate)}
                        </span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleStageStatus(stage.id, "endPaymentPaid")
                              }
                            >
                              {stage.endPaymentPaid ? (
                                <CheckSquare className="w-5 h-5 text-green-500" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Финальный платеж:{" "}
                              {formatMoney(stage.endPaymentAmount)}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Сдача работы</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleStageStatus(stage.id, "isCompleted")
                        }
                      >
                        {stage.isCompleted ? (
                          <CheckSquare className="w-5 h-5 text-green-500" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="my-2" />
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4" />
          <span className="font-medium">История работ</span>
        </div>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {relatedWork.map((work) => (
              <motion.button
                key={work.id}
                className={`w-full text-left p-2 rounded-lg flex items-center gap-2 hover:bg-secondary transition-colors ${
                  work.id === client.id ? "bg-secondary" : ""
                }`}
                whileHover={{ x: 4 }}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {formatDate(work.date)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {work.subject}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default ClientContent;
