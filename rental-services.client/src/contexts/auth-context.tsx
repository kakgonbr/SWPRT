// src/contexts/auth-context.tsx

//@ts-ignore
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
const API = "import.meta.env.VITE_API_BASE_URL";

interface AuthContextType {
  user: UserDto | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  register: (data: SignupRequest) => Promise<any>;
  loading: boolean;
}

interface UserDto {
  userId: number;
  email: string;
  phoneNumber: string;
  fullName: string;
  address: string | null;
  creationDate: Date;
  emailConfirmed: boolean;
  dateOfBirth: Date | null;
  isActive: boolean;
  role: string;
  driverLicenses: DriverLicenseDto | null;
}

interface DriverLicenseDto {
  licenseId: string;
  holderName: string;
  dateOfIssue: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}
interface LoginResponse {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
  user: UserDto;
}

export interface SignupRequest {
  email: string;
  password: string;
  phone: string;
  name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on app start
    const rawToken = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");
    // If token exists but not the user, refreshes user data
    if (rawToken && !rawUser) {
      fetch(`${API}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${rawToken}`,
        },
      })
        .then((response) => {
          if (!response.ok)
            throw new Error("Refresh failed: " + response.statusText);
          return response.json();
        })
        .then((user: UserDto) => {
          user.role = user.role.toLowerCase();
          setUser(user);
          localStorage.setItem("user", JSON.stringify(user));
        })
        .catch((error) => {
          // Invalid token -> delete it
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          console.error("Error fetching user data:", error);
        })
        .finally(() => setLoading(false));
    } else if (rawUser) {
      // If user data exists in localStorage, set it directly
      setUser(JSON.parse(rawUser));
      setLoading(false);
    } else {
      // No user data or token, no session available
      setLoading(false);
    }
  }, []);
  //@ts-ignore
  const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Login failed: " + response.statusText);
    }
    const result: LoginResponse = await response.json();
    // Persist user data and token
    localStorage.setItem("token", result.accessToken);
    result.user.role = result.user.role.toLowerCase();
    setUser(result.user);
    localStorage.setItem("user", JSON.stringify(result.user));
    return result;
  };

  const register = async (data: SignupRequest) => {
    const response = await fetch(`${API}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error("Sign up failed: " + error.Message);
    }
    return response.json();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
