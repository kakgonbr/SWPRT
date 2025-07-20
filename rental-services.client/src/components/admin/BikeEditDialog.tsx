//// React hooks for state management and DOM references
//import { useState, useEffect, useRef } from 'react'
//// Lucide icons for UI elements
//import { Save, X, Upload, Trash2 } from 'lucide-react'
//// UI components for dialog structure
//import {
//    Dialog,
//    DialogContent,
//    DialogDescription,
//    DialogHeader,
//    DialogTitle,
//    DialogFooter,
//} from '../ui/dialog'
//// Form input components
//import { Input } from '../ui/input'
//import { Label } from '../ui/label'
//import { Textarea } from '../ui/textarea'
//// Dropdown select components
//import {
//    Select,
//    SelectContent,
//    SelectItem,
//    SelectTrigger,
//    SelectValue,
//} from '../ui/select'
//// Action and control components
//import { Button } from '../ui/button'
//import { Switch } from '../ui/switch'
//import { Checkbox } from '../ui/checkbox'
//// Type definition for Bike entity
//import { type Bike } from './BikesTab'

//// Props interface defining what data the dialog component expects
//interface BikeEditDialogProps {
//    isOpen: boolean                           // Controls dialog visibility
//    onClose: () => void                       // Function to close dialog
//    bike: Bike | null                         // Bike data for editing (null for new bike)
//    isCreating: boolean                       // Flag to differentiate create vs edit mode
//    onSave: (bikeData: Partial<Bike>[]) => void  // Callback with bike data array
//    isSaving: boolean                         // Loading state for save operation
//}

//// Static list of available locations where bikes can be placed
//// TODO: Consider making this dynamic by fetching from API
//const AVAILABLE_LOCATIONS = [
//    'Downtown',
//    'Airport',
//    'Beach',
//    'Mall',
//    'University',
//    'Train Station',
//    'Business District',
//    'Residential Area'
//]

//export default function BikeEditDialog({
//    isOpen,
//    onClose,
//    bike,
//    isCreating,
//    onSave,
//    isSaving
//}: BikeEditDialogProps) {

//    // === STATE MANAGEMENT ===

//    // Main form data state containing all bike properties
//    const [formData, setFormData] = useState({
//        name: '',                             // Bike model name (e.g., Honda CBR600RR)
//        type: '',                             // Bike category (Sport, Scooter, etc.)
//        pricePerDay: 0,                       // Daily rental price
//        imageUrl: '',                         // URL of uploaded image
//        isAvailable: true,                    // Rental availability status
//        description: '',                      // Detailed bike description
//        engineSize: '',                       // Engine displacement (e.g., 150cc)
//        fuelType: '',                         // Gasoline, Electric, Hybrid
//        transmission: '',                     // Manual, Automatic, CVT
//        year: new Date().getFullYear(),       // Manufacturing year
//        quantity: 1                           // Number of bikes
//    })

//    // Location management states (for multi-location bike creation)
//    const [selectedLocations, setSelectedLocations] = useState<string[]>([])           // Array of selected location names
//    const [locationQuantities, setLocationQuantities] = useState<{ [key: string]: number }>({})  // Quantity per location mapping

//    // Image upload states
//    const [selectedFile, setSelectedFile] = useState<File | null>(null)               // Selected file object
//    const [imagePreview, setImagePreview] = useState<string>('')                      // Base64 preview URL
//    const [isUploading, setIsUploading] = useState(false)                            // Upload progress state
//    const fileInputRef = useRef<HTMLInputElement>(null)                              // Reference to hidden file input

//    // === EFFECTS ===

//    // Effect to populate form when editing existing bike or reset when creating new
//    useEffect(() => {
//        if (bike) {
//            // EDIT MODE: Populate form with existing bike data
//            setFormData({
//                name: bike.name || '',
//                type: bike.type || '',
//                pricePerDay: bike.pricePerDay || 0,
//                imageUrl: bike.imageUrl || '',
//                isAvailable: bike.isAvailable ?? true,
//                description: bike.description || '',
//                engineSize: bike.engineSize || '',
//                fuelType: bike.fuelType || '',
//                transmission: bike.transmission || '',
//                year: bike.year || new Date().getFullYear(),
//                quantity: bike.quantity || 1
//            })

//            // Set existing image for preview
//            setImagePreview(bike.imageUrl || '')
//            setSelectedFile(null)

//            // For editing, only select the bike's current location
//            if (bike.location) {
//                setSelectedLocations([bike.location])
//                setLocationQuantities({ [bike.location]: bike.quantity || 1 })
//            }
//        } else if (isCreating) {
//            // CREATE MODE: Reset all form fields to defaults
//            setFormData({
//                name: '',
//                type: '',
//                pricePerDay: 0,
//                imageUrl: '',
//                isAvailable: true,
//                description: '',
//                engineSize: '',
//                fuelType: '',
//                transmission: '',
//                year: new Date().getFullYear(),
//                quantity: 1
//            })
//            setSelectedLocations([])
//            setLocationQuantities({})
//            setSelectedFile(null)
//            setImagePreview('')
//        }
//    }, [bike, isCreating])

