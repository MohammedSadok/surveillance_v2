import { Ban, CheckCircle, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import { SessionExam } from "@/lib/schema";

interface CellActionProps {
  data: SessionExam;
}

type Actions = "delete" | "validate" | "cancel";

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<Actions | null>(null);

  const performAction = async (confirmedAction: Actions) => {
    try {
      setLoading(true);
      const typeAction = { type: confirmedAction };
      const endpoint =
        confirmedAction === "delete"
          ? `/api/sessions/${data.id}`
          : `/api/sessions/${data.id}`;
      // await axios[confirmedAction === "delete" ? "delete" : "post"](
      //   endpoint,
      //   typeAction
      // );
      toast.success(
        confirmedAction === "delete"
          ? "Session supprimée."
          : confirmedAction === "validate"
          ? "Session validée."
          : "Session annulée."
      );
      router.refresh();
    } catch (error) {
      toast.error(
        "Assurez-vous d'avoir d'abord supprimé toutes les données de cette session."
      );
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  const handleButtonClick = (confirmedAction: Actions) => {
    setAction(confirmedAction);
    setOpen(true);
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => action && performAction(action)}
        loading={loading}
      />

      <Button variant="ghost" onClick={() => handleButtonClick("delete")}>
        <Trash className="h-4 w-4" color="#c1121f" />
      </Button>

      <Button
        variant="ghost"
        onClick={() =>
          handleButtonClick(data.isValidated ? "cancel" : "validate")
        }
      >
        {data.isValidated ? (
          <Ban className="mr-l h-4 w-4" color="#368a1c" />
        ) : (
          <CheckCircle className="mr-l h-4 w-4" color="#2770a5" />
        )}
      </Button>
    </>
  );
};
