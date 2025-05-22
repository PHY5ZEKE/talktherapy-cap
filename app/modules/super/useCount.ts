import { useState, useEffect } from "react";
import { AxiosError } from "axios";

import { getRolesCount } from "api/hooks/super";
import type { ROLES_COUNT } from "types/count";

export default function useCount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<ROLES_COUNT>({
    admins: 0,
    clinicians: 0,
    patients: 0,
  });

  const getCount = async () => {
    setIsLoading(true);
    try {
      const { data } = await getRolesCount();
      setCount(data as ROLES_COUNT);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCount();
  }, []);

  return { isLoading, error, count, getCount };
}
