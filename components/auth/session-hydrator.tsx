"use client";

import { useEffect } from "react";
import { fetchSession } from "@/lib/auth-client";
import { clearUser, setStatus, setUser } from "@/store/auth-slice";
import { useAppDispatch } from "@/store/hooks";

export function SessionHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      dispatch(setStatus("loading"));

      const user = await fetchSession();

      if (cancelled) {
        return;
      }

      if (user) {
        dispatch(setUser(user));
      } else {
        dispatch(clearUser());
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}
