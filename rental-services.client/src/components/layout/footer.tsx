// src/components/layout/Footer.tsx
import {Link} from 'react-router-dom'
import {Bike, Facebook, Twitter, Instagram, Mail, Phone} from 'lucide-react'
import { useServerInfo } from '../../contexts/server-info-context';

export default function Footer() {
    const { serverInfo, loading, error } = useServerInfo();

    return (
        <footer className="bg-muted/50 border-t">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <Bike className="h-8 w-8 text-primary"/>
                            <span className="font-bold text-xl text-primary">{loading
                                ? "Loading"
                                : error || !serverInfo?.siteName
                                    ? "Vroomvroom.vn"
                                    : serverInfo.siteName}</span>
                        </Link>
                        <p className="text-muted-foreground">
                            Your trusted partner for motorbike rentals in Vietnam. Explore the country on two wheels.
                        </p>
                        <div className="flex space-x-4">
                            <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer"/>
                            <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer"/>
                            <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer"/>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Services</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li><Link to="/bikes" className="hover:text-primary">Bike Rentals</Link></li>
                            <li><Link to="/location-finder" className="hover:text-primary">Locations</Link></li>
                            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
                            <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
                            <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Contact</h3>
                        <div className="space-y-2 text-muted-foreground">
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4"/>
                                <span>{loading
                                    ? "Loading"
                                    : error || !serverInfo?.contactEmail
                                        ? "support@vroomvroom.vn"
                                        : serverInfo.contactEmail}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4"/>
                                <span>{loading
                                    ? "Loading"
                                    : error || !serverInfo?.supportPhone
                                        ? "Unknown"
                                        : serverInfo.supportPhone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
                    <p>&copy; 2025 {loading
                        ? "Loading"
                        : error || !serverInfo?.siteName
                            ? "VroomVroom.vn"
                            : serverInfo.siteName} . All rights reserved."</p>
                </div>
            </div>
        </footer>
    )
}