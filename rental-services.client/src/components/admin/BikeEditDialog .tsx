import { useState, useEffect } from 'react'
import { Save, X, Upload } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { type Bike } from './BikesTab'

interface BikeEditDialogProps {
    isOpen: boolean
    onClose: () => void
    bike: Bike | null
    isCreating: boolean
    onSave: (bikeData: Partial<Bike>) => void
    isSaving: boolean
}

export default function BikeEditDialog({
    isOpen,
    onClose,
    bike,
    isCreating,
    onSave,
    isSaving
}: BikeEditDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        pricePerDay: 0,
        imageUrl: '',
        isAvailable: true,
        description: '',
        location: '',
        engineSize: '',
        fuelType: '',
        transmission: '',
        year: new Date().getFullYear()
    })

    useEffect(() => {
        if (bike) {
            setFormData({
                name: bike.name || '',
                type: bike.type || '',
                pricePerDay: bike.pricePerDay || 0,
                imageUrl: bike.imageUrl || '',
                isAvailable: bike.isAvailable ?? true,
                description: bike.description || '',
                location: bike.location || '',
                engineSize: bike.engineSize || '',
                fuelType: bike.fuelType || '',
                transmission: bike.transmission || '',
                year: bike.year || new Date().getFullYear()
            })
        } else if (isCreating) {
            setFormData({
                name: '',
                type: '',
                pricePerDay: 0,
                imageUrl: '',
                isAvailable: true,
                description: '',
                location: '',
                engineSize: '',
                fuelType: '',
                transmission: '',
                year: new Date().getFullYear()
            })
        }
    }, [bike, isCreating])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            isAvailable: checked
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isCreating ? 'Add New Bike' : `Edit ${bike?.name}`}
                    </DialogTitle>
                    <DialogDescription>
                        {isCreating
                            ? 'Fill in the details to add a new bike to the inventory.'
                            : 'Update the bike information and settings.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Bike Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter bike name"
                                required
                            />
                        </div>

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

                    <div className="grid grid-cols-2 gap-4">
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

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="Enter location"
                            />
                        </div>
                    </div>

                    {/* Technical Specifications */}
                    <div className="grid grid-cols-3 gap-4">
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

                    {/* Image URL */}
                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input
                            id="imageUrl"
                            name="imageUrl"
                            type="url"
                            value={formData.imageUrl}
                            onChange={handleInputChange}
                            placeholder="https://example.com/bike-image.jpg"
                        />
                        {formData.imageUrl && (
                            <div className="mt-2">
                                <img
                                    src={formData.imageUrl}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded border"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Description */}
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

                    {/* Availability */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isAvailable"
                            checked={formData.isAvailable}
                            onCheckedChange={handleSwitchChange}
                        />
                        <Label htmlFor="isAvailable">Available for rental</Label>
                    </div>
                </form>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>Saving...</>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {isCreating ? 'Create Bike' : 'Save Changes'}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}