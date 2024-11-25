// components/calendar/ClientEventDialog.tsx
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  Clock,
  Calendar as CalendarIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { MediaSection } from "./MediaSection";
import type { ClientEvent } from "@/types/calendar-events";
import { Input } from "../ui/input";

interface ClientEventDialogProps {
  event: ClientEvent;
  onClose: () => void;
  onUpdate: (event: ClientEvent) => void;
}

const PaymentStatus = ({
  isPaid,
  dueDate,
  amount,
  label,
}: {
  isPaid: boolean;
  dueDate: string;
  amount: number;
  label: string;
}) => (
  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
    <div className="flex items-center gap-3">
      {isPaid ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-yellow-500" />
      )}
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(dueDate), "d MMMM yyyy", { locale: ru })}
        </p>
      </div>
    </div>
    <div className="flex items-center">
      <span className="text-sm">{amount} ₽</span>
      <Checkbox
        checked={isPaid}
        className="ml-2 data-[state=checked]:bg-green-500"
      />
    </div>
  </div>
);

const WorkStatus = ({
  isCompleted,
  date,
  label,
}: {
  isCompleted: boolean;
  date: string;
  label: string;
}) => (
  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
    <div className="flex items-center gap-3">
      {isCompleted ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <Clock className="h-5 w-5 text-yellow-500" />
      )}
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(date), "d MMMM yyyy", { locale: ru })}
        </p>
      </div>
    </div>
    <Checkbox
      checked={isCompleted}
      className="data-[state=checked]:bg-green-500"
    />
  </div>
);

export const ClientEventDialog: React.FC<ClientEventDialogProps> = ({
  event,
  onClose,
  onUpdate,
}) => {
  const totalPaid =
    (event.isPrepaymentPaid ? event.prepayment : 0) +
    (event.isFinalPaymentPaid ? event.finalPayment : 0);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 h-[73vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="h-full flex flex-col"
        >
          {/* Шапка диалога */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4">
                <img
                  src={event.subjectIcon}
                  alt=""
                  className="w-12 h-12 rounded-lg"
                />
                <div>
                  <h2 className="text-xl font-semibold">
                    {event.studentName}
                    <Badge
                      variant={event.isWorkCompleted ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {event.isWorkCompleted ? "Завершено" : "В работе"}
                    </Badge>
                  </h2>
                  <p className="text-muted-foreground">{event.subjectName}</p>
                </div>
              </div>
            </div>

            {/* Информация о заказе */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(event.date), "d MMMM yyyy", { locale: ru })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm justify-end">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span>
                  {totalPaid} из {event.totalPrice} ₽
                </span>
              </div>
            </div>
            <div className="mt-1">
              {event.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{event.email}</span>
                </div>
              )}
              {event.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{event.phone}</span>
                </div>
              )}
            </div>

            {/* Прогресс оплаты */}
            <div className="mt-4">
              <Progress
                value={(totalPaid / event.totalPrice) * 100}
                className="h-2"
              />
            </div>
          </div>

          {/* Основное содержимое */}
          <div className="flex flex-1">
            <ScrollArea className="p-6 flex-1">
              <div className="space-y-6">
                {/* Статусы оплаты и работы */}
                <div className="space-y-3">
                  <PaymentStatus
                    isPaid={event.isPrepaymentPaid}
                    dueDate={event.date} // Используем дату начала как дату предоплаты
                    amount={event.prepayment}
                    label="Предоплата"
                  />

                  <WorkStatus
                    isCompleted={event.isWorkStarted}
                    date={event.date}
                    label="Начало работы"
                  />

                  <PaymentStatus
                    isPaid={event.isFinalPaymentPaid}
                    dueDate={event.date} // Используем дату начала как дату финальной оплаты
                    amount={event.finalPayment}
                    label="Финальная оплата"
                  />

                  <WorkStatus
                    isCompleted={event.isWorkCompleted}
                    date={event.date}
                    label="Завершение работы"
                  />
                </div>

                <Separator />

                {/* Комментарий */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Комментарий</h3>
                  <Textarea
                    placeholder="Добавьте комментарий к заказу..."
                    value={event.lessonComment}
                    onChange={(e) =>
                      onUpdate({
                        ...event,
                        lessonComment: e.target.value,
                      })
                    }
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </ScrollArea>

            {/* Блок с аудио\файлами\ссылками и поиском */}
            <div className="w-64  bg-background p-4 border-l rounded-r-md flex flex-col">
              <h3 className="text-sm font-medium mb-2">Файлы и ссылки</h3>
              <MediaSection
                audioRecordings={[]}
                attachments={event.attachments}
                onAudioAdd={() => {}}
                onAudioDelete={() => {}}
                onFileAdd={(file) =>
                  onUpdate({
                    ...event,
                    attachments: [...event.attachments, file],
                  })
                }
                onFileDelete={(id) =>
                  onUpdate({
                    ...event,
                    attachments: event.attachments.filter((a) => a.id !== id),
                  })
                }
                onLinkAdd={(url) =>
                  onUpdate({
                    ...event,
                    attachments: [
                      ...event.attachments,
                      {
                        id: crypto.randomUUID(),
                        name: url,
                        type: "link",
                        url,
                        size: 0,
                        timestamp: new Date().toISOString(),
                      },
                    ],
                  })
                }
              />
            </div>
          </div>

          {/* Футер с кнопками */}
          {event.status.hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-4 border-t bg-muted/50"
            >
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    /* Добавить логику сохранения */
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
