import { useState } from 'react'
import { Edit, Plus, Trash2, Search, MapPin, Eye, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
import { useToast } from '../../contexts/toast-context'
import { MOCK_BIKES } from '../../lib/mock-data'
import BikeEditDialog from './BikeEditDialog'
import BikeDeleteDialog from './BikeDeleteDialog'

export interface Bike {
    id: string
    name: string
    type: string
    pricePerDay: number
    imageUrl: string
    isAvailable: boolean
    description?: string
    location?: string
    quantity?: number
    engineSize?: string
    fuelType?: string
    transmission?: string
    year?: number
}

export default function BikesTab() {
    const { toast } = useToast()
    const [bikes, setBikes] = useState<Bike[]>(MOCK_BIKES)
    const [searchTerm, setSearchTerm] = useState('')
    const [locationFilter, setLocationFilter] = useState<string>('all')
    const [selectedBikeType, setSelectedBikeType] = useState<string | null>(null)
    const [selectedBikeName, setSelectedBikeName] = useState<string | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedBike, setSelectedBike] = useState<Bike | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Get unique locations from bikes
    const locations = Array.from(new Set(bikes.map(bike => bike.location).filter(Boolean)))

    // Helper function to format bike name as "Type - Location"

    // Filter and aggregate bikes based on location
    const getFilteredData = () => {
        let filteredBikes = bikes

        // Filter by location if selected
        if (locationFilter !== 'all') {
            filteredBikes = bikes.filter(bike => bike.location === locationFilter)
        }

        // If viewing specific bike type details
        if (selectedBikeType && locationFilter !== 'all') {
            return filteredBikes.filter(bike => bike.type === selectedBikeType)
        }

        // If viewing specific bike name details
        if (selectedBikeName && locationFilter !== 'all') {
            return filteredBikes.filter(bike => bike.name === selectedBikeName)
        }

        // If location filter is applied, group by type and show quantities
        if (locationFilter !== 'all') {
            const bikeNames = new Map()

            filteredBikes.forEach(bike => {
                const existing = bikeNames.get(bike.name)
                if (existing) {
                    existing.quantity += (bike.quantity || 1)
                    existing.availableCount += bike.isAvailable ? (bike.quantity || 1) : 0
                    existing.bikes.push(bike)
                } else {
                    bikeNames.set(bike.name, {
                        name: bike.name, // Use bike name instead of type
                        type: bike.type, // Keep type for reference
                        quantity: bike.quantity || 1,
                        availableCount: bike.isAvailable ? (bike.quantity || 1) : 0,
                        priceRange: { min: bike.pricePerDay, max: bike.pricePerDay },
                        bikes: [bike],
                        imageUrl: bike.imageUrl,
                        location: bike.location
                    })
                }

                // Update price range
                const nameData = bikeNames.get(bike.name)
                nameData.priceRange.min = Math.min(nameData.priceRange.min, bike.pricePerDay)
                nameData.priceRange.max = Math.max(nameData.priceRange.max, bike.pricePerDay)
            })

            return Array.from(bikeNames.values())
        }

        // Regular filtering for individual bikes with actual names
        return filteredBikes.filter(bike => {
            return bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bike.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (bike.location && bike.location.toLowerCase().includes(searchTerm.toLowerCase()))
        })
    }

    const filteredData = getFilteredData()
    const isLocationFiltered = locationFilter !== 'all'
    const isViewingTypeDetails = selectedBikeType !== null
    const isViewingBikeDetails = selectedBikeName !== null

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

    const handleBackToTypes = () => {
        setSelectedBikeType(null)
    }

    const handleViewBikeDetails = (bikeName: string) => {
        setSelectedBikeName(bikeName)
    }

    const handleBackToNames = () => {
        setSelectedBikeName(null)
    }

    const handleLocationFilterChange = (value: string) => {
        setLocationFilter(value)
        setSelectedBikeName(null) // Reset bike name selection when location changes
    }

    const handleSaveBike = async (bikeDataArray: Partial<Bike>[]) => {
        setIsSaving(true)
        try {
            if (isCreating) {
                // Create multiple bikes for different locations
                const newBikes: Bike[] = bikeDataArray.map(bikeData => {
                    const { id, ...bikeDataWithoutId } = bikeData as Bike
                    return {
                        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID for each bike
                        ...bikeDataWithoutId
                    }
                })

                // Add all new bikes to state
                setBikes(prev => [...prev, ...newBikes])

                toast({
                    title: "Bikes Created",
                    description: `${newBikes.length} bike${newBikes.length !== 1 ? 's' : ''} added successfully to ${new Set(newBikes.map(b => b.location)).size} location${new Set(newBikes.map(b => b.location)).size !== 1 ? 's' : ''}.`,
                })
            } else if (selectedBike) {
                // Update existing bike (single bike only)
                const updatedBike = { ...selectedBike, ...bikeDataArray[0] }
                setBikes(prev => prev.map(bike =>
                    bike.id === selectedBike.id ? updatedBike : bike
                ))
                toast({
                    title: "Bike Updated",
                    description: "Bike information has been updated successfully.",
                })
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
            setBikes(prev => prev.filter(bike => bike.id !== selectedBike.id))
            toast({
                title: "Bike Deleted",
                description: "Bike has been removed from the system.",
            })

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

    // Get description for current view
    const getViewDescription = () => {
        if (isViewingBikeDetails) {
            return `${selectedBikeName} units at ${locationFilter}`
        }
        if (isLocationFiltered) {
            return `Bike models and quantities at ${locationFilter}`
        }
        return 'Manage bike inventory and availability'
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {(isViewingTypeDetails || isViewingBikeDetails) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={isViewingBikeDetails ? handleBackToNames : handleBackToTypes}
                                        className="p-1 h-8 w-8"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                )}
                                Bike Management
                            </CardTitle>
                            <CardDescription>
                                {getViewDescription()}
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreateBike}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Bike
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex gap-4 mb-4">
                        {/* Location Filter */}
                        <Select value={locationFilter} onValueChange={handleLocationFilterChange}>
                            <SelectTrigger className="w-48">
                                <MapPin className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Locations</SelectItem>
                                {locations.map(location => (
                                    <SelectItem key={location} value={location!}>
                                        {location}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Search Bar */}
                        {(!isLocationFiltered || isViewingTypeDetails || isViewingBikeDetails) && (
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder={isViewingBikeDetails
                                        ? `Search ${selectedBikeName} units...`
                                        : isViewingTypeDetails
                                            ? `Search ${selectedBikeType} bikes...`
                                            : "Search bikes by name, type, or location..."
                                    }
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        )}
                    </div>

                    {/* Content Display */}
                    <div className="space-y-4">
                        {filteredData.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {isViewingTypeDetails
                                    ? `No ${selectedBikeType} bikes found at this location.`
                                    : isViewingBikeDetails
                                        ? `No details found for ${selectedBikeName} at this location.`
                                        : isLocationFiltered
                                            ? 'No bikes available at this location.'
                                            : searchTerm
                                                ? 'No bikes found matching your search.'
                                                : 'No bikes available.'
                                }
                            </div>
                        ) : isLocationFiltered && !isViewingBikeDetails ? (
                            // Show bike names with quantities when location is filtered
                            filteredData.map((nameData: any) => (
                                <div key={nameData.name} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={nameData.imageUrl.split('"')[0]}
                                                alt={nameData.name}
                                                className="w-16 h-16 object-cover rounded"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-bike.png'
                                                }}
                                            />
                                            <div>
                                                <p className="text-lg font-medium">{nameData.name}</p>
                                                <p className="text-sm text-muted-foreground">{nameData.type}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Total Quantity: <span className="font-medium">{nameData.quantity}</span>
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Available: <span className="font-medium text-green-600">{nameData.availableCount}</span>
                                                </p>
                                                <p className="text-sm">
                                                    Price Range: ${nameData.priceRange.min}
                                                    {nameData.priceRange.min !== nameData.priceRange.max &&
                                                        ` - $${nameData.priceRange.max}`
                                                    }/day
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={nameData.availableCount > 0 ? 'default' : 'destructive'}>
                                                {nameData.availableCount > 0 ? 'Available' : 'Out of Stock'}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {nameData.bikes.length} unit{nameData.bikes.length !== 1 ? 's' : ''}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewBikeDetails(nameData.name)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Show individual bikes - this handles both "All Locations" view and bike details view
                            filteredData.map((bike: Bike) => (
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
                                            <p className="text-sm text-muted-foreground">
                                                Quantity: <span className="font-medium">{bike.quantity || 1}</span>
                                            </p>
                                            <p className="text-sm font-semibold">${bike.pricePerDay}/day</p>
                                            {bike.location && (
                                                <p className="text-xs text-muted-foreground">📍 {bike.location}</p>
                                            )}
                                            {bike.engineSize && (
                                                <p className="text-xs text-muted-foreground">Engine: {bike.engineSize}</p>
                                            )}
                                            {bike.transmission && (
                                                <p className="text-xs text-muted-foreground">Transmission: {bike.transmission}</p>
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