// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import { AuthProvider } from './contexts/auth-context'
import { ChatWidgetProvider } from './contexts/chat-widget-context'
import { ServerInfoProvider } from './contexts/server-info-context'
import Footer from './components/layout/footer.tsx'
import Header from './components/layout/header.tsx'
import ChatWidget from './components/chat/ChatWidget'

// Import pages
import HomePage from './pages/HomePage'
import BikesPage from './pages/BikesPage'
import BikeDetailsPage from './pages/BikeDetailsPage'
import CheckoutPage from './pages/CheckoutPage'
import RentalsPage from './pages/RentalsPage'
import ProfilePage from './pages/ProfilePage'
import LocationFinderPage from './pages/LocationFinderPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import { AdminDashboard } from './pages/admin'
import AdminControlPanel from './pages/admin/AdminControlPanel'

// Error boundary component
import ErrorBoundary from './components/ErrorBoundary'
// 404 Page
import NotFoundPage from './pages/NotFoundPage'
import StaffDashboard from './pages/staff/StaffDashboard'
import ForgotPasswordPage from './pages/auth/ForgotPassword.tsx'
import { MaintenanceBanner } from './components/MaintenanceBanner.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <ChatWidgetProvider>
                            <ServerInfoProvider>
                                <div className="min-h-screen flex flex-col">
                                    <Header />
                                    <MaintenanceBanner />
                                    <main className="flex-grow">
                                        <Routes>
                                            <Route path="/" element={<HomePage />} />
                                            <Route path="/bikes" element={<BikesPage />} />
                                            <Route path="/bikes/:id" element={<BikeDetailsPage />} />
                                            <Route path="/checkout/:id" element={<CheckoutPage />} />
                                            <Route path="/rentals" element={<RentalsPage />} />
                                            <Route path="/profile" element={<ProfilePage />} />
                                            <Route path="/location-finder" element={<LocationFinderPage />} />
                                            <Route path="/auth/login" element={<LoginPage />} />
                                            <Route path="/auth/signup" element={<SignupPage />} />
                                            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                                            <Route path="/admin" element={<AdminDashboard />} />
                                            <Route path="/admin/control-panel" element={<AdminControlPanel />} />
                                            <Route path='/staff' element={<StaffDashboard />} />
                                            <Route path="*" element={<NotFoundPage />} />
                                        </Routes>
                                    </main>
                                    <Footer />
                                </div>
                                <ChatWidget />
                                <Toaster />
                            </ ServerInfoProvider>
                        </ChatWidgetProvider>
                    </AuthProvider>
                </QueryClientProvider>
            </Router>
        </ErrorBoundary>
    )
}

export default App
// mike oxm maul