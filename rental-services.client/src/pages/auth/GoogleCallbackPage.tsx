// src/pages/auth/GoogleCallbackPage.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { useToast } from '../../contexts/toast-context';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function GoogleCallbackPage() {
    const { handleGoogleCallback } = useAuth();
    const { toast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const token = query.get('token');

        if (token) {
            handleGoogleCallback(token)
                .then(() => {
                    toast({
                        title: "Google Login Successful",
                        description: "Welcome to VroomVroom!",
                    });
                })
                .catch((error) => {
                    console.error('Google callback error:', error);
                    toast({
                        title: "Google Login Failed",
                        description: error.message || "Unable to sign in with Google. Please try again.",
                        variant: "destructive",
                    });
                    navigate('/auth/login', { replace: true });
                });
        } else {
            toast({
                title: "Google Login Failed",
                description: "No token received. Please try again.",
                variant: "destructive",
            });
            navigate('/auth/login', { replace: true });
        }
    }, [location, handleGoogleCallback, navigate, toast]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Processing Google Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">
                        Please wait while we sign you in...
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}