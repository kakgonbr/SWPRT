// src/components/ErrorBoundary.tsx
import React, { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo)
    }

    handleRefresh = () => {
        this.setState({ hasError: false, error: undefined })
        window.location.reload()
    }

    handleGoHome = () => {
        this.setState({ hasError: false, error: undefined })
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-destructive" />
                            </div>
                            <CardTitle>Oops! Something went wrong</CardTitle>
                            <CardDescription>
                                We're sorry, but something unexpected happened. Please try refreshing the page or go back to the home page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="p-3 bg-muted rounded-md">
                                    <p className="text-xs font-mono text-muted-foreground">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button onClick={this.handleRefresh} className="flex-1">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh Page
                                </Button>
                                <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                                    <Home className="w-4 h-4 mr-2" />
                                    Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary