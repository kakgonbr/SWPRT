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
  User,
  Calendar,
  CreditCard,
  MapPin,
  Edit3,
  Save,
  X,
  AlertCircle,
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
  isProcessing?: boolean;
}

// Validation function
const validateRequiredFields = (data: ExtractedIdData): { isValid: boolean; errors: string[]; fieldErrors: Record<string, string> } => {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};
  
  // Required fields validation
  if (!data.fullName || data.fullName.trim().length < 2) {
    const errorMsg = "Full name must be at least 2 characters";
    errors.push(errorMsg);
    fieldErrors.fullName = errorMsg;
  }
  
  if (!data.dateOfBirth || data.dateOfBirth.trim() === "") {
    const errorMsg = "Date of birth is required";
    errors.push(errorMsg);
    fieldErrors.dateOfBirth = errorMsg;
  }
  
  if (!data.idNumber || data.idNumber.trim() === "") {
    const errorMsg = "License number is required";
    errors.push(errorMsg);
    fieldErrors.idNumber = errorMsg;
  } else if (!/^\d{12}$/.test(data.idNumber.trim())) {
    const errorMsg = "License number must be exactly 12 digits";
    errors.push(errorMsg);
    fieldErrors.idNumber = errorMsg;
  }
  
  if (!data.licenseClass || data.licenseClass.trim() === "") {
    const errorMsg = "License class is required";
    errors.push(errorMsg);
    fieldErrors.licenseClass = errorMsg;
  } else if (!/^[A-F][0-9]?$/.test(data.licenseClass.trim().toUpperCase())) {
    const errorMsg = "License class must be in format: A, A1, A2, B1, B2, C, D, E, F";
    errors.push(errorMsg);
    fieldErrors.licenseClass = errorMsg;
  }
  
  if (!data.dateOfIssue || data.dateOfIssue.trim() === "") {
    const errorMsg = "Date of issue is required";
    errors.push(errorMsg);
    fieldErrors.dateOfIssue = errorMsg;
  }
  
  if (!data.address || data.address.trim().length < 5) {
    const errorMsg = "Address must be at least 5 characters";
    errors.push(errorMsg);
    fieldErrors.address = errorMsg;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  };
};

