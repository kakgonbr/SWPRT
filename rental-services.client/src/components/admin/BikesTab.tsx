import { useState, useEffect, useCallback, useMemo } from 'react'
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

import { BikeEditDialog, type IBikeModelForm } from './BikeEditDialog'
import { useToast } from '../../contexts/toast-context'
import BikeDeleteDialog from './BikeDeleteDialog'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

const API = import.meta.env.VITE_API_BASE_URL;

export interface Bike {
    modelId: number;
    displayName: string;
    description: string;
    ratePerDay: number;
    quantity: number;
    imageFile?: string | null;
    upFrontPercentage: number;
    isAvailable: boolean;
    rating: number;
    vehicleType: string;
    shops: string[];
}


interface VehicleTypeDTO  { vehicleTypeId: number; vehicleTypeName: string }
interface ManufacturerDTO { manufacturerId: number; manufacturerName: string }
interface ShopDTO         { shopid: number; address: string }
interface PeripheralDTO   { peripheralId: number; name: string }

/* ---------- option used by the dialog ---------- */
export interface LookupOption { id: number; label: string }

const fetchList = <T,>(endpoint: string) =>
    fetch(`${API}${endpoint}`, {
        method: "GET",
        headers: {
            Authorization : `Bearer ${localStorage.getItem("token")}`
        }
    }).then(r => {
    if (!r.ok) throw new Error('Network error');
    return r.json() as Promise<T>;
  });

const getVehicleTypes  = () => fetchList<VehicleTypeDTO[]>('/api/bikes/types');
const getManufacturers = () => fetchList<ManufacturerDTO[]>('/api/bikes/manufacturers');
const getShops         = () => fetchList<ShopDTO[]>('/api/bikes/shops');
const getPeripherals   = () => fetchList<PeripheralDTO[]>('/api/bikes/peripherals');