//    // === EVENT HANDLERS ===

//    // Handle text and number input changes
//    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//        const { name, value, type } = e.target
//        setFormData(prev => ({
//            ...prev,
//            [name]: type === 'number' ? parseFloat(value) || 0 : value
//        }))
//    }

//    // Handle dropdown select changes
//    const handleSelectChange = (name: string, value: string) => {
//        setFormData(prev => ({
//            ...prev,
//            [name]: value
//        }))
//    }

//    // Handle availability toggle switch
//    const handleSwitchChange = (checked: boolean) => {
//        setFormData(prev => ({
//            ...prev,
//            isAvailable: checked
//        }))
//    }

//    // Handle location checkbox selection (for create mode)
//    const handleLocationChange = (location: string, checked: boolean) => {
//        if (checked) {
//            // Add location to selected list and initialize quantity
//            setSelectedLocations(prev => [...prev, location])
//            setLocationQuantities(prev => ({
//                ...prev,
//                [location]: formData.quantity || 1
//            }))
//        } else {
//            // Remove location from selected list and delete quantity
//            setSelectedLocations(prev => prev.filter(loc => loc !== location))
//            setLocationQuantities(prev => {
//                const newQuantities = { ...prev }
//                delete newQuantities[location]
//                return newQuantities
//            })
//        }
//    }

//    // Handle quantity changes for specific locations
//    const handleLocationQuantityChange = (location: string, quantity: number) => {
//        setLocationQuantities(prev => ({
//            ...prev,
//            [location]: Math.max(1, quantity)  // Ensure minimum quantity of 1
//        }))
//    }

//    // === IMAGE HANDLING ===

//    // Handle file selection from file input
//    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//        const file = e.target.files?.[0]
//        if (file) {
//            // Validate file type - only images allowed
//            if (!file.type.startsWith('image/')) {
//                alert('Please select an image file.')
//                return
//            }

//            // Validate file size - maximum 5MB
//            if (file.size > 5 * 1024 * 1024) {
//                alert('Image size should be less than 5MB.')
//                return
//            }

//            setSelectedFile(file)

//            // Generate preview using FileReader API
//            const reader = new FileReader()
//            reader.onload = (e) => {
//                setImagePreview(e.target?.result as string)
//            }
//            reader.readAsDataURL(file)
//        }
//    }

//    // Remove selected image and reset preview
//    const handleRemoveImage = () => {
//        setSelectedFile(null)
//        setImagePreview('')
//        setFormData(prev => ({ ...prev, imageUrl: '' }))
//        // Clear file input value
//        if (fileInputRef.current) {
//            fileInputRef.current.value = ''
//        }
//    }

//    // Upload image file to server and return URL
//    const uploadImage = async (file: File): Promise<string> => {
//        const formData = new FormData()
//        formData.append('image', file)

//        try {
//            const response = await fetch('/api/admin/upload-image', {
//                method: 'POST',
//                headers: {
//                    'Authorization': `Bearer ${localStorage.getItem('token')}`  // Auth token from localStorage
//                },
//                body: formData
//            })

//            if (!response.ok) {
//                throw new Error('Failed to upload image')
//            }

//            const data = await response.json()
//            return data.imageUrl  // Server returns the stored image URL
//        } catch (error) {
//            console.error('Error uploading image:', error)
//            throw error
//        }
//    }

//    // === FORM SUBMISSION ===

//    // Handle form submission with image upload
//    const handleSubmit = async (e: React.FormEvent) => {
//        e.preventDefault()
//        setIsUploading(true)

//        try {
//            let imageUrl = formData.imageUrl

//            // Upload new image if file was selected
//            if (selectedFile) {
//                imageUrl = await uploadImage(selectedFile)
//            }

//            const updatedFormData = { ...formData, imageUrl }

//            if (isCreating) {
//                // CREATE MODE: Generate bike entries for each selected location
//                const bikesToCreate = selectedLocations.map(location => ({
//                    ...updatedFormData,
//                    location,
//                    quantity: locationQuantities[location] || 1
//                }))
//                onSave(bikesToCreate)
//            } else {
//                // EDIT MODE: Update single bike with new data
//                const updatedBike = {
//                    ...updatedFormData,
//                    location: selectedLocations[0] || '',
//                    quantity: locationQuantities[selectedLocations[0]] || formData.quantity
//                }
//                onSave([updatedBike])
//            }
//        } catch (error) {
//            console.error('Error saving bike:', error)
//            alert('Failed to save bike. Please try again.')
//        } finally {
//            setIsUploading(false)
//        }
//    }

//    // === RENDER COMPONENT ===

//    return (
//        <Dialog open={isOpen} onOpenChange={onClose}>
//            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
//                {/* Dialog Header */}
//                <DialogHeader>
//                    <DialogTitle>
//                        {isCreating ? 'Add New Bike' : `Edit ${bike?.name}`}
//                    </DialogTitle>
//                    <DialogDescription>
//                        {isCreating
//                            ? 'Fill in the details and select locations to add bikes to the inventory.'
//                            : 'Update the bike information and settings.'
//                        }
//                    </DialogDescription>
//                </DialogHeader>

