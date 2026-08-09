import { useState } from "react";
import clsx from "clsx";
import { Application } from "@suzume/shared-types";
import { Modal } from "../../components/ui/Modal";
import { ManualApplicationForm } from "./ManualApplicationForm";
import { ExtractApplicationPanel } from "./ExtractApplicationPanel";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: any) => Promise<void>;
  onCreated?: () => void;
  initial?: Application | null;
}

type Tab = "manual" | "extract";

export function ApplicationFormModal({ open, onClose, onSubmit, onCreated, initial }: Props) {
  const [tab, setTab] = useState<Tab>("manual");

  function handleClose() {
    setTab("manual");
    onClose();
  }

  async function handleManualSubmit(input: any) {
    await onSubmit(input);
    handleClose();
  }

  function handleExtractCreated() {
    onCreated?.();
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={initial ? "Edit Application" : "Add Application"} size="lg">
      {!initial && (
        <div className="mb-5 flex w-fit gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab("manual")}
            className={clsx(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              tab === "manual" ? "bg-white text-primary-700 shadow-sm" : "text-slate-500"
            )}
          >
            Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setTab("extract")}
            className={clsx(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              tab === "extract" ? "bg-white text-primary-700 shadow-sm" : "text-slate-500"
            )}
          >
            Paste / Extract
          </button>
        </div>
      )}

      {(initial || tab === "manual") && (
        <ManualApplicationForm onSubmit={handleManualSubmit} onCancel={handleClose} initial={initial} />
      )}
      {!initial && tab === "extract" && (
        <ExtractApplicationPanel onCreated={handleExtractCreated} onCancel={handleClose} />
      )}
    </Modal>
  );
}
