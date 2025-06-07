import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { MOCK_BIKES } from '../../lib/mock-data'

export default function BikesTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Bike Management</CardTitle>
                <CardDescription>Manage bike inventory and availability</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {MOCK_BIKES.slice(0, 10).map((bike) => (
                        <div key={bike.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={bike.imageUrl.split('"')[0]}
                                    alt={bike.name}
                                    className="w-16 h-16 object-cover rounded"
                                />
                                <div>
                                    <p className="font-medium">{bike.name}</p>
                                    <p className="text-sm text-muted-foreground">{bike.type}</p>
                                    <p className="text-sm">${bike.pricePerDay}/day</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Badge variant={bike.isAvailable ? 'default' : 'destructive'}>
                                    {bike.isAvailable ? 'Available' : 'Unavailable'}
                                </Badge>
                                <Button variant="outline" size="sm">
                                    Edit
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}