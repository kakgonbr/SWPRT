import { AlertTriangle, Trash2, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { type Bike } from './BikesTab'

interface BikeDeleteDialogProps {
    isOpen: boolean
    onClose: () => void
    bike: Bike | null
    onConfirm: () => void
    isDeleting: boolean
}

export default function BikeDeleteDialog({
    isOpen,
    onClose,
    bike,
    onConfirm,
    isDeleting
}: BikeDeleteDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Bike
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Are you sure you want to delete <strong>{bike?.name}</strong>?
                        This action cannot be undone and will permanently remove the bike from the system.
                    </DialogDescription>
                </DialogHeader>

                {bike && (
                    <div className="flex items-center space-x-4 py-4 bg-muted/50 rounded-lg px-4">
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
                            <p className="text-sm">${bike.pricePerDay}/day</p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>Deleting...</>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Bike
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}