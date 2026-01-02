import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* =========================
   USER PROFILE TYPE
========================= */

export type UserProfile = {
  age: number | null;
  gender: "male" | "female" | "other" | null;
  ethnicity: string | null;

  height: number | null; // cm
  weight: number | null; // kg
  diet: "veg" | "non-veg" | null;
};

/* =========================
   ANALYSIS TYPE
========================= */

export type Analysis = {
  skin_type?: string;
  skin_tone?: string;
  overall_condition?: string;
  score?: number;

  visible_issues?: string[];
  positive_aspects?: string[];
  recommendations?: string[];
  lifestyle_tips?: string[];

  food?: {
    eat_more: string[];
    limit: string[];
  };

  health?: {
    daily_habits: string[];
    routine: string[];
  };

  style?: {
    clothing: string[];
    accessories: string[];
  };
};

/* =========================
   CONTEXT TYPE
========================= */

type AnalysisContextType = {
  user: UserProfile;
  setUser: (data: UserProfile) => Promise<void>;

  analysis: Analysis | null;
  setAnalysis: (data: Analysis) => Promise<void>;
  clearAnalysis: () => Promise<void>;

  loading: boolean;
};

/* =========================
   CONTEXT
========================= */

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

/* =========================
   STORAGE KEYS
========================= */

const USER_KEY = "@lemenode_user";
const ANALYSIS_KEY = "@lemenode_analysis";

/* =========================
   PROVIDER
========================= */

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile>({
    age: null,
    gender: null,
    ethnicity: null,
    height: null,
    weight: null,
    diet: null,
  });

  const [analysis, setAnalysisState] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  /* 🔄 Load stored data */
  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        const storedAnalysis = await AsyncStorage.getItem(ANALYSIS_KEY);

        if (storedUser) setUserState(JSON.parse(storedUser));
        if (storedAnalysis) setAnalysisState(JSON.parse(storedAnalysis));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* 💾 Save user */
  const setUser = async (data: UserProfile) => {
    setUserState(data);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data));
  };

  /* 💾 Save analysis */
  const setAnalysis = async (data: Analysis) => {
    setAnalysisState(data);
    await AsyncStorage.setItem(ANALYSIS_KEY, JSON.stringify(data));
  };

  /* 🧹 Clear analysis only */
  const clearAnalysis = async () => {
    setAnalysisState(null);
    await AsyncStorage.removeItem(ANALYSIS_KEY);
  };

  return (
    <AnalysisContext.Provider
      value={{
        user,
        setUser,
        analysis,
        setAnalysis,
        clearAnalysis,
        loading,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

/* =========================
   HOOK
========================= */

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error(
      "useAnalysis must be used within an AnalysisProvider"
    );
  }
  return context;
}
/** history  */
export type AnalysisHistory = {
  id: string;
  date: Date;
  score: number;
  skin_type: string;
  thumbnail?: string;
};