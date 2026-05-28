import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import api from "../api/api";

export interface TenantInfo {
  tenantId: {
    _id: string;
    name: string;
    domain?: string;
    plan?: string;
    status?: string;
  };
  role: string;
}

interface TenantContextValue {
  tenants: TenantInfo[];
  activeTenant: TenantInfo | null;
  setActiveTenant: (tenant: TenantInfo) => void;
  /** Switch to the system-level "My Account" context (no tenant). */
  clearActiveTenant: () => void;
  /** Re-fetch tenant memberships from the server. */
  refreshTenants: () => Promise<void>;
  /** True when no tenant is active — user is in their main system account. */
  isSystemContext: boolean;
  loading: boolean;
}

const TenantContext = createContext<TenantContextValue>({
  tenants: [],
  activeTenant: null,
  setActiveTenant: () => {},
  clearActiveTenant: () => {},
  refreshTenants: async () => {},
  isSystemContext: true,
  loading: true,
});

export function useTenant() {
  return useContext(TenantContext);
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [activeTenant, setActiveTenantState] = useState<TenantInfo | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSystemContext = activeTenant === null;

  const fetchTenants = useCallback(async () => {
    try {
      const res = await api.get("/me");
      if (!mountedRef.current) return;
      const userTenants: TenantInfo[] = res.data.tenants ?? [];
      // Deduplicate by tenantId._id — keep only the LAST occurrence (latest role)
      const seen = new Map<string, TenantInfo>();
      for (const t of userTenants) {
        seen.set(t.tenantId._id, t);
      }
      setTenants(Array.from(seen.values()));

      // Restore saved active tenant from localStorage.
      // A value of "__system__" means "My Account" (system context).
      const saved = localStorage.getItem("activeTenantId");
      if (saved === "__system__" || !saved) {
        setActiveTenantState(null);
      } else {
        // If the saved tenant still exists in the updated list, keep it;
        // otherwise fall back to the first tenant or system context.
        const match = userTenants.find((t) => t.tenantId._id === saved);
        if (match) {
          // Update active tenant data (e.g. role may have changed) without
          // switching context — user stays on the same tenant they chose.
          setActiveTenantState(match);
        } else {
          // Saved tenant no longer accessible — fall back to system context
          // rather than auto-picking another tenant without user consent.
          localStorage.setItem("activeTenantId", "__system__");
          setActiveTenantState(null);
        }
      }
      setLoading(false);
    } catch {
      if (mountedRef.current) {
        setTenants([]);
        setActiveTenantState(null);
        setLoading(false);
      }
    }
  }, []);

  // Initial load + auto-refresh on window focus + periodic polling
  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    fetchTenants();

    // Re-fetch when the tab regains focus (user might have been added to a tenant)
    const handleFocus = () => fetchTenants();
    window.addEventListener("focus", handleFocus);

    // Periodic polling every 30s so newly added tenants appear without refresh
    pollingRef.current = setInterval(fetchTenants, 30000);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("focus", handleFocus);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchTenants]);

  const setActiveTenant = (tenant: TenantInfo) => {
    localStorage.setItem("activeTenantId", tenant.tenantId._id);
    setActiveTenantState(tenant);
  };

  const clearActiveTenant = () => {
    localStorage.setItem("activeTenantId", "__system__");
    setActiveTenantState(null);
  };

  return (
    <TenantContext.Provider
      value={{
        tenants,
        activeTenant,
        setActiveTenant,
        clearActiveTenant,
        refreshTenants: fetchTenants,
        isSystemContext,
        loading,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}
