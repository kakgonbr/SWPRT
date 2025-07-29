// src/contexts/auth-context.tsx

//@ts-ignore
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL;

interface AuthContextType {
    user: UserDto | null;
    isAuthenticated: boolean;
    hasPassword: boolean;
    login: (data: LoginRequest) => Promise<LoginResponse>;
    handleGoogleCallback: (token: string) => Promise<void>;
    logout: () => void;
    register: (data: SignupRequest) => Promise<any>;
    refreshUser: () => Promise<void>;
    markPasswordAsSet: () => void;
    loading: boolean;
}

interface UserDto {
    userId: number;
    email: string;
    phoneNumber: string | null;
    passwordHash?: string | null;
    role: string;
    fullName: string;
    address: string | null;
    creationDate: Date;
    emailConfirmed: boolean;
    dateOfBirth: Date | null;
    isActive: boolean;
    driverLicenses: DriverLicenseDto[] | null;
}

interface DriverLicenseDto {
    licenseId: string;
    holderName: string;
    dateOfIssue: Date;
    imageLicenseUrl?: string;
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
    phoneNumber: string;
    name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserDto | null>(null);
    const [hasPassword, setHasPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const refreshUser = async () => {
        const rawToken = localStorage.getItem("token");
        if (!rawToken) {
            throw new Error("No token available");
        }

        try {
            const response = await fetch(`${API}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${rawToken}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to refresh user data: " + response.statusText);
            }

            const userData: UserDto = await response.json();
            userData.role = userData.role.toLowerCase();
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
            console.error("Error refreshing user data:", error);
            throw error;
        }
    };

    const markPasswordAsSet = () => {
        setHasPassword(true);
        // Store this state in localStorage so it persists across sessions
        if (user) {
            localStorage.setItem(`hasPassword_${user.userId}`, 'true');
        }
    };

    const checkPasswordStatus = (userData: UserDto) => {
        // Check if we have stored information about this user having a password
        const storedPasswordStatus = localStorage.getItem(`hasPassword_${userData.userId}`);

        // If user logged in with email/password (not Google), they have a password
        // If we have stored information that they set a password, they have a password
        // If passwordHash is not null (shouldn't happen from backend, but just in case), they have a password
        const userHasPassword = storedPasswordStatus === 'true' || userData.passwordHash !== null;

        setHasPassword(userHasPassword);
    };

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
                .then((userData: UserDto) => {
                    userData.role = userData.role.toLowerCase();
                    setUser(userData);
                    localStorage.setItem("user", JSON.stringify(userData));
                    checkPasswordStatus(userData);
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
            const userData = JSON.parse(rawUser);
            setUser(userData);
            checkPasswordStatus(userData);
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

        // If they logged in with email/password, they have a password
        setHasPassword(true);
        localStorage.setItem(`hasPassword_${result.user.userId}`, 'true');

        return result;
    };

    const handleGoogleCallback = async (token: string) => {
        try {
            const response = await fetch(`${API}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.Message || "Failed to fetch user data");
            }
            const userData: UserDto = await response.json();
            setUser(userData);
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userData));

            // Check if this Google user has previously set a password
            checkPasswordStatus(userData);

            navigate("/", { replace: true });
        } catch (error: any) {
            console.error("Google callback error:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/auth/login", { replace: true });
            throw new Error(error.message || "Google login failed");
        }
    }

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
            throw new Error("Sign up failed: " + error.message);
        }
        return response.json();
    };

    const logout = () => {
        setUser(null);
        setHasPassword(false);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        // Don't remove the hasPassword flag as it should persist for when they log back in
    };

    const value = {
        user,
        isAuthenticated: !!user,
        hasPassword,
        login,
        handleGoogleCallback,
        logout,
        register,
        refreshUser,
        markPasswordAsSet,
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