//                {/* Main Form */}
//                <form onSubmit={handleSubmit} className="space-y-4">

//                    {/* Row 1: Bike Name and Type */}
//                    <div className="grid grid-cols-2 gap-4">
//                        {/* Bike Name Input */}
//                        <div className="space-y-2">
//                            <Label htmlFor="name">Bike Name *</Label>
//                            <Input
//                                id="name"
//                                name="name"
//                                value={formData.name}
//                                onChange={handleInputChange}
//                                placeholder="e.g., Honda CBR600RR"
//                                required
//                            />
//                        </div>

//                        {/* Bike Type Dropdown */}
//                        <div className="space-y-2">
//                            <Label htmlFor="type">Bike Type *</Label>
//                            <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
//                                <SelectTrigger>
//                                    <SelectValue placeholder="Select bike type" />
//                                </SelectTrigger>
//                                <SelectContent>
//                                    <SelectItem value="Scooter">Scooter</SelectItem>
//                                    <SelectItem value="Sport">Sport</SelectItem>
//                                    <SelectItem value="Cruiser">Cruiser</SelectItem>
//                                    <SelectItem value="Touring">Touring</SelectItem>
//                                    <SelectItem value="Off-road">Off-road</SelectItem>
//                                    <SelectItem value="Electric">Electric</SelectItem>
//                                </SelectContent>
//                            </Select>
//                        </div>
//                    </div>

//                    {/* Row 2: Price per Day */}
//                    <div className="space-y-2">
//                        <Label htmlFor="pricePerDay">Price per Day ($) *</Label>
//                        <Input
//                            id="pricePerDay"
//                            name="pricePerDay"
//                            type="number"
//                            min="0"
//                            step="0.01"
//                            value={formData.pricePerDay}
//                            onChange={handleInputChange}
//                            placeholder="0.00"
//                            required
//                        />
//                    </div>

//                    {/* Row 3: Technical Specifications */}
//                    <div className="grid grid-cols-3 gap-4">
//                        {/* Engine Size */}
//                        <div className="space-y-2">
//                            <Label htmlFor="engineSize">Engine Size</Label>
//                            <Input
//                                id="engineSize"
//                                name="engineSize"
//                                value={formData.engineSize}
//                                onChange={handleInputChange}
//                                placeholder="e.g., 150cc"
//                            />
//                        </div>

//                        {/* Fuel Type */}
//                        <div className="space-y-2">
//                            <Label htmlFor="fuelType">Fuel Type</Label>
//                            <Select value={formData.fuelType} onValueChange={(value) => handleSelectChange('fuelType', value)}>
//                                <SelectTrigger>
//                                    <SelectValue placeholder="Select fuel type" />
//                                </SelectTrigger>
//                                <SelectContent>
//                                    <SelectItem value="Gasoline">Gasoline</SelectItem>
//                                    <SelectItem value="Electric">Electric</SelectItem>
//                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
//                                </SelectContent>
//                            </Select>
//                        </div>

//                        {/* Manufacturing Year */}
//                        <div className="space-y-2">
//                            <Label htmlFor="year">Year</Label>
//                            <Input
//                                id="year"
//                                name="year"
//                                type="number"
//                                min="1990"
//                                max={new Date().getFullYear() + 1}
//                                value={formData.year}
//                                onChange={handleInputChange}
//                            />
//                        </div>
//                    </div>

//                    {/* Row 4: Transmission */}
//                    <div className="space-y-2">
//                        <Label htmlFor="transmission">Transmission</Label>
//                        <Select value={formData.transmission} onValueChange={(value) => handleSelectChange('transmission', value)}>
//                            <SelectTrigger>
//                                <SelectValue placeholder="Select transmission" />
//                            </SelectTrigger>
//                            <SelectContent>
//                                <SelectItem value="Manual">Manual</SelectItem>
//                                <SelectItem value="Automatic">Automatic</SelectItem>
//                                <SelectItem value="CVT">CVT</SelectItem>
//                            </SelectContent>
//                        </Select>
//                    </div>

