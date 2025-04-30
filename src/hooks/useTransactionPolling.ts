import { useState, useEffect } from 'react';
import { useEnquireTransaction } from '@/lib/useWorldApiHooks';
import { toast } from "@/hooks/use-toast";

export const useTransactionPolling = (transactionRef: string | undefined, enabled: boolean) => {
  const { enquireTransaction } = useEnquireTransaction();
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (enabled && transactionRef) {
      setIsPolling(true);
      interval = setInterval(async () => {
        try {
          const result = await enquireTransaction(transactionRef);
          const status = result?.data?.status;
          
          if (["DELIVERED", "FAILED", "CANCELLED"].includes(status)) {
            clearInterval(interval);
            setIsPolling(false);
          }
          
          return { status, result };
        } catch (error) {
          clearInterval(interval);
          setIsPolling(false);
          toast("Failed to fetch transaction status", {
            type: "error"
          });
        }
      }, 10000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [enabled, transactionRef, enquireTransaction]);

  return { isPolling };
};
