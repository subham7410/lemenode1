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
  score?: number | { total: number; label: string; breakdown?: any };

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
    color_palette?: {
      name: string;
      hex: string;
      type: "recommended" | "avoid";
      reason?: string;
    }[];
  };
};

/* =========================
   SCORE HISTORY TYPE
========================= */

export type ScoreHistoryEntry = {
  id: string;
  date: string; // ISO string
  score: number;
  skinType?: string;
  skinTone?: string;
  condition?: string;
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

  // Score history for progress tracking
  scoreHistory: ScoreHistoryEntry[];
  addScoreToHistory: (score: number, analysis: Analysis) => Promise<void>;
  clearHistory: () => Promise<void>;

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
const HISTORY_KEY = "@lemenode_score_history";

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
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  /* 🔄 Load stored data */
  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        const storedAnalysis = await AsyncStorage.getItem(ANALYSIS_KEY);
        const storedHistory = await AsyncStorage.getItem(HISTORY_KEY);

        if (storedUser) setUserState(JSON.parse(storedUser));
        if (storedAnalysis) setAnalysisState(JSON.parse(storedAnalysis));
        if (storedHistory) setScoreHistory(JSON.parse(storedHistory));
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

  /* 💾 Save analysis + auto-add to history */
  const setAnalysis = async (data: Analysis) => {
    setAnalysisState(data);
    await AsyncStorage.setItem(ANALYSIS_KEY, JSON.stringify(data));

    // Extract score and add to history
    let scoreValue: number | undefined;
    if (typeof data.score === 'number') {
      scoreValue = data.score;
    } else if (data.score && typeof data.score === 'object' && data.score.total) {
      scoreValue = data.score.total;
    }

    if (scoreValue) {
      await addScoreToHistory(scoreValue, data);
    }
  };

  /* 📊 Add score to history */
  const addScoreToHistory = async (score: number, analysisData: Analysis) => {
    const entry: ScoreHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      score,
      skinType: analysisData.skin_type,
      skinTone: analysisData.skin_tone,
      condition: analysisData.overall_condition,
    };

    const newHistory = [...scoreHistory, entry].slice(-30); // Keep last 30 entries
    setScoreHistory(newHistory);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  /* 🧹 Clear analysis only */
  const clearAnalysis = async () => {
    setAnalysisState(null);
    await AsyncStorage.removeItem(ANALYSIS_KEY);
  };

  /* 🧹 Clear history */
  const clearHistory = async () => {
    setScoreHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  };

  return (
    <AnalysisContext.Provider
      value={{
        user,
        setUser,
        analysis,
        setAnalysis,
        clearAnalysis,
        scoreHistory,
        addScoreToHistory,
        clearHistory,
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