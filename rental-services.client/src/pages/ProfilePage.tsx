// src/pages/ProfilePage.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  Camera,
  Save,
  Edit,
  Key,
  Upload,
  FileImage,
  CheckCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../contexts/auth-context";
import { useToast } from "../contexts/toast-context";
import { format } from "date-fns";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import IdReviewDialog from "../components/IdReviewDialog";

const API = import.meta.env.VITE_API_BASE_URL;

// Define the extracted ID data interface
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

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isIdReviewOpen, setIsIdReviewOpen] = useState(false);
  const [isSavingIdData, setIsSavingIdData] = useState(false);
  const [extractedIdData, setExtractedIdData] =
    useState<ExtractedIdData | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    address: "",
    licenseId: "",
  });

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      navigate("/auth/login");
      return;
    }

    console.log("User data loaded on Profile Page:", user);

    // Populate form with user data
    setFormData({
      name: user.fullName,
      email: user.email,
      dateOfBirth: String(user.dateOfBirth) || "",
      address: user.address || "",
      licenseId: user.driverLicenses?.at(0)?.licenseId || "",
    });
  }, [user, isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (user?.driverLicenses?.at(0)?.imageLicenseUrl) {
      setUploadedImageUrl(user.driverLicenses.at(0)!.imageLicenseUrl!);
    }
  }, [user]);

  useEffect(() => {
    console.log("State changes:");
    console.log("isIdReviewOpen:", isIdReviewOpen);
    console.log("extractedIdData:", extractedIdData);
    console.log("uploadedImageUrl:", uploadedImageUrl);
  }, [isIdReviewOpen, extractedIdData, uploadedImageUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only prevent editing of ID number if ID document is verified
    if (e.target.name === "licenseId") {
      toast({
        title: "Field Locked",
        description:
          "ID Number cannot be edited because it has been verified from your ID document.",
        variant: "destructive",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = () => {
    // In real app, this would update user via API
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (!user) return;

    // Reset form data
    setFormData({
      name: user.fullName,
      email: user.email,
      dateOfBirth: String(user.dateOfBirth) || "",
      address: user.address || "",
      licenseId: user.driverLicenses?.at(0)?.licenseId || "",
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "staff":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, GIF).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingId(true);

    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload your ID document.",
        variant: "destructive",
      });
      setIsUploadingId(false);
      return;
    }

    try {
      const response = await fetch(
        `${API}/api/ocr/upload-license`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Server responded with ${response.status}`
        );
      }

      const result = await response.json();
      const serverExtractedData = result.extractedData;
      const imageUrl = result.imageUrl;

      // Map dữ liệu từ backend sang frontend format
      const mappedData: ExtractedIdData = {
        fullName: serverExtractedData.fullName || "",
        dateOfBirth: serverExtractedData.dateOfBirth || "",
        idNumber: serverExtractedData.licenseNumber || "",
        address: serverExtractedData.address || "",
        documentType: "Driver License",
        licenseClass: serverExtractedData.licenseClass || "",
        dateOfIssue: serverExtractedData.dateOfIssue || "",
        imageUrl: imageUrl,
      };

      setExtractedIdData(mappedData);
      setUploadedImageUrl(imageUrl);

      toast({
        title: "ID Document Processed",
        description:
          "Information extracted successfully. Please review the details.",
      });

      setIsIdReviewOpen(true);
    } catch (error: any) {
      console.error("ID upload error:", error);
      toast({
        title: "Upload Failed",
        description:
          error.message || "Failed to process ID document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingId(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleIdConfirm = async (editedData: ExtractedIdData) => {
    setIsSavingIdData(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Gọi API để confirm và lưu dữ liệu
      const response = await fetch(
        `${API}/api/ocr/confirm-license`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: editedData.fullName,
            dateOfBirth: editedData.dateOfBirth,
            licenseNumber: editedData.idNumber,
            licenseClass: editedData.licenseClass,
            address: editedData.address,
            dateOfIssue: editedData.dateOfIssue,
            imageUrl: editedData.imageUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Server responded with ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setIsVerified(true);
      }

      // Update form data with confirmed information
      setFormData((prev) => ({
        ...prev,
        name: editedData.fullName,
        dateOfBirth: editedData.dateOfBirth,
        licenseId: editedData.idNumber,
        address: editedData.address,
      }));

      toast({
        title: "ID Document Verified",
        description:
          "Your ID information has been successfully verified and saved.",
      });

      setIsIdReviewOpen(false);
    } catch (error: any) {
      console.error("Error saving ID data:", error);
      toast({
        title: "Save Failed",
        description:
          error.message || "Failed to save ID information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingIdData(false);
    }
  };

  const handleIdReject = () => {
    setExtractedIdData(null);
    setUploadedImageUrl(null);
    setIsIdReviewOpen(false);

    toast({
      title: "Upload Cancelled",
      description:
        "Please re-upload your ID document if the extracted information was incorrect.",
      variant: "destructive",
    });
  };

  const triggerIdUpload = () => {
    fileInputRef.current?.click();
  };

  const isFieldLocked = (fieldName: string) => {
    // Only lock the ID number field when ID document is verified
    return fieldName === "licenseId";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto mb-4">
              <Avatar className="h-24 w-24">
                {/*<AvatarImage src={user.avatarUrl} alt={user.name} />*/}
                <AvatarFallback className="text-xl">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-xl">{user.fullName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <Badge
              variant={getRoleBadgeVariant(user.role)}
              className="w-fit mx-auto mt-2"
            >
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Member since</p>
              <p className="font-medium">
                {format(user.creationDate, "MMMM yyyy")}
              </p>
            </div>
            {/*<div className="text-sm text-muted-foreground">*/}
            {/*    <p>Last login</p>*/}
            {/*    /!* TODO: FIX THIS VALUE OF THE LAST LOGIN *!/*/}
            {/*    <p className="font-medium">{user.lastLogin*/}
            {/*        ? format(new Date(user.lastLogin), "MMM d, yyyy")*/}
            {/*        : "NEVER"}*/}
            {/*    </p>*/}
            {/*</div>*/}
            {/*<div className="text-sm text-muted-foreground">*/}
            {/*    <p>Feedback count</p>*/}
            {/*    <p className="font-medium">{user.feedbackCount} reviews</p>*/}
            {/*</div>*/}
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and account information
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseId" className="flex items-center gap-2">
                  ID Number
                  {isFieldLocked("licenseId") && (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  )}
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="licenseId"
                    name="licenseId"
                    value={formData.licenseId}
                    onChange={handleInputChange}
                    disabled={!isEditing || isFieldLocked("licenseId")}
                    className={`pl-10 ${isFieldLocked("licenseId") ? "bg-gray-50" : ""
                      }`}
                  />
                </div>
                {isFieldLocked("licenseId") && (
                  <p className="text-xs text-muted-foreground">
                    Locked - Verified from ID document
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Security</h3>
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>

            <Separator />

            {/* Identity Verification Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Identity Verification</h3>

              {isVerified || user.driverLicenses?.at(0)?.licenseId ? (
                // Hiển thị block xác thực thành công
                <div className="border rounded-lg p-4 bg-green-50 flex items-center gap-4">
                  <div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-green-700 text-lg">Verification Completed</div>
                    <div className="text-sm text-muted-foreground">
                      Your ID document has been successfully verified and processed.
                    </div>
                    <div className="text-xs mt-1">
                      <strong>Note:</strong> Information extracted from your ID document cannot be edited manually for security purposes.
                    </div>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        onClick={triggerIdUpload}
                        disabled={isUploadingId}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Re-upload ID Document
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Hiển thị upload
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>ID Document Upload</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium mb-2">
                        Upload your ID Document
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a clear photo of your government-issued ID. Our
                        system will automatically extract your information for
                        verification.
                      </p>
                      <Button
                        onClick={triggerIdUpload}
                        disabled={isUploadingId}
                        className="mb-2"
                      >
                        {isUploadingId ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JPG, PNG, GIF (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleIdUpload}
                className="hidden"
                aria-label="Upload ID document image"
                title="Upload ID document image"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <IdReviewDialog
        isOpen={isIdReviewOpen}
        onClose={() => setIsIdReviewOpen(false)}
        onConfirm={handleIdConfirm}
        onReject={handleIdReject}
        extractedData={extractedIdData}
        isProcessing={isSavingIdData}
      />
    </div>
  );
}
