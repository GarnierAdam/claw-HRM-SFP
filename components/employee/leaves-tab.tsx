"use client";

import { useLeaves, useCreateLeave, useUpdateLeave } from "@/hooks/use-hrm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Check, X } from "lucide-react";
import { useState } from "react";
import { format, differenceInDays } from "date-fns";

const leaveTypes = {
  paid: "Congés payés",
  unpaid: "Sans solde",
  sick: "Maladie",
  maternity: "Maternité",
  paternity: "Paternité",
  other: "Autre",
};

const leaveStatuses = {
  pending: { label: "En attente", variant: "secondary" as const },
  approved: { label: "Approuvé", variant: "default" as const },
  rejected: { label: "Refusé", variant: "destructive" as const },
};

export function LeavesTab({ employeeId }: { employeeId: string }) {
  const { data: leaves } = useLeaves(employeeId);
  const createLeave = useCreateLeave();
  const updateLeave = useUpdateLeave();
  const [open, setOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: "paid" as const,
    start_date: "",
    end_date: "",
    reason: "",
    status: "pending" as const,
    employee_id: employeeId,
  });

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLeave.mutateAsync(leaveForm);
      toast.success("Demande de congé créée");
      setOpen(false);
      setLeaveForm({
        type: "paid",
        start_date: "",
        end_date: "",
        reason: "",
        status: "pending",
        employee_id: employeeId,
      });
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateLeave.mutateAsync({ id, status: "approved" });
      toast.success("Congé approuvé");
    } catch {
      toast.error("Erreur");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateLeave.mutateAsync({ id, status: "rejected" });
      toast.success("Congé refusé");
    } catch {
      toast.error("Erreur");
    }
  };

  const totalLeaveDays =
    leaves?.reduce((acc, leave) => {
      if (leave.status === "approved") {
        return acc + differenceInDays(new Date(leave.end_date), new Date(leave.start_date)) + 1;
      }
      return acc;
    }, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Congés et absences</h2>
          <p className="text-sm text-muted-foreground">
            Total jours approuvés: <span className="font-semibold">{totalLeaveDays}</span>
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle demande
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle demande de congé</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Type de congé</Label>
                <Select
                  value={leaveForm.type}
                  onValueChange={(v) => setLeaveForm({ ...leaveForm, type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(leaveTypes).map(([k, l]) => (
                      <SelectItem key={k} value={k}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Du</Label>
                  <Input
                    type="date"
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Au</Label>
                  <Input
                    type="date"
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Motif</Label>
                <Input
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createLeave.isPending}>
                  {createLeave.isPending ? "Création..." : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {leaves?.length === 0 ? (
        <p className="text-muted-foreground">Aucun congé enregistré</p>
      ) : (
        <div className="space-y-3">
          {leaves?.map((leave) => {
            const days = differenceInDays(new Date(leave.end_date), new Date(leave.start_date)) + 1;
            return (
              <div key={leave.id} className="p-4 bg-card rounded-lg border flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{leaveTypes[leave.type]}</span>
                    <Badge variant={leaveStatuses[leave.status].variant}>
                      {leaveStatuses[leave.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Du {format(new Date(leave.start_date), "dd/MM/yyyy")} au{" "}
                    {format(new Date(leave.end_date), "dd/MM/yyyy")} ({days} jours)
                  </p>
                  {leave.reason && <p className="text-sm mt-1">{leave.reason}</p>}
                </div>
                {leave.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleApprove(leave.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(leave.id)}>
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
