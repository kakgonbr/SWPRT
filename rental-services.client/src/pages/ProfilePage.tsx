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
import { useToast } from "../hooks/use-toast";
import { format } from "date-fns";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import IdReviewDialog from "../components/IdReviewDialog";

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
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedIdData | null>(null);
  const [isIdReviewOpen, setIsIdReviewOpen] = useState(false);
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
      licenseId: user.driverLicenses?.licenseId || "",
    });
  }, [user, isAuthenticated, loading, navigate]);

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
      licenseId: user.driverLicenses?.licenseId || "",
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

    // Gọi API OCR
    const formData = new FormData();
    formData.append('image', file);

    // Lấy token từ localStorage
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5125/api/Ocr/upload-license', {
        method: 'POST',
        body: formData,
        headers: {
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        }
      });
      const data = await res.json();
      if (res.ok && data.extractedData) {
        const extracted = data.extractedData;
        setExtractedData({
          fullName: extracted.fullName,
          dateOfBirth: extracted.dateOfBirth,
          idNumber: extracted.licenseNumber,
          address: extracted.address,
          documentType: "driver_license",
          licenseClass: extracted.licenseClass,
          dateOfIssue: extracted.dateOfIssue,
        });
        setIsIdReviewOpen(true);
      } else {
        toast({ title: "OCR Failed", description: data.message || "Không trích xuất được dữ liệu", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Lỗi khi gửi ảnh lên server", variant: "destructive" });
    }

    // Preview ảnh như cũ (nếu muốn)
    const localUrl = URL.createObjectURL(file);
    setLocalImageUrl(localUrl);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerIdUpload = () => {
    fileInputRef.current?.click();
  };

  const isFieldLocked = (fieldName: string) => {
    // Only lock the ID number field when ID document is verified
    return fieldName === "licenseId";
  };

  const handleConfirmIdData = async (data: ExtractedIdData) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    // Map idNumber -> licenseNumber cho backend, loại bỏ idNumber
    const payload = {
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      licenseNumber: data.idNumber,
      address: data.address,
      documentType: data.documentType,
      licenseClass: data.licenseClass,
      dateOfIssue: data.dateOfIssue,
      imageUrl: data.imageUrl,
      expiryDate: data.expiryDate,
      placeOfBirth: data.placeOfBirth,
      nationality: data.nationality,
    };
    // Gọi API /api/ocr/confirm-license để lưu vào DB
    try {
      const res = await fetch('http://localhost:5125/api/Ocr/confirm-license', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok) {
        setIsVerified(true);
        toast({ title: "Thành công", description: result.message });
        setIsIdReviewOpen(false);

        // Cập nhật formData ngay lập tức
        setFormData((prev) => ({
          ...prev,
          licenseId: payload.licenseNumber, // hoặc extractedData.idNumber
        }));

        // Nếu bạn dùng extractedData để render, cũng cập nhật nó
        setExtractedData(null);

        // Gọi reloadUser để đồng bộ với backend (có thể giữ lại)
        reloadUser();
      } else {
        toast({ title: "Lỗi xác nhận", description: result.message || "Có lỗi xảy ra", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Lỗi", description: "Không thể xác nhận thông tin", variant: "destructive" });
    }
  };

  const reloadUser = async () => {
    const token = localStorage.getItem('token');
  
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5125/api/Auth/me', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (res.ok) {
        const userData = await res.json();
        setFormData({
          name: userData.fullName,
          email: userData.email,
          dateOfBirth: String(userData.dateOfBirth) || "",
          address: userData.address || "",
          licenseId: userData.driverLicenses?.licenseId || "",
        });
        // Cập nhật lại localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        // Nếu context có setUser thì gọi setUser(userData);
      }
    } catch (err) {
      // Xử lý lỗi nếu cần
    }
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
                    className={`pl-10 ${
                      isFieldLocked("licenseId") ? "bg-gray-50" : ""
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

              {(user.driverLicenses?.licenseId || isVerified) ? (
                <div className="flex items-center gap-3 bg-green-100 border border-green-400 text-green-800 rounded-lg p-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <div className="font-semibold">Verification successful</div>
                    <div>The image has been uploaded and information extracted successfully.</div>
                  </div>
                  <Button
                    onClick={triggerIdUpload}
                    className="ml-4"
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Re-upload
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>ID Document Upload</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium mb-2">
                        Upload your ID Document
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a clear photo of your government-issued ID. This image will only be previewed locally and not uploaded.
                      </p>
                      <Button
                        onClick={triggerIdUpload}
                        className="mb-2"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
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
        extractedData={extractedData}
        onClose={() => setIsIdReviewOpen(false)}
        onConfirm={handleConfirmIdData}
        onReject={() => setIsIdReviewOpen(false)}
        uploadedImageUrl={localImageUrl || ""}
      />
    </div>
  );
}
