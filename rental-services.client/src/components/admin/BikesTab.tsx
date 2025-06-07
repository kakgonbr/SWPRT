import { useState } from 'react'
import { Edit, Plus, Trash2, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useToast } from '../../hooks/use-toast'
import { MOCK_BIKES } from '../../lib/mock-data'
import BikeEditDialog from './BikeEditDialog '
import BikeDeleteDialog from './BikeDeleteDialog '

export interface Bike {
    id: string
    name: string
    type: string
    pricePerDay: number
    imageUrl: string
    isAvailable: boolean
    description?: string
    location?: string
    engineSize?: string
    fuelType?: string
    transmission?: string
    year?: number
}

export default function BikesTab() {
    const { toast } = useToast()
    const [bikes, setBikes] = useState<Bike[]>(MOCK_BIKES)
    const [searchTerm, setSearchTerm] = useState('')
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedBike, setSelectedBike] = useState<Bike | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Filter bikes based on search term
    const filteredBikes = bikes.filter(bike =>
        bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCreateBike = () => {
        setSelectedBike(null)
        setIsCreating(true)
        setIsEditDialogOpen(true)
    }

    const handleEditBike = (bike: Bike) => {
        setSelectedBike(bike)
        setIsCreating(false)
        setIsEditDialogOpen(true)
    }

    const handleDeleteBike = (bike: Bike) => {
        setSelectedBike(bike)
        setIsDeleteDialogOpen(true)
    }

    const handleSaveBike = async (bikeData: Partial<Bike>) => {
        setIsSaving(true)
        try {
            if (isCreating) {
                // Create new bike - exclude id from bikeData
                const { id, ...bikeDataWithoutId } = bikeData as Bike
                const newBike: Bike = {
                    id: Date.now().toString(), // Generate new ID
                    ...bikeDataWithoutId       // Spread everything except id
                }

                const response = await fetch('/api/admin/bikes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(newBike)
                })

                if (response.ok) {
                    setBikes(prev => [...prev, newBike])
                    toast({
                        title: "Bike Created",
                        description: "New bike has been added successfully.",
                    })
                } else {
                    throw new Error('Failed to create bike')
                }
            } else if (selectedBike) {
                // Update existing bike - keep the original id
                const updatedBike = { ...selectedBike, ...bikeData }

                const response = await fetch(`/api/admin/bikes/${selectedBike.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(updatedBike)
                })

                if (response.ok) {
                    setBikes(prev => prev.map(bike =>
                        bike.id === selectedBike.id ? updatedBike : bike
                    ))
                    toast({
                        title: "Bike Updated",
                        description: "Bike information has been updated successfully.",
                    })
                } else {
                    throw new Error('Failed to update bike')
                }
            }

            setIsEditDialogOpen(false)
            setSelectedBike(null)
        } catch (error) {
            console.error('Error saving bike:', error)
            toast({
                title: "Save Failed",
                description: "Failed to save bike information. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleConfirmDelete = async () => {
        if (!selectedBike) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/admin/bikes/${selectedBike.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.ok) {
                setBikes(prev => prev.filter(bike => bike.id !== selectedBike.id))
                toast({
                    title: "Bike Deleted",
                    description: "Bike has been removed from the system.",
                })
            } else {
                throw new Error('Failed to delete bike')
            }

            setIsDeleteDialogOpen(false)
            setSelectedBike(null)
        } catch (error) {
            console.error('Error deleting bike:', error)
            toast({
                title: "Delete Failed",
                description: "Failed to delete bike. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCancelEdit = () => {
        setIsEditDialogOpen(false)
        setSelectedBike(null)
        setIsCreating(false)
    }

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false)
        setSelectedBike(null)
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Bike Management</CardTitle>
                            <CardDescription>Manage bike inventory and availability</CardDescription>
                        </div>
                        <Button onClick={handleCreateBike}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Bike
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search bikes by name or type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    {/* Bikes List */}
                    <div className="space-y-4">
                        {filteredBikes.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchTerm ? 'No bikes found matching your search.' : 'No bikes available.'}
                            </div>
                        ) : (
                            filteredBikes.map((bike) => (
                                <div key={bike.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={bike.imageUrl.split('"')[0]}
                                            alt={bike.name}
                                            className="w-16 h-16 object-cover rounded"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-bike.png'
                                            }}
                                        />
                                        <div>
                                            <p className="font-medium">{bike.name}</p>
                                            <p className="text-sm text-muted-foreground">{bike.type}</p>
                                            <p className="text-sm font-semibold">${bike.pricePerDay}/day</p>
                                            {bike.location && (
                                                <p className="text-xs text-muted-foreground">📍 {bike.location}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant={bike.isAvailable ? 'default' : 'destructive'}>
                                            {bike.isAvailable ? 'Available' : 'Unavailable'}
                                        </Badge>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditBike(bike)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteBike(bike)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Edit/Create Dialog */}
            <BikeEditDialog
                isOpen={isEditDialogOpen}
                onClose={handleCancelEdit}
                bike={selectedBike}
                isCreating={isCreating}
                onSave={handleSaveBike}
                isSaving={isSaving}
            />

            {/* Delete Confirmation Dialog */}
            <BikeDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={handleCancelDelete}
                bike={selectedBike}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />
        </>
    )
}