export default function IdReviewDialog({
  isOpen,
  onClose,
  onConfirm,
  onReject,
  extractedData,
  isProcessing = false,
}: IdReviewDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ExtractedIdData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Initialize edited data when extractedData changes
  useEffect(() => {
    if (extractedData) {
      setEditedData({ ...extractedData });
      // Validate initial data
      const validation = validateRequiredFields(extractedData);
      setValidationErrors(validation.errors);
      setFieldErrors(validation.fieldErrors);
    }
    setIsEditing(false); // Reset editing state when new data is loaded
  }, [extractedData]);

  // Debug logs
  useEffect(() => {
    console.log("IdReviewDialog props:");
    console.log("isOpen:", isOpen);
    console.log("extractedData:", extractedData);
  }, [isOpen, extractedData]);

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
      const updatedData = { ...editedData, [field]: value };
      setEditedData(updatedData);
      
      // Re-validate after each change
      const validation = validateRequiredFields(updatedData);
      setValidationErrors(validation.errors);
      setFieldErrors(validation.fieldErrors);
    }
  };

  const handleSaveEdit = () => {
    if (editedData) {
      const validation = validateRequiredFields(editedData);
      if (validation.isValid) {
        setIsEditing(false);
        setValidationErrors([]);
        setFieldErrors({});
      } else {
        setValidationErrors(validation.errors);
        setFieldErrors(validation.fieldErrors);
      }
    }
  };

  const handleCancelEdit = () => {
    if (extractedData) {
      setEditedData({ ...extractedData });
      const validation = validateRequiredFields(extractedData);
      setValidationErrors(validation.errors);
      setFieldErrors(validation.fieldErrors);
    }
    setIsEditing(false);
  };

  const handleConfirm = () => {
    if (editedData) {
      const validation = validateRequiredFields(editedData);
      if (validation.isValid) {
        onConfirm(editedData);
      } else {
        setValidationErrors(validation.errors);
        setFieldErrors(validation.fieldErrors);
      }
    }
  };

  const displayData = editedData || extractedData;
  const isDataValid = validationErrors.length === 0;

  // Calculate completion progress
  const calculateProgress = () => {
    if (!displayData) return 0;
    
    const requiredFields = [
      displayData.fullName,
      displayData.dateOfBirth,
      displayData.idNumber,
      displayData.licenseClass,
      displayData.dateOfIssue,
      displayData.address
    ];
    
    const validFields = requiredFields.filter(field => {
      if (!field || field.trim() === "") return false;
      
      // Special validation for specific fields
      if (field === displayData.idNumber && !/^\d{12}$/.test(field.trim())) return false;
      if (field === displayData.licenseClass && !/^[A-F][0-9]?$/.test(field.trim().toUpperCase())) return false;
      if (field === displayData.address && field.trim().length < 5) return false;
      if (field === displayData.fullName && field.trim().length < 2) return false;
      
      return true;
    });
    
    return Math.round((validFields.length / requiredFields.length) * 100);
  };

  const progress = calculateProgress();

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

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Information Completion
              </span>
              <span className="text-sm text-gray-500">
                {progress}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  progress === 100 ? 'bg-green-500' : 
                  progress >= 80 ? 'bg-yellow-500' : 
                  progress >= 50 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {progress < 100 && (
              <p className="text-xs text-gray-500">
                {6 - Math.round((progress / 100) * 6)} required fields remaining
              </p>
            )}
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800 mb-2">
                      Please fix the following errors before confirming:
                    </p>
                    <ul className="text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add fallback content if extractedData is null */}
          {!displayData ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                Loading extracted information...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cột trái: Card hướng dẫn */}
              <div className="space-y-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-1">
                          Please verify your information carefully
                        </p>
                        <p className="text-blue-700">
                          Once confirmed, this information will be saved to your profile.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Edit3 className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 mb-1">
                          Found incorrect information?
                        </p>
                        <p className="text-amber-700">
                          Click \"Edit Information\" to correct any details that don't match your ID document.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Cột phải: Extracted Information */}
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
                            Full Name <span className="text-red-500">*</span>
                          </Label>
                        </div>
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input
                              value={displayData.fullName || ""}
                              onChange={(e) =>
                                handleInputChange("fullName", e.target.value)
                              }
                              className={`text-lg font-semibold ${
                                fieldErrors.fullName
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                                  : ""
                              }`}
                              placeholder="e.g. Nguyen Van A"
                            />
                            {fieldErrors.fullName && (
                              <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {fieldErrors.fullName}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className={`text-lg font-semibold p-3 rounded border min-h-[44px] ${
                              fieldErrors.fullName
                                ? "bg-red-50 border-red-200" 
                                : "bg-gray-50"
                            }`}>
                              {displayData.fullName || (
                                <span className="text-red-500 italic">
                                  No information available
                                </span>
                              )}
                            </p>
                            {fieldErrors.fullName && (
                              <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {fieldErrors.fullName}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ID Number */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">
                            ID Number <span className="text-red-500">*</span>
                          </Label>
                        </div>
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input
                              value={displayData.idNumber || ""}
                              onChange={(e) =>
                                handleInputChange("idNumber", e.target.value)
                              }
                              className={`text-lg font-semibold font-mono ${
                                fieldErrors.idNumber
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                                  : ""
                              }`}
                              placeholder="e.g. 012345678912"
                              disabled
                            />
                            {fieldErrors.idNumber && (
                              <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {fieldErrors.idNumber}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className={`text-lg font-semibold p-3 rounded border font-mono min-h-[44px] ${
                              fieldErrors.idNumber
                                ? "bg-red-50 border-red-200" 
                                : "bg-gray-50"
                            }`}>
                              {displayData.idNumber || (
                                <span className="text-red-500 italic">
                                  No information available
                                </span>
                              )}
                            </p>
                            {fieldErrors.idNumber && (
                              <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {fieldErrors.idNumber}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* License Class */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">
                            License Class <span className="text-red-500">*</span>
                          </Label>
                        </div>
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input
                              value={displayData.licenseClass || ""}
                              onChange={(e) =>
                                handleInputChange("licenseClass", e.target.value)
                              }
                              className={`text-lg font-semibold ${
                                fieldErrors.licenseClass
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                                  : ""
                              }`}
                              placeholder="e.g. B1"
                              disabled
                            />
                            {fieldErrors.licenseClass && (
                              <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {fieldErrors.licenseClass}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className={`text-lg font-semibold p-3 rounded border min-h-[44px] ${
                              fieldErrors.licenseClass
                                ? "bg-red-50 border-red-200" 
                                : "bg-gray-50"
                            }`}>
                              {displayData.licenseClass || (
                                <span className="text-red-500 italic">
                                  No information available
                                </span>
                              )}
                            </p>
                            {fieldErrors.licenseClass && (
                              <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {fieldErrors.licenseClass}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">
                            Date of Birth <span className="text-red-500">*</span>
                          </Label>
                        </div>
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input
                              type="date"
                              value={formatDateForInput(
                                displayData.dateOfBirth || ""
                              )}
                              onChange={(e) =>
                                handleInputChange("dateOfBirth", e.target.value)
                              }
                              className={`text-lg font-semibold ${
                                fieldErrors.dateOfBirth
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                                  : ""
                              }`}
                            />
                            {fieldErrors.dateOfBirth && (
                              <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {fieldErrors.dateOfBirth}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className={`text-lg font-semibold p-3 rounded border min-h-[44px] ${
                              fieldErrors.dateOfBirth
                                ? "bg-red-50 border-red-200" 
                                : "bg-gray-50"
                            }`}>
                              {formatDate(displayData.dateOfBirth || "")}
                            </p>
                            {fieldErrors.dateOfBirth && (
                              <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {fieldErrors.dateOfBirth}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Date of Issue */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">
                            Date of Issue <span className="text-red-500">*</span>
                          </Label>
                        </div>
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input
                              type="date"
                              value={formatDateForInput(
                                displayData.dateOfIssue || ""
                              )}
                              onChange={(e) =>
                                handleInputChange("dateOfIssue", e.target.value)
                              }
                              className={`text-lg font-semibold ${
                                fieldErrors.dateOfIssue
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                                  : ""
                              }`}
                            />
                            {fieldErrors.dateOfIssue && (
                              <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {fieldErrors.dateOfIssue}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className={`text-lg font-semibold p-3 rounded border min-h-[44px] ${
                              fieldErrors.dateOfIssue
                                ? "bg-red-50 border-red-200" 
                                : "bg-gray-50"
                            }`}>
                              {formatDate(displayData.dateOfIssue || "")}
                            </p>
                            {fieldErrors.dateOfIssue && (
                              <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {fieldErrors.dateOfIssue}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">
                            Address <span className="text-red-500">*</span>
                          </Label>
                        </div>
                        {isEditing ? (
                          <div className="space-y-1">
                            <Textarea
                              value={displayData.address || ""}
                              onChange={(e) =>
                                handleInputChange("address", e.target.value)
                              }
                              className={`text-lg font-semibold resize-none ${
                                fieldErrors.address
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                                  : ""
                              }`}
                              rows={3}
                              placeholder="e.g. 123 Nguyen Hue, District 1, Ho Chi Minh City"
                            />
                            {fieldErrors.address && (
                              <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {fieldErrors.address}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className={`text-lg font-semibold p-3 rounded border min-h-[78px] ${
                              fieldErrors.address
                                ? "bg-red-50 border-red-200" 
                                : "bg-gray-50"
                            }`}>
                              {displayData.address || (
                                <span className="text-red-500 italic">
                                  No information available
                                </span>
                              )}
                            </p>
                            {fieldErrors.address && (
                              <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {fieldErrors.address}
                              </p>
                            )}
                          </div>
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
            <div className="relative">
              <Button
                onClick={handleConfirm}
                disabled={isProcessing || !displayData || isEditing || !isDataValid}
                className={`${
                  isDataValid && !isProcessing && !isEditing
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                title={
                  !isDataValid 
                    ? "Please complete all required fields before confirming"
                    : isProcessing 
                    ? "Processing..." 
                    : isEditing 
                    ? "Please save your changes first"
                    : "Confirm and save information"
                }
              >
                {isProcessing ? "Saving..." : "Confirm & Save Information"}
              </Button>
              {!isDataValid && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Complete all fields
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
                </div>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
