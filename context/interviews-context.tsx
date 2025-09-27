import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { InterviewService } from "@/lib/supabase/interviews";

type InterviewContextType = {
  positions: any[] | null;
  loading: boolean;
  refresh: () => void;
};

const InterviewContext = createContext<InterviewContextType>({
  positions: [],
  loading: true,
  refresh: () => {},
});

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<any[] | null>([]);
  const [loading, setLoading] = useState(true);

  const fetchPositions = async () => {
    setLoading(true);
    const { data, error } = await InterviewService.fetchInterviews();
    if (error) console.error(error);
    else setPositions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  return (
    <InterviewContext.Provider
      value={{ positions, loading, refresh: fetchPositions }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export const useInterviews = () => useContext(InterviewContext);
