// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom'
import { Home, Search, Bike } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bike className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-6xl font-bold text-primary mb-2">404</CardTitle>
                    <CardTitle>Page Not Found</CardTitle>
                    <CardDescription>
                        Sorry, we couldn't find the page you're looking for.
                        It might have been moved, deleted, or you entered the wrong URL.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button asChild className="flex-1">
                            <Link to="/">
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="flex-1">
                            <Link to="/bikes">
                                <Search className="w-4 h-4 mr-2" />
                                Browse Bikes
                            </Link>
                        </Button>
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Need help?</p>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/location-finder">Contact Support</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}