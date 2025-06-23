import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  CreditCard,
  MapPin,
  Eye,
  Edit3,
  Save,
  X,
} from "lucide-react";

interface ExtractedIdData {
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  address: string;
  documentType: string;
  licenseClass?: string;
  dateOfIssue?: string;
  imageUrl?: string;
  expiryDate?: string;
  placeOfBirth?: string;
  nationality?: string;
}

interface IdReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (editedData: ExtractedIdData) => void;
  onReject: () => void;
  extractedData: ExtractedIdData | null;
  uploadedImageUrl: string | null;
  isProcessing?: boolean;
}

export default function IdReviewDialog({
  isOpen,
  onClose,
  onConfirm,
  onReject,
  extractedData,
  uploadedImageUrl,
  isProcessing = false,
}: IdReviewDialogProps) {
  const [showFullImage, setShowFullImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ExtractedIdData | null>(null);

  // Initialize edited data when extractedData changes
  useEffect(() => {
    if (extractedData) {
      setEditedData({ ...extractedData });
    }
    setIsEditing(false); // Reset editing state when new data is loaded
  }, [extractedData]);

  // Debug logs
  useEffect(() => {
    console.log("IdReviewDialog props:");
    console.log("isOpen:", isOpen);
    console.log("extractedData:", extractedData);
    console.log("uploadedImageUrl:", uploadedImageUrl);
  }, [isOpen, extractedData, uploadedImageUrl]);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString)
        return <span className="text-red-500 italic">No information available</span>;
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return dateString;
    }
  };

  const handleInputChange = (field: keyof ExtractedIdData, value: string) => {
    if (editedData) {
      setEditedData((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (extractedData) {
      setEditedData({ ...extractedData });
    }
    setIsEditing(false);
  };

  const handleConfirm = () => {
    if (editedData) {
      onConfirm(editedData);
    }
  };

  const displayData = editedData || extractedData;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Review Extracted ID Information
            </DialogTitle>
            <DialogDescription>
              Please review the information extracted from your ID document. You
              can edit any incorrect details before confirming.
            </DialogDescription>
          </DialogHeader>

          {/* Add fallback content if extractedData is null */}
          {!displayData ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                Loading extracted information...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ID Document Image */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    Uploaded Document
                  </Label>
                  <div className="mt-2">
                    {uploadedImageUrl ? (
                      <div className="relative">
                        <img
                          src={uploadedImageUrl}
                          alt="Uploaded ID Document"
                          className="w-full max-w-md rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setShowFullImage(true)}
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2"
                          onClick={() => setShowFullImage(true)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Full Size
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full max-w-md h-48 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <p className="text-muted-foreground">
                          No image available
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-1">
                          Please verify your information carefully
                        </p>
                        <p className="text-blue-700">
                          Once confirmed, this information will be saved to your
                          profile.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Edit Instructions */}
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Edit3 className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 mb-1">
                          Found incorrect information?
                        </p>
                        <p className="text-amber-700">
                          Click "Edit Information" to correct any details that
                          don't match your ID document.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Extracted Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">
                    Extracted Information
                  </Label>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit Information
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-2 space-y-4">
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      {/* Document Type */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          Document Type
                        </span>
                        <Badge variant="outline">
                          {displayData.documentType || "Driver License"}
                        </Badge>
                      </div>

                      {/* Full Name */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">
                            Full Name
                          </Label>
                        </div>
                        {isEditing ? (
                          <Input
                            value={displayData.fullName || ""}
                            onChange={(e) =>
                              handleInputChange("fullName", e.target.value)
                            }
                            className="text-lg font-semibold"
                            placeholder="e.g. Nguyen Van A"
                          />
                        ) : (
                          <p className="text-lg font-semibold bg-gray-50 p-3 rounded border min-h-[44px]">
                            {displayData.fullName || (
                              <span className="text-red-500 italic">
                                No information available
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* ID Number */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">
                            ID Number
                          </Label>
                        </div>
                        {isEditing ? (
                          <Input
                            value={displayData.idNumber || ""}
                            onChange={(e) =>
                              handleInputChange("idNumber", e.target.value)
                            }
                            className="text-lg font-semibold font-mono"
                            placeholder="e.g. 012345678912"
                          />
                        ) : (
                          <p className="text-lg font-semibold bg-gray-50 p-3 rounded border font-mono min-h-[44px]">
                            {displayData.idNumber || (
                              <span className="text-red-500 italic">
                                No information available
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* License Class */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">
                            License Class
                          </Label>
                        </div>
                        {isEditing ? (
                          <Input
                            value={displayData.licenseClass || ""}
                            onChange={(e) =>
                              handleInputChange("licenseClass", e.target.value)
                            }
                            className="text-lg font-semibold"
                            placeholder="e.g. B1"
                          />
                        ) : (
                          <p className="text-lg font-semibold bg-gray-50 p-3 rounded border min-h-[44px]">
                            {displayData.licenseClass || (
                              <span className="text-red-500 italic">
                                No information available
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">
                            Date of Birth
                          </Label>
                        </div>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={formatDateForInput(
                              displayData.dateOfBirth || ""
                            )}
                            onChange={(e) =>
                              handleInputChange("dateOfBirth", e.target.value)
                            }
                            className="text-lg font-semibold"
                          />
                        ) : (
                          <p className="text-lg font-semibold bg-gray-50 p-3 rounded border min-h-[44px]">
                            {formatDate(displayData.dateOfBirth || "")}
                          </p>
                        )}
                      </div>

                      {/* Date of Issue */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">
                            Date of Issue
                          </Label>
                        </div>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={formatDateForInput(
                              displayData.dateOfIssue || ""
                            )}
                            onChange={(e) =>
                              handleInputChange("dateOfIssue", e.target.value)
                            }
                            className="text-lg font-semibold"
                          />
                        ) : (
                          <p className="text-lg font-semibold bg-gray-50 p-3 rounded border min-h-[44px]">
                            {formatDate(displayData.dateOfIssue || "")}
                          </p>
                        )}
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Address</Label>
                        </div>
                        {isEditing ? (
                          <Textarea
                            value={displayData.address || ""}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            className="text-lg font-semibold resize-none"
                            rows={3}
                            placeholder="e.g. 123 Nguyen Hue, District 1, Ho Chi Minh City"
                          />
                        ) : (
                          <p className="text-lg font-semibold bg-gray-50 p-3 rounded border min-h-[78px]">
                            {displayData.address || (
                              <span className="text-red-500 italic">
                                No information available
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={onReject}
              disabled={isProcessing || isEditing}
            >
              Cancel & Re-upload
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isProcessing || !displayData || isEditing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Saving..." : "Confirm & Save Information"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Size Image Modal */}
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>ID Document - Full Size</DialogTitle>
          </DialogHeader>
          {uploadedImageUrl && (
            <div className="flex justify-center">
              <img
                src={uploadedImageUrl}
                alt="ID Document Full Size"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