//                    {/* Location Selection Section */}
//                    <div className="space-y-2">
//                        <Label>
//                            {isCreating ? 'Select Locations *' : 'Location *'}
//                        </Label>
//                        <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
//                            {isCreating ? (
//                                /* CREATE MODE: Multiple location checkboxes with quantity inputs */
//                                <div className="space-y-3">
//                                    <p className="text-sm text-muted-foreground mb-3">
//                                        Select one or more locations where this bike will be available:
//                                    </p>
//                                    {AVAILABLE_LOCATIONS.map((location) => (
//                                        <div key={location} className="flex items-center justify-between">
//                                            {/* Location Checkbox */}
//                                            <div className="flex items-center space-x-2">
//                                                <Checkbox
//                                                    id={`location-${location}`}
//                                                    checked={selectedLocations.includes(location)}
//                                                    onCheckedChange={(checked) =>
//                                                        handleLocationChange(location, checked as boolean)
//                                                    }
//                                                />
//                                                <Label htmlFor={`location-${location}`} className="text-sm">
//                                                    {location}
//                                                </Label>
//                                            </div>
//                                            {/* Quantity Input (appears when location is selected) */}
//                                            {selectedLocations.includes(location) && (
//                                                <div className="flex items-center space-x-2">
//                                                    <Label className="text-xs text-muted-foreground">Qty:</Label>
//                                                    <Input
//                                                        type="number"
//                                                        min="1"
//                                                        value={locationQuantities[location] || 1}
//                                                        onChange={(e) =>
//                                                            handleLocationQuantityChange(location, parseInt(e.target.value) || 1)
//                                                        }
//                                                        className="w-16 h-8 text-sm"
//                                                    />
//                                                </div>
//                                            )}
//                                        </div>
//                                    ))}
//                                    {/* Validation Message */}
//                                    {selectedLocations.length === 0 && (
//                                        <p className="text-sm text-red-600">Please select at least one location.</p>
//                                    )}
//                                </div>
//                            ) : (
//                                /* EDIT MODE: Single location dropdown */
//                                <Select
//                                    value={selectedLocations[0] || ''}
//                                    onValueChange={(value) => {
//                                        setSelectedLocations([value])
//                                        setLocationQuantities({ [value]: formData.quantity })
//                                    }}
//                                >
//                                    <SelectTrigger>
//                                        <SelectValue placeholder="Select location" />
//                                    </SelectTrigger>
//                                    <SelectContent>
//                                        {AVAILABLE_LOCATIONS.map((location) => (
//                                            <SelectItem key={location} value={location}>
//                                                {location}
//                                            </SelectItem>
//                                        ))}
//                                    </SelectContent>
//                                </Select>
//                            )}
//                        </div>
//                    </div>

//                    {/* Quantity Input (Edit Mode Only) */}
//                    {!isCreating && (
//                        <div className="space-y-2">
//                            <Label htmlFor="quantity">Quantity *</Label>
//                            <Input
//                                id="quantity"
//                                name="quantity"
//                                type="number"
//                                min="1"
//                                value={formData.quantity}
//                                onChange={handleInputChange}
//                                placeholder="1"
//                                required
//                            />
//                        </div>
//                    )}

//                    {/* Image Upload Section */}
//                    <div className="space-y-2">
//                        <Label>Bike Image</Label>
//                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
//                            {imagePreview ? (
//                                /* Image Preview State */
//                                <div className="space-y-3">
//                                    <div className="relative inline-block">
//                                        {/* Image Preview */}
//                                        <img
//                                            src={imagePreview}
//                                            alt="Bike preview"
//                                            className="w-32 h-32 object-cover rounded border"
//                                        />
//                                        {/* Remove Image Button */}
//                                        <Button
//                                            type="button"
//                                            variant="destructive"
//                                            size="sm"
//                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
//                                            onClick={handleRemoveImage}
//                                        >
//                                            <Trash2 className="h-3 w-3" />
//                                        </Button>
//                                    </div>
//                                    {/* Change Image Button */}
//                                    <div className="flex gap-2">
//                                        <Button
//                                            type="button"
//                                            variant="outline"
//                                            size="sm"
//                                            onClick={() => fileInputRef.current?.click()}
//                                        >
//                                            <Upload className="h-4 w-4 mr-2" />
//                                            Change Image
//                                        </Button>
//                                    </div>
//                                </div>
//                            ) : (
//                                /* No Image State - Upload Prompt */
//                                <div className="text-center py-6">
//                                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
//                                    <p className="text-sm text-gray-600 mb-2">
//                                        Click to upload bike image
//                                    </p>
//                                    <p className="text-xs text-gray-400">
//                                        PNG, JPG, GIF up to 5MB
//                                    </p>
//                                    <Button
//                                        type="button"
//                                        variant="outline"
//                                        className="mt-3"
//                                        onClick={() => fileInputRef.current?.click()}
//                                    >
//                                        <Upload className="h-4 w-4 mr-2" />
//                                        Select Image
//                                    </Button>
//                                </div>
//                            )}
//                            {/* Hidden File Input */}
//                            <input
//                                ref={fileInputRef}
//                                type="file"
//                                accept="image/*"
//                                onChange={handleFileSelect}
//                                className="hidden"
//                            />
//                        </div>
//                    </div>

//                    {/* Description Textarea */}
//                    <div className="space-y-2">
//                        <Label htmlFor="description">Description</Label>
//                        <Textarea
//                            id="description"
//                            name="description"
//                            value={formData.description}
//                            onChange={handleInputChange}
//                            placeholder="Enter bike description..."
//                            rows={3}
//                        />
//                    </div>

//                    {/* Availability Toggle */}
//                    <div className="flex items-center space-x-2">
//                        <Switch
//                            id="isAvailable"
//                            checked={formData.isAvailable}
//                            onCheckedChange={handleSwitchChange}
//                        />
//                        <Label htmlFor="isAvailable">Available for rental</Label>
//                    </div>

