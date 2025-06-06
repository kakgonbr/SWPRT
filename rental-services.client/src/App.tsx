// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import { AuthProvider } from './contexts/auth-context'
import { ChatWidgetProvider } from './contexts/chat-widget-context'
import Header from './components/layout/header.tsx'
import Footer from './components/layout/footer.tsx'
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

// Error boundary component
import ErrorBoundary from './components/ErrorBoundary'
// 404 Page
import NotFoundPage from './pages/NotFoundPage'

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <ChatWidgetProvider>
                        <div className="min-h-screen flex flex-col">
                            <Header />
                            <main className="flex-grow">
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/bikes" element={<BikesPage />} />
                                    <Route path="/bikes/:id" element={<BikeDetailsPage />} />
                                    <Route path="/checkout" element={<CheckoutPage />} />
                                    <Route path="/rentals" element={<RentalsPage />} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                    <Route path="/location-finder" element={<LocationFinderPage />} />
                                    <Route path="/auth/login" element={<LoginPage />} />
                                    <Route path="/auth/signup" element={<SignupPage />} />
                                    <Route path="/admin" element={<AdminDashboard />} />
                                    <Route path="*" element={<NotFoundPage />} />
                                </Routes>
                            </main>
                            <Footer />
                        </div>
                        <ChatWidget />
                        <Toaster />
                    </ChatWidgetProvider>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    )
}

export default App