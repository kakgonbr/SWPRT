import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { MOCK_RENTALS } from '../../lib/mock-data'
import { format } from 'date-fns'

export default function RentalsTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Rental Management</CardTitle>
                <CardDescription>Monitor and manage all rentals</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {MOCK_RENTALS.slice(0, 10).map((rental) => (
                        <div key={rental.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={rental.bikeImageUrl.split('"')[0]}
                                    alt={rental.bikeName}
                                    className="w-12 h-12 object-cover rounded"
                                />
                                <div>
                                    <p className="font-medium">{rental.bikeName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(rental.startDate, 'MMM d')} - {format(rental.endDate, 'MMM d, yyyy')}
                                    </p>
                                    <p className="text-sm">${rental.totalPrice}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Badge variant={
                                    rental.status === 'Active' ? 'default' :
                                        rental.status === 'Completed' ? 'secondary' :
                                            rental.status === 'Upcoming' ? 'outline' :
                                                'destructive'
                                }>
                                    {rental.status}
                                </Badge>
                                <Button variant="outline" size="sm">
                                    Details
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}