//                    {/* Creation Summary (Create Mode Only) */}
//                    {isCreating && selectedLocations.length > 0 && (
//                        <div className="bg-muted/50 p-3 rounded-lg">
//                            <p className="font-medium text-sm mb-2">Summary:</p>
//                            <p className="text-sm text-muted-foreground">
//                                Creating <strong>{formData.name}</strong> ({formData.type}) at:
//                            </p>
//                            {/* Location List */}
//                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
//                                {selectedLocations.map(location => (
//                                    <li key={location}>
//                                        • {location}: {locationQuantities[location]} bike{locationQuantities[location] !== 1 ? 's' : ''}
//                                    </li>
//                                ))}
//                            </ul>
//                            {/* Total Count */}
//                            <p className="text-sm font-medium mt-2">
//                                Total: {Object.values(locationQuantities).reduce((sum, qty) => sum + qty, 0)} bikes
//                            </p>
//                        </div>
//                    )}
//                </form>

//                {/* Dialog Footer with Action Buttons */}
//                <DialogFooter>
//                    {/* Cancel Button */}
//                    <Button
//                        variant="outline"
//                        onClick={onClose}
//                        disabled={isSaving || isUploading}
//                    >
//                        <X className="h-4 w-4 mr-2" />
//                        Cancel
//                    </Button>
//                    {/* Save/Create Button */}
//                    <Button
//                        onClick={handleSubmit}
//                        disabled={isSaving || isUploading || (isCreating && selectedLocations.length === 0) || !formData.name.trim()}
//                    >
//                        {isSaving || isUploading ? (
//                            /* Loading State */
//                            <>
//                                {isUploading ? 'Uploading...' : 'Saving...'}
//                            </>
//                        ) : (
//                            /* Normal State */
//                            <>
//                                <Save className="h-4 w-4 mr-2" />
//                                {isCreating ?
//                                    `Create ${selectedLocations.length} Bike${selectedLocations.length !== 1 ? 's' : ''}` :
//                                    'Save Changes'
//                                }
//                            </>
//                        )}
//                    </Button>
//                </DialogFooter>
//            </DialogContent>
//        </Dialog>
//    )
//}

// --------------------------------------------------
// Dialog data contracts
// --------------------------------------------------

//export type VehicleCondition = 'Normal' | 'Good' | 'Excellent' | 'Damaged';

//export interface IBikeModelForm {
//    /** Existing model PK (undefined when creating) */
//    modelId?: number;
//    /** Required – FK to vehicle‑type master */
//    vehicleTypeId: number | null | undefined;
//    /** Required – FK to manufacturer master */
//    manufacturerId: number | null;

//    /* Simple scalar fields */
//    modelName: string;
//    displayName: string;
//    description: string;
//    ratePerDay: number;
//    upFrontPercentage: number;
//    isAvailable: boolean;

//    /* Image handling */
//    imageFile?: File | null;
//    imagePreviewUrl?: string;   // for the <img/>, not sent to API

//    /* 1‑to‑many vehicle instances */
//    vehicles: IVehicle[];
//}

export interface IVehicle {
    /** Existing vehicle primary‑key (undefined for brand‑new rows) */
    vehicleId?: number;
    /** FK to the shop the bike is parked at */
    shopId: number;
    /** Cosmetic only; you never send it back */
    shopAddress?: string;
    /** Condition selector */
    condition: VehicleCondition;
}

/** Convenience typed change wrapper for <input/>, <textarea/> */
export const onTextChange =
    <K extends keyof IBikeModelForm>(key: K, set: React.Dispatch<React.SetStateAction<IBikeModelForm>>) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            set(prev => ({ ...prev, [key]: e.target.value }));

/** Generic numeric parser that never lets NaN in */
export const onNumberChange =
    <K extends keyof IBikeModelForm>(key: K, set: React.Dispatch<React.SetStateAction<IBikeModelForm>>) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            set(prev => ({ ...prev, [key]: Number(e.target.value) || 0 }));

import { useEffect, useRef, useState } from 'react';
import {
    Dialog, DialogContent, DialogFooter, DialogHeader,
    DialogTitle, DialogDescription
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
    from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
    Upload, Trash2, Save, X,
    //Plus
} from 'lucide-react';

import {
    useQuery,
} from '@tanstack/react-query'
//import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';


const API = import.meta.env.VITE_API_BASE_URL;

/** API wrapper – replace with your real fetcher */
async function getBikeById(id: number): Promise<IBikeModelForm> {
    const res = await fetch(`${API}/api/bikes/${id}`);
    if (!res.ok) throw new Error('Network error');
    return res.json();
}

export interface Option { id: number; label: string }

export interface BikeEditDialogProps {
    /** Show / hide the modal */
    isOpen: boolean;
    /** Parent closes the dialog (also clears local state there) */
    onClose: () => void;

    /** ── NEW ── primary‑key of the model being edited; 
     *  pass `null` (or 0) to open in “create” mode */
    bikeId: number | null;

    /** Lookup tables (fetched once by the parent and reused) */
    vehicleTypes: Option[];
    manufacturers: Option[];
    shops: Option[];

    /**
     * Called when the user presses **Save**.
     * The component hands you the fully‑validated form payload
     * (same shape as the API expects, incl. `vehicles` array).
     *
     * You return a promise; while it is pending the dialog shows a spinner.
     */
    onSubmit: (payload: IBikeModelForm) => Promise<void>;

