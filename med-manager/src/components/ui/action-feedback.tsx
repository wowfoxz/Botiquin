"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

export function ActionFeedback() {
  const searchParams = useSearchParams();
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (hasShown) return;

    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const info = searchParams.get("info");
    const warning = searchParams.get("warning");

    if (success) {
      toast.success(success, {
        icon: <CheckCircle className="w-5 h-5" />,
        duration: 4000,
      });
      setHasShown(true);
    } else if (error) {
      toast.error(error, {
        icon: <XCircle className="w-5 h-5" />,
        duration: 5000,
      });
      setHasShown(true);
    } else if (info) {
      toast.info(info, {
        icon: <Info className="w-5 h-5" />,
        duration: 4000,
      });
      setHasShown(true);
    } else if (warning) {
      toast.warning(warning, {
        icon: <AlertTriangle className="w-5 h-5" />,
        duration: 4000,
      });
      setHasShown(true);
    }
  }, [searchParams, hasShown]);

  return null;
}