const upsertBike = (p: IBikeModelForm) =>
  fetch(`${API}/api/bikes`, {
    method: p.modelId ? 'PATCH' : 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem("token")}` },
    body: JSON.stringify(p)
  }).then(r => { if (!r.ok) throw new Error('Save failed'); });

export default function BikesTab() {
    const { toast } = useToast()
    const [bikes, setBikes] = useState<Bike[]>()
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('')
    const [locationFilter, setLocationFilter] = useState<string>('all')
    const [selectedBikeType, setSelectedBikeType] = useState<string | null>(null)
    const [selectedBikeName, setSelectedBikeName] = useState<string | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedBike, setSelectedBike] = useState<Bike | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const [editOpen, setEditOpen] = useState(false);
    const [selectedId, setSelected] = useState<number | null>(null);

    /* ---- look‑up queries (NEW syntax) ---- */
    const { data: vTypes = [] } = useQuery<VehicleTypeDTO[]>({
        queryKey: ['vehicleTypes'],
        queryFn: getVehicleTypes,
    });
    const { data: mans = [] } = useQuery<ManufacturerDTO[]>({
        queryKey: ['manufacturers'],
        queryFn: getManufacturers,
    });
    const { data: shops = [] } = useQuery<ShopDTO[]>({
        queryKey: ['shops'],
        queryFn: getShops,
    });
    const { data: peripherals = [] } = useQuery<PeripheralDTO[]>({
        queryKey: ['peripherals'],
        queryFn: getPeripherals,
    });

    /* ---- map to dialog options ---- */
    const vehicleTypes: LookupOption[] = useMemo(
        () => vTypes.map(v => ({ id: v.vehicleTypeId, label: v.vehicleTypeName })), [vTypes]);
    const manufacturers: LookupOption[] = useMemo(
        () => mans.map(m => ({ id: m.manufacturerId, label: m.manufacturerName })), [mans]);
    const shopOptions: LookupOption[] = useMemo(
        () => shops.map(s => ({ id: s.shopid, label: s.address })), [shops]);
    const peripheralOptions: LookupOption[] = useMemo(
        () => peripherals.map(p => ({ id: p.peripheralId, label: p.name })), [peripherals]);

    /* ---- open / close helpers ---- */
    const openCreate = () => { setSelected(null); setEditOpen(true); };
    const openEdit = (id: number) => { setSelected(id); setEditOpen(true); };
    const close = () => setEditOpen(false);

    /* ---- save mutation ---- */
    const qc = useQueryClient();
    const mutation = useMutation({
        mutationFn: upsertBike, onSuccess: () => {
            close();
            qc.invalidateQueries({ queryKey: ['bikes'] });
        }
    });

    const handleSubmit = useCallback(
        (payload: IBikeModelForm) => mutation.mutateAsync(payload),
        [mutation],
    );

    useEffect(() => {
        setError("");

        fetch(`${API}/api/bikes`,
            {
                method: "GET",
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                setBikes(data as Bike[]);
            })
            .catch(err => {
                setError(err.message);
            });
    }, []);

    if (!bikes) {
        return <div>Loading...</div>;
    }

    if (error.length != 0) {
        return <div>Error: {error}</div>;
    }

    // Get unique locations from bikes
    const locations = Array.from(
        new Set(bikes.flatMap(bike => bike.shops))
    );

    // Helper function to format bike name as "Type - Location"

    // Filter and aggregate bikes based on location
    const getFilteredData = () => {
        let filteredBikes = bikes

        // Filter by location if selected
        if (locationFilter !== 'all') {
            filteredBikes = bikes.filter(bike => bike.shops.includes(locationFilter));
        }

        // If viewing specific bike type details
        if (selectedBikeType && locationFilter !== 'all') {
            return filteredBikes.filter(bike => bike.vehicleType === selectedBikeType)
        }

        // If viewing specific bike name details
        if (selectedBikeName && locationFilter !== 'all') {
            return filteredBikes.filter(bike => bike.displayName === selectedBikeName)
        }

        // If location filter is applied, group by type and show quantities
        if (locationFilter !== 'all') {
            const bikeNames = new Map<string, any>();

            filteredBikes.forEach(bike => {
                // Check if the bike is available at the selected location
                if (!bike.shops || !bike.shops.includes(locationFilter)) {
                    return; // Skip if not at the selected location
                }

                const existing = bikeNames.get(bike.displayName);
                if (existing) {
                    existing.quantity += (bike.quantity || 1);
                    existing.availableCount += bike.isAvailable ? (bike.quantity || 1) : 0;
                    existing.bikes.push(bike);
                } else {
                    bikeNames.set(bike.displayName, {
                        displayName: bike.displayName, // Use bike name instead of type
                        type: bike.vehicleType, // Keep type for reference
                        quantity: bike.quantity || 1,
                        availableCount: bike.isAvailable ? (bike.quantity || 1) : 0,
                        priceRange: { min: bike.ratePerDay, max: bike.ratePerDay },
                        bikes: [bike],
                        imageUrl: bike.imageFile,
                        // You could keep a list of locations/shops here if you want
                        shops: bike.shops
                    });
                }

                // Update price range
                const nameData = bikeNames.get(bike.displayName);
                nameData.priceRange.min = Math.min(nameData.priceRange.min, bike.ratePerDay);
                nameData.priceRange.max = Math.max(nameData.priceRange.max, bike.ratePerDay);
            });

            return Array.from(bikeNames.values());
        }


        // Regular filtering for individual bikes with actual names
        return filteredBikes.filter(bike => {
            return bike.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bike.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (bike.shops && bike.shops.some(
                    shop => shop.toLowerCase().includes(searchTerm.toLowerCase())
                ));
        });
    }

    const filteredData = getFilteredData()
    const isLocationFiltered = locationFilter !== 'all'
    const isViewingTypeDetails = selectedBikeType !== null
    const isViewingBikeDetails = selectedBikeName !== null

    //const handleCreateBike = () => {
    //    setSelectedBike(null)
    //    setIsCreating(true)
    //    setIsEditDialogOpen(true)
    //}

    //const handleEditBike = (bike: Bike) => {
    //    setSelectedBike(bike)
    //    setIsCreating(false)
    //    setIsEditDialogOpen(true)
    //}

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

    const handleConfirmDelete = async () => {
        if (!selectedBike) return

        setIsDeleting(true)
        try {
            await fetch(`${API}/api/bikes/${selectedBike.modelId}`,
                {
                    method: "DELETE",
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    setBikes(prev =>
                        prev!.map(bike =>
                            bike.modelId === selectedBike.modelId
                                ? { ...bike, isAvailable: false }
                                : bike
                        )
                    );
                    toast({
                        title: "Bike Deleted",
                        description: "Bike has been removed from the system.",
                    })
                })
                .catch(err => {
                    toast({
                        title: "Failed to delete model.",
                        description: err,
                    })
                });

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
                        <Button onClick={openCreate}>
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
                                <div key={bike.modelId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={bike.imageFile ? bike.imageFile.split('"')[0] : '/images/placeholder-bike.png'}
                                            alt={bike.displayName}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div>
                                            <p className="font-medium">{bike.displayName}</p>
                                            <p className="text-sm text-muted-foreground">{bike.vehicleType}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Quantity: <span className="font-medium">{bike.quantity || 1}</span>
                                            </p>
                                            <p className="text-sm font-semibold">${bike.ratePerDay}/day</p>
                                            {bike.shops && bike.shops.length > 0 && (
                                                <p className="text-xs text-muted-foreground">
                                                    📍 {bike.shops.join(', ')}
                                                </p>
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
                                            onClick={() => openEdit(bike.modelId)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!bike.isAvailable}
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
                isOpen={editOpen}
                onClose={close}
                bikeId={selectedId}
                vehicleTypes={vehicleTypes}
                manufacturers={manufacturers}
                shops={shopOptions}
                peripherals={peripheralOptions}
                onSubmit={handleSubmit}
                isSaving={mutation.isPending}
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