    /** OPTIONAL: let the parent control the loading state if desired */
    isSaving?: boolean;
}
const CONDITION_OPTIONS: VehicleCondition[] = [
    'Normal', 'Damaged',
];

/* --------------------------  VEHICLE ROW  -------------------------- */
//const VehicleRow = (
//    props: {
//        vehicle: IVehicle;
//        idx: number;
//        shops: Option[];
//        onChange: (partial: Partial<IVehicle>) => void;
//        onDelete: () => void;
//    },
//) => (
//    <div
//        className="grid grid-cols-[1fr_160px_40px] items-center gap-4 border rounded-lg p-3"
//    >
//        {/* Shop selector */}
//        <Select
//            value={String(props.vehicle.shopId)}
//            onValueChange={val => props.onChange({ shopId: Number(val) })}
//        >
//            <SelectTrigger>
//                <SelectValue placeholder="Select shop" />
//            </SelectTrigger>
//            <SelectContent>
//                {props.shops.map(s => (
//                    <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>
//                ))}
//            </SelectContent>
//        </Select>

//        {/* Condition selector */}
//        <Select
//            value={props.vehicle.condition}
//            onValueChange={val => props.onChange({ condition: val as VehicleCondition })}
//        >
//            <SelectTrigger>
//                <SelectValue />
//            </SelectTrigger>
//            <SelectContent>
//                {CONDITION_OPTIONS.map(opt => (
//                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
//                ))}
//            </SelectContent>
//        </Select>

//        {/* Delete icon */}
//        <Button
//            type="button"
//            variant="ghost"
//            size="icon"
//            onClick={props.onDelete}
//            aria-label="Delete vehicle row"
//        >
//            <Trash2 className="w-4 h-4" />
//        </Button>
//    </div>
//);

type GroupedVehicles = Record<
    number, // shopId
    Partial<Record<VehicleCondition, IVehicle[]>> // condition -> vehicle[]
>;

const groupVehiclesByShop = (vehicles: IVehicle[]): GroupedVehicles => {
    return vehicles.reduce((acc, vehicle) => {
        if (!acc[vehicle.shopId]) {
            acc[vehicle.shopId] = {};
        }
        if (!acc[vehicle.shopId][vehicle.condition]) {
            acc[vehicle.shopId][vehicle.condition] = [];
        }
        acc[vehicle.shopId][vehicle.condition]!.push(vehicle);
        return acc;
    }, {} as GroupedVehicles);
};

/* ------------------------------------------------------------------ */
/* 0. Utilities – unchanged                                            */
/* ------------------------------------------------------------------ */
export type VehicleCondition = 'Normal' | 'Damaged';

export interface IVehicle {
    vehicleId?: number;
    shopId: number;
    shopAddress?: string;
    condition: VehicleCondition;
}

export interface IPeripheral {
    peripheralId: number;
    name?: string;
    ratePeraDay?: number;
}

export interface IBikeModelForm {
    modelId?: number;
    vehicleTypeId: number | null;
    manufacturerId: number | null;
    modelName: string;
    displayName: string;
    description: string;
    ratePerDay: number;
    upFrontPercentage: number;
    isAvailable: boolean;
    imageFile?: File | null;
    imagePreviewUrl?: string;
    vehicles: IVehicle[];
    peripherals: IPeripheral[];
}

/* Same onTextChange / onNumberChange helpers as before
   – they now receive a non‑nullable setter. */

/* ------------------------------------------------------------------ */
/* 1. Empty template maker – guarantees *all* required fields exist    */
/* ------------------------------------------------------------------ */
const makeEmptyForm = (): IBikeModelForm => ({
    modelId: undefined,
    vehicleTypeId: null,
    manufacturerId: null,
    modelName: '',
    displayName: '',
    description: '',
    ratePerDay: 0,
    upFrontPercentage: 0,
    isAvailable: true,
    imageFile: null,
    imagePreviewUrl: undefined,
    vehicles: [],
    peripherals: []
});

/* ------------------------------------------------------------------ */
/* 2. Component props                                                  */
/* ------------------------------------------------------------------ */
export interface BikeEditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    bikeId: number | null;
    vehicleTypes: Option[];
    manufacturers: Option[];
    peripherals: Option[];
    shops: Option[];
    onSubmit: (payload: IBikeModelForm) => Promise<void>;
    isSaving?: boolean;
}

/* ------------------------------------------------------------------ */
/* 3. Component implementation                                         */
/* ------------------------------------------------------------------ */
export const BikeEditDialog: React.FC<BikeEditDialogProps> = ({
    isOpen,
    onClose,
    bikeId,
    vehicleTypes,
    manufacturers,
    peripherals,
    shops,
    onSubmit,
    isSaving = false,
}) => {
    /* Fetch the bike whenever dialog opens */
    const { data, isLoading } = useQuery({
        queryKey: ['bike', bikeId],
        queryFn: () => getBikeById(bikeId as number),
        enabled: isOpen && bikeId != null,
        refetchOnWindowFocus: false,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    /* -------- State is **never** null now -------- */
    //@ts-ignore
    const [isUploading, setIsUploading] = useState(false)
    const [formData, setFormData] = useState<IBikeModelForm>(makeEmptyForm);
    const isCreating = !formData.modelId;                               // derived flag
    /* Seed / re‑seed when fetched data arrives or when switching to create mode */
    useEffect(() => {
        if (bikeId == null) {
            setFormData(makeEmptyForm());
        } else if (data) {
            setFormData(data);
        }
    }, [bikeId, data]);

    /* ---------------- Callbacks ---------------- */
    const handleSubmit = async () => {
        await onSubmit(formData);
    };

    const togglePeripheral = (pid: number, checked: boolean) =>
        setFormData(prev => {
            const exists = prev.peripherals.some(p => p.peripheralId === pid);
            let peripherals = prev.peripherals;
            if (checked && !exists) {
                peripherals = [...peripherals, { peripheralId: pid }];
            }
            if (!checked && exists) {
                peripherals = peripherals.filter(p => p.peripheralId !== pid);
            }
            return { ...prev, peripherals };
        });

    /* Non‑null assertion (`prev!`) used in every setter */
    const setField =
        <K extends keyof IBikeModelForm>(key: K) =>
            (value: IBikeModelForm[K]) =>
                setFormData(prev => ({ ...prev, [key]: value }));

    //const updateVehicle = (idx: number, patch: Partial<IVehicle>) =>
    //    setFormData(prev => ({
    //        ...prev,
    //        vehicles: prev.vehicles.map((v, i) =>
    //            i === idx ? { ...v, ...patch } : v,
    //        ),
    //    }));

    //const removeVehicle = (idx: number) =>
    //    setFormData(prev => ({
    //        ...prev,
    //        vehicles: prev.vehicles.filter((_, i) => i !== idx),
    //    }));

    //const addVehicle = () =>
    //    setFormData(prev => ({
    //        ...prev,
    //        vehicles: [
    //            ...prev.vehicles,
    //            { shopId: shops[0]?.id ?? 0, condition: 'Normal' },
    //        ],
    //    }));

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFormData(prev => ({
            ...prev,
            imageFile: file,
            imagePreviewUrl: URL.createObjectURL(file),
        }));
    };

    const addVehicleWithParams = (shopId: number, condition: VehicleCondition) => {
        setFormData(prev => ({
            ...prev,
            vehicles: [
                ...prev.vehicles,
                { shopId, condition },
            ],
        }));
    };

    const removeVehicleBatch = (shopId: number, condition: VehicleCondition, count: number) => {
        setFormData(prev => {
            let removed = 0;
            const vehicles = prev.vehicles.filter(v => {
                if (removed < count && v.shopId === shopId && v.condition === condition) {
                    removed++;
                    return false;
                }
                return true;
            });
            return { ...prev, vehicles };
        });
    };

    /* ---------------- Render ---------------- */
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* show a spinner while loading the bike */}
            {isLoading && <div className="p-10 text-center">Loading bike…</div>}
            {formData && (
                <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
                    {/* ---------- Header ---------- */}
                    <DialogHeader>
                        <DialogTitle>
                            {isCreating ? 'Add New Bike Model' : `Edit ${formData.displayName}`}
                        </DialogTitle>
                        <DialogDescription>
                            {isCreating
                                ? 'Fill in the details to add a new model and its physical vehicles.'
                                : 'Update the bike model information, image and fleet.'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* ---------- FORM BODY ---------- */}
                    <form className="space-y-5" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                        {/* -------------------------------------------------- */}
                        {/* Top‑level scalars */}
                        {/* -------------------------------------------------- */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Model name */}
                            <div className="space-y-1">
                                <Label htmlFor="modelName">Model name *</Label>
                                <Input id="modelName" required
                                    value={formData.modelName}
                                    onChange={onTextChange('modelName', setFormData)}
                                />
                            </div>
                        </div>

                        {/* Vehicle type + Manufacturer */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Vehicle type */}
                            <div className="space-y-1">
                                <Label>Vehicle type *</Label>
                                <Select
                                    value={String(formData.vehicleTypeId ?? '')}
                                    onValueChange={val => setField('vehicleTypeId')(Number(val))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicleTypes.map(t => (
                                            <SelectItem key={t.id} value={String(t.id)}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Manufacturer */}
                            <div className="space-y-1">
                                <Label>Manufacturer *</Label>
                                <Select
                                    value={String(formData.manufacturerId ?? '')}
                                    onValueChange={val => setField('manufacturerId')(Number(val))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select manufacturer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {manufacturers.map(m => (
                                            <SelectItem key={m.id} value={String(m.id)}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Rate / Up‑front / Availability */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Daily rate */}
                            <div className="space-y-1">
                                <Label htmlFor="ratePerDay">Rate per day (VND) *</Label>
                                <Input id="ratePerDay" type="number" min={0} required
                                    value={formData.ratePerDay}
                                    onChange={onNumberChange('ratePerDay', setFormData)}
                                />
                            </div>

                            {/* Up‑front percentage */}
                            <div className="space-y-1">
                                <Label htmlFor="upfront">Up‑front (%) *</Label>
                                <Input id="upfront" type="number" min={0} max={100} required
                                    value={formData.upFrontPercentage}
                                    onChange={onNumberChange('upFrontPercentage', setFormData)}
                                />
                            </div>

                            {/* Availability toggle */}
                            <div className="flex items-end space-x-2">
                                <Switch id="isAvailable"
                                    checked={formData.isAvailable}
                                    onCheckedChange={setField('isAvailable')}
                                />
                                <Label htmlFor="isAvailable">Available</Label>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <Label htmlFor="desc">Description</Label>
                            <Textarea
                                id="desc"
                                rows={3}
                                value={formData.description}
                                onChange={onTextChange('description', setFormData)}
                            />
                        </div>

                        {/* -------------------------------------------------- */}
                        {/* Image upload / preview */}
                        {/* -------------------------------------------------- */}
                        <div className="space-y-2">
                            <Label>Model image</Label>
                            <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center">
                                {formData.imagePreviewUrl ? (
                                    <div className="relative">
                                        <img
                                            src={formData.imagePreviewUrl}
                                            alt="preview"
                                            className="w-40 h-40 object-cover rounded-lg"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                imageFile: null,
                                                imagePreviewUrl: undefined,
                                            }))}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 opacity-50 mb-2" />
                                        <p className="text-sm text-muted-foreground">PNG/JPG (MAX 5MB)</p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-2"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Select file
                                        </Button>
                                    </>
                                )}

                                {/* hidden input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageSelect}
                                />
                            </div>
                        </div>

                        {/* -------------------------------------------------- */}
                        {/* Vehicle instances list */}
                        {/* -------------------------------------------------- */}
                        {/*<div className="space-y-2">*/}
                        {/*    <Label>Physical vehicles *</Label>*/}

                        {/*    <div className="space-y-3">*/}
                        {/*        {formData.vehicles.map((v, idx) => (*/}
                        {/*            <VehicleRow*/}
                        {/*                key={v.vehicleId ?? idx}*/}
                        {/*                vehicle={v}*/}
                        {/*                idx={idx}*/}
                        {/*                shops={shops}*/}
                        {/*                onChange={patch => updateVehicle(idx, patch)}*/}
                        {/*                onDelete={() => removeVehicle(idx)}*/}
                        {/*            />*/}
                        {/*        ))}*/}

                        {/*        <Button*/}
                        {/*            type="button"*/}
                        {/*            variant="secondary"*/}
                        {/*            size="sm"*/}
                        {/*            onClick={addVehicle}*/}
                        {/*            className="w-full"*/}
                        {/*        >*/}
                        {/*            <Plus className="w-4 h-4 mr-2" />*/}
                        {/*            Add vehicle*/}
                        {/*        </Button>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                        <div className="space-y-2">
                            <Label>Physical vehicles *</Label>

                            <div className="space-y-3">
                                {shops.map((shop) => {
                                    const shopId = shop.id;
                                    const conditionMap = groupVehiclesByShop(formData.vehicles)[shopId] ?? {};

                                    return (
                                        <div key={shopId} className="border rounded p-3 space-y-2">
                                            <h4 className="font-semibold">{shop.label}</h4>

                                            {CONDITION_OPTIONS.map((condition) => {
                                                const vehicles = conditionMap[condition] ?? [];

                                                return (
                                                    <div key={condition} className="flex items-center gap-4">
                                                        <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded w-24 text-center">
                                                            {condition}
                                                        </span>

                                                        {/* Adjustable count input */}
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={vehicles.length}
                                                            onChange={(e) => {
                                                                const newCount = Number(e.target.value);
                                                                const delta = newCount - vehicles.length;

                                                                if (delta > 0) {
                                                                    for (let i = 0; i < delta; i++) {
                                                                        addVehicleWithParams(shopId, condition);
                                                                    }
                                                                } else if (delta < 0) {
                                                                    removeVehicleBatch(shopId, condition, -delta);
                                                                }
                                                            }}
                                                            className="w-20 border rounded px-2 py-1 text-sm"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>


                        {/* -------------------------------------------------- */}
                        {/* Peripherals (scrollable)                           */}
                        {/* -------------------------------------------------- */}
                        <div className="space-y-2">
                            <Label>Peripherals</Label>
                            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                                {peripherals.map(periph => {
                                    const checked = formData.peripherals
                                        .some(p => p.peripheralId === periph.id);
                                    return (
                                        <div
                                            key={periph.id}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`periph-${periph.id}`}
                                                checked={checked}
                                                onCheckedChange={val =>
                                                    togglePeripheral(periph.id, val as boolean)
                                                }
                                            />
                                            <Label
                                                htmlFor={`periph-${periph.id}`}
                                                className="text-sm"
                                            >
                                                {periph.label}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </form>

                    {/* ---------- FOOTER ---------- */}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSaving || isUploading}
                            onClick={onClose}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>

                        <Button
                            disabled={
                                isSaving ||
                                isUploading ||
                                !formData.modelName.trim() ||
                                formData.vehicleTypeId == null ||
                                formData.manufacturerId == null ||
                                formData.vehicles.length === 0
                            }
                            onClick={handleSubmit}
                        >
                            {isUploading || isSaving ? 'Saving…' : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {isCreating ? 'Create model' : 'Save changes'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>)}
        </Dialog>
    );
};
