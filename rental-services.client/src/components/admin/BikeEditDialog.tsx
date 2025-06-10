// React hooks for state management and DOM references
import { useState, useEffect, useRef } from 'react'
// Lucide icons for UI elements
import { Save, X, Upload, Trash2 } from 'lucide-react'
// UI components for dialog structure
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../ui/dialog'
// Form input components
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
// Dropdown select components
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
// Action and control components
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Checkbox } from '../ui/checkbox'
// Type definition for Bike entity
import { type Bike } from './BikesTab'

// Props interface defining what data the dialog component expects
interface BikeEditDialogProps {
    isOpen: boolean                           // Controls dialog visibility
    onClose: () => void                       // Function to close dialog
    bike: Bike | null                         // Bike data for editing (null for new bike)
    isCreating: boolean                       // Flag to differentiate create vs edit mode
    onSave: (bikeData: Partial<Bike>[]) => void  // Callback with bike data array
    isSaving: boolean                         // Loading state for save operation
}

// Static list of available locations where bikes can be placed
// TODO: Consider making this dynamic by fetching from API
const AVAILABLE_LOCATIONS = [
    'Downtown',
    'Airport',
    'Beach',
    'Mall',
    'University',
    'Train Station',
    'Business District',
    'Residential Area'
]

export default function BikeEditDialog({
    isOpen,
    onClose,
    bike,
    isCreating,
    onSave,
    isSaving
}: BikeEditDialogProps) {

    // === STATE MANAGEMENT ===

    // Main form data state containing all bike properties
    const [formData, setFormData] = useState({
        name: '',                             // Bike model name (e.g., Honda CBR600RR)
        type: '',                             // Bike category (Sport, Scooter, etc.)
        pricePerDay: 0,                       // Daily rental price
        imageUrl: '',                         // URL of uploaded image
        isAvailable: true,                    // Rental availability status
        description: '',                      // Detailed bike description
        engineSize: '',                       // Engine displacement (e.g., 150cc)
        fuelType: '',                         // Gasoline, Electric, Hybrid
        transmission: '',                     // Manual, Automatic, CVT
        year: new Date().getFullYear(),       // Manufacturing year
        quantity: 1                           // Number of bikes
    })

    // Location management states (for multi-location bike creation)
    const [selectedLocations, setSelectedLocations] = useState<string[]>([])           // Array of selected location names
    const [locationQuantities, setLocationQuantities] = useState<{ [key: string]: number }>({})  // Quantity per location mapping

    // Image upload states
    const [selectedFile, setSelectedFile] = useState<File | null>(null)               // Selected file object
    const [imagePreview, setImagePreview] = useState<string>('')                      // Base64 preview URL
    const [isUploading, setIsUploading] = useState(false)                            // Upload progress state
    const fileInputRef = useRef<HTMLInputElement>(null)                              // Reference to hidden file input

    // === EFFECTS ===

    // Effect to populate form when editing existing bike or reset when creating new
    useEffect(() => {
        if (bike) {
            // EDIT MODE: Populate form with existing bike data
            setFormData({
                name: bike.name || '',
                type: bike.type || '',
                pricePerDay: bike.pricePerDay || 0,
                imageUrl: bike.imageUrl || '',
                isAvailable: bike.isAvailable ?? true,
                description: bike.description || '',
                engineSize: bike.engineSize || '',
                fuelType: bike.fuelType || '',
                transmission: bike.transmission || '',
                year: bike.year || new Date().getFullYear(),
                quantity: bike.quantity || 1
            })

            // Set existing image for preview
            setImagePreview(bike.imageUrl || '')
            setSelectedFile(null)

            // For editing, only select the bike's current location
            if (bike.location) {
                setSelectedLocations([bike.location])
                setLocationQuantities({ [bike.location]: bike.quantity || 1 })
            }
        } else if (isCreating) {
            // CREATE MODE: Reset all form fields to defaults
            setFormData({
                name: '',
                type: '',
                pricePerDay: 0,
                imageUrl: '',
                isAvailable: true,
                description: '',
                engineSize: '',
                fuelType: '',
                transmission: '',
                year: new Date().getFullYear(),
                quantity: 1
            })
            setSelectedLocations([])
            setLocationQuantities({})
            setSelectedFile(null)
            setImagePreview('')
        }
    }, [bike, isCreating])

    // === EVENT HANDLERS ===

    // Handle text and number input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }))
    }

    // Handle dropdown select changes
    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // Handle availability toggle switch
    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            isAvailable: checked
        }))
    }

    // Handle location checkbox selection (for create mode)
    const handleLocationChange = (location: string, checked: boolean) => {
        if (checked) {
            // Add location to selected list and initialize quantity
            setSelectedLocations(prev => [...prev, location])
            setLocationQuantities(prev => ({
                ...prev,
                [location]: formData.quantity || 1
            }))
        } else {
            // Remove location from selected list and delete quantity
            setSelectedLocations(prev => prev.filter(loc => loc !== location))
            setLocationQuantities(prev => {
                const newQuantities = { ...prev }
                delete newQuantities[location]
                return newQuantities
            })
        }
    }

    // Handle quantity changes for specific locations
    const handleLocationQuantityChange = (location: string, quantity: number) => {
        setLocationQuantities(prev => ({
            ...prev,
            [location]: Math.max(1, quantity)  // Ensure minimum quantity of 1
        }))
    }

    // === IMAGE HANDLING ===

    // Handle file selection from file input
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type - only images allowed
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.')
                return
            }

            // Validate file size - maximum 5MB
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB.')
                return
            }

            setSelectedFile(file)

            // Generate preview using FileReader API
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Remove selected image and reset preview
    const handleRemoveImage = () => {
        setSelectedFile(null)
        setImagePreview('')
        setFormData(prev => ({ ...prev, imageUrl: '' }))
        // Clear file input value
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Upload image file to server and return URL
    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData()
        formData.append('image', file)

        try {
            const response = await fetch('/api/admin/upload-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`  // Auth token from localStorage
                },
                body: formData
            })

            if (!response.ok) {
                throw new Error('Failed to upload image')
            }

            const data = await response.json()
            return data.imageUrl  // Server returns the stored image URL
        } catch (error) {
            console.error('Error uploading image:', error)
            throw error
        }
    }

    // === FORM SUBMISSION ===

    // Handle form submission with image upload
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUploading(true)

        try {
            let imageUrl = formData.imageUrl

            // Upload new image if file was selected
            if (selectedFile) {
                imageUrl = await uploadImage(selectedFile)
            }

            const updatedFormData = { ...formData, imageUrl }

            if (isCreating) {
                // CREATE MODE: Generate bike entries for each selected location
                const bikesToCreate = selectedLocations.map(location => ({
                    ...updatedFormData,
                    location,
                    quantity: locationQuantities[location] || 1
                }))
                onSave(bikesToCreate)
            } else {
                // EDIT MODE: Update single bike with new data
                const updatedBike = {
                    ...updatedFormData,
                    location: selectedLocations[0] || '',
                    quantity: locationQuantities[selectedLocations[0]] || formData.quantity
                }
                onSave([updatedBike])
            }
        } catch (error) {
            console.error('Error saving bike:', error)
            alert('Failed to save bike. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    // === RENDER COMPONENT ===

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                {/* Dialog Header */}
                <DialogHeader>
                    <DialogTitle>
                        {isCreating ? 'Add New Bike' : `Edit ${bike?.name}`}
                    </DialogTitle>
                    <DialogDescription>
                        {isCreating
                            ? 'Fill in the details and select locations to add bikes to the inventory.'
                            : 'Update the bike information and settings.'
                        }
                    </DialogDescription>
                </DialogHeader>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Row 1: Bike Name and Type */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Bike Name Input */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Bike Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Honda CBR600RR"
                                required
                            />
                        </div>

                        {/* Bike Type Dropdown */}
                        <div className="space-y-2">
                            <Label htmlFor="type">Bike Type *</Label>
                            <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select bike type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Scooter">Scooter</SelectItem>
                                    <SelectItem value="Sport">Sport</SelectItem>
                                    <SelectItem value="Cruiser">Cruiser</SelectItem>
                                    <SelectItem value="Touring">Touring</SelectItem>
                                    <SelectItem value="Off-road">Off-road</SelectItem>
                                    <SelectItem value="Electric">Electric</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2: Price per Day */}
                    <div className="space-y-2">
                        <Label htmlFor="pricePerDay">Price per Day ($) *</Label>
                        <Input
                            id="pricePerDay"
                            name="pricePerDay"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.pricePerDay}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    {/* Row 3: Technical Specifications */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Engine Size */}
                        <div className="space-y-2">
                            <Label htmlFor="engineSize">Engine Size</Label>
                            <Input
                                id="engineSize"
                                name="engineSize"
                                value={formData.engineSize}
                                onChange={handleInputChange}
                                placeholder="e.g., 150cc"
                            />
                        </div>

                        {/* Fuel Type */}
                        <div className="space-y-2">
                            <Label htmlFor="fuelType">Fuel Type</Label>
                            <Select value={formData.fuelType} onValueChange={(value) => handleSelectChange('fuelType', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select fuel type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                                    <SelectItem value="Electric">Electric</SelectItem>
                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Manufacturing Year */}
                        <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Input
                                id="year"
                                name="year"
                                type="number"
                                min="1990"
                                max={new Date().getFullYear() + 1}
                                value={formData.year}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Row 4: Transmission */}
                    <div className="space-y-2">
                        <Label htmlFor="transmission">Transmission</Label>
                        <Select value={formData.transmission} onValueChange={(value) => handleSelectChange('transmission', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select transmission" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Manual">Manual</SelectItem>
                                <SelectItem value="Automatic">Automatic</SelectItem>
                                <SelectItem value="CVT">CVT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location Selection Section */}
                    <div className="space-y-2">
                        <Label>
                            {isCreating ? 'Select Locations *' : 'Location *'}
                        </Label>
                        <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                            {isCreating ? (
                                /* CREATE MODE: Multiple location checkboxes with quantity inputs */
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Select one or more locations where this bike will be available:
                                    </p>
                                    {AVAILABLE_LOCATIONS.map((location) => (
                                        <div key={location} className="flex items-center justify-between">
                                            {/* Location Checkbox */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`location-${location}`}
                                                    checked={selectedLocations.includes(location)}
                                                    onCheckedChange={(checked) =>
                                                        handleLocationChange(location, checked as boolean)
                                                    }
                                                />
                                                <Label htmlFor={`location-${location}`} className="text-sm">
                                                    {location}
                                                </Label>
                                            </div>
                                            {/* Quantity Input (appears when location is selected) */}
                                            {selectedLocations.includes(location) && (
                                                <div className="flex items-center space-x-2">
                                                    <Label className="text-xs text-muted-foreground">Qty:</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={locationQuantities[location] || 1}
                                                        onChange={(e) =>
                                                            handleLocationQuantityChange(location, parseInt(e.target.value) || 1)
                                                        }
                                                        className="w-16 h-8 text-sm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {/* Validation Message */}
                                    {selectedLocations.length === 0 && (
                                        <p className="text-sm text-red-600">Please select at least one location.</p>
                                    )}
                                </div>
                            ) : (
                                /* EDIT MODE: Single location dropdown */
                                <Select
                                    value={selectedLocations[0] || ''}
                                    onValueChange={(value) => {
                                        setSelectedLocations([value])
                                        setLocationQuantities({ [value]: formData.quantity })
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AVAILABLE_LOCATIONS.map((location) => (
                                            <SelectItem key={location} value={location}>
                                                {location}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>

                    {/* Quantity Input (Edit Mode Only) */}
                    {!isCreating && (
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity *</Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                placeholder="1"
                                required
                            />
                        </div>
                    )}

                    {/* Image Upload Section */}
                    <div className="space-y-2">
                        <Label>Bike Image</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            {imagePreview ? (
                                /* Image Preview State */
                                <div className="space-y-3">
                                    <div className="relative inline-block">
                                        {/* Image Preview */}
                                        <img
                                            src={imagePreview}
                                            alt="Bike preview"
                                            className="w-32 h-32 object-cover rounded border"
                                        />
                                        {/* Remove Image Button */}
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                            onClick={handleRemoveImage}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    {/* Change Image Button */}
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Change Image
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* No Image State - Upload Prompt */
                                <div className="text-center py-6">
                                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-600 mb-2">
                                        Click to upload bike image
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        PNG, JPG, GIF up to 5MB
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-3"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Select Image
                                    </Button>
                                </div>
                            )}
                            {/* Hidden File Input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Description Textarea */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter bike description..."
                            rows={3}
                        />
                    </div>

                    {/* Availability Toggle */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isAvailable"
                            checked={formData.isAvailable}
                            onCheckedChange={handleSwitchChange}
                        />
                        <Label htmlFor="isAvailable">Available for rental</Label>
                    </div>

                    {/* Creation Summary (Create Mode Only) */}
                    {isCreating && selectedLocations.length > 0 && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="font-medium text-sm mb-2">Summary:</p>
                            <p className="text-sm text-muted-foreground">
                                Creating <strong>{formData.name}</strong> ({formData.type}) at:
                            </p>
                            {/* Location List */}
                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                {selectedLocations.map(location => (
                                    <li key={location}>
                                        • {location}: {locationQuantities[location]} bike{locationQuantities[location] !== 1 ? 's' : ''}
                                    </li>
                                ))}
                            </ul>
                            {/* Total Count */}
                            <p className="text-sm font-medium mt-2">
                                Total: {Object.values(locationQuantities).reduce((sum, qty) => sum + qty, 0)} bikes
                            </p>
                        </div>
                    )}
                </form>

                {/* Dialog Footer with Action Buttons */}
                <DialogFooter>
                    {/* Cancel Button */}
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSaving || isUploading}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    {/* Save/Create Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={isSaving || isUploading || (isCreating && selectedLocations.length === 0) || !formData.name.trim()}
                    >
                        {isSaving || isUploading ? (
                            /* Loading State */
                            <>
                                {isUploading ? 'Uploading...' : 'Saving...'}
                            </>
                        ) : (
                            /* Normal State */
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {isCreating ?
                                    `Create ${selectedLocations.length} Bike${selectedLocations.length !== 1 ? 's' : ''}` :
                                    'Save Changes'
                                }
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}