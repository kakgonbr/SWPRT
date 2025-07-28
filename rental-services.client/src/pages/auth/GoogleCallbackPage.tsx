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
        const error = query.get('error');

        console.log('GoogleCallbackPage location:', location);
        console.log('GoogleCallbackPage search param:', location);
        console.log('GoogleCallbackPage token:', token);
        console.log('GoogleCallbackPage error:', error);

        if (error) {
            let errorMessage = "Google login failed. Please try again.";
            switch (error) {
                case 'authentication_failed':
                    errorMessage = "Google authentication failed. Please try again.";
                    break;
                case 'missing_user_info':
                    errorMessage = "Unable to retrieve user information from Google.";
                    break;
                case 'user_creation_failed':
                    errorMessage = "Failed to create user account. Please try again.";
                    break;
                case 'server_error':
                    errorMessage = "Server error occurred. Please try again later.";
                    break;
            }

            toast({
                title: "Google Login Failed",
                description: errorMessage,
                variant: "destructive",
            });
            navigate('/auth/login', { replace: true });
            return;
        }

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
            console.error('GoogleCallbackPage: No token and no error in URL params');
            toast({
                title: "Google Login Failed",
                description: "No authentication token received. Please try again.",
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
                        Please wait while we sign you in....
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}