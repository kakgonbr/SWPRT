
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Lock, Save, Fingerprint, UploadCloud } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, updateUserCredentials } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [credentialIdNumber, setCredentialIdNumber] = useState('');
  const [credentialIdImageFile, setCredentialIdImageFile] = useState<File | null>(null);
  const [credentialIdImagePreview, setCredentialIdImagePreview] = useState<string | null>(null);


  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login?redirect=/profile');
    }
    if (user) {
      setName(user.name || '');
      setDateOfBirth(user.dateOfBirth || '');
      setAddress(user.address || '');
      setCredentialIdNumber(user.credentialIdNumber || '');
      // Ensure existing image URL from user object is used for preview if available and no new file selected
      if (!credentialIdImageFile && user.credentialIdImageUrl) {
        setCredentialIdImagePreview(user.credentialIdImageUrl);
      }
    }
  }, [user, isAuthenticated, authLoading, router, credentialIdImageFile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would call an API to update the user's profile
    // For mock, we can update the user object in AuthContext if needed, or just toast
    toast({
      title: "Profile Update (Mock)",
      description: "Your personal information has been 'updated'. (This is a mock action)",
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation password do not match.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
        toast({
            title: "Password Too Short",
            description: "New password must be at least 6 characters.",
            variant: "destructive",
        });
        return;
    }
    // In a real app, you would call an API to change the password
    toast({
      title: "Password Update (Mock)",
      description: "Your password has been 'changed'. (This is a mock action)",
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCredentialIdImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCredentialIdImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCredentialIdImageFile(null);
      setCredentialIdImagePreview(user?.credentialIdImageUrl || null); 
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let imageUrlToSave = user.credentialIdImageUrl; 
    if (credentialIdImageFile) {
        imageUrlToSave = credentialIdImagePreview || undefined;
    }
    
    const success = await updateUserCredentials({
      credentialIdNumber: credentialIdNumber || undefined, 
      credentialIdImageUrl: imageUrlToSave,
    });

    if (success) {
      toast({
        title: "Credentials Updated",
        description: "Your credential ID information has been saved.",
      });
    } else {
      toast({
        title: "Update Failed",
        description: "Could not update credentials. Please try again.",
        variant: "destructive",
      });
    }
  };


  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2 flex items-center">
          <UserCircle className="w-10 h-10 mr-3" /> Your Profile
        </h1>
        <p className="text-muted-foreground text-lg">Manage your personal information, credentials, and account settings.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Personal Information</CardTitle>
          <CardDescription>Update your name, date of birth, and address.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={user.email} disabled className="mt-1 bg-muted/50" />
              <p className="text-xs text-muted-foreground mt-1">Your email address cannot be changed.</p>
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" rows={3} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" /> Save Profile Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Separator />

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Fingerprint className="mr-2 h-5 w-5 text-primary"/>Credential ID</CardTitle>
          <CardDescription>Provide your credential ID number and an image of your ID. This is required for renting.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveCredentials}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="credentialIdNumber">Credential ID Number</Label>
              <Input 
                id="credentialIdNumber" 
                type="text" 
                value={credentialIdNumber} 
                onChange={(e) => setCredentialIdNumber(e.target.value)} 
                className="mt-1" 
                placeholder="e.g., A12345678"
              />
            </div>
            <div>
              <Label htmlFor="credentialIdImage">Upload ID Image</Label>
              <Input 
                id="credentialIdImage" 
                type="file" 
                accept="image/*"
                onChange={handleImageFileChange} 
                className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
               <p className="text-xs text-muted-foreground mt-1">Upload a clear image of your ID (e.g., Driver's License, National ID).</p>
            </div>
            {credentialIdImagePreview && (
              <div className="mt-2">
                <Label>Current ID Image Preview:</Label>
                <div className="mt-1 border rounded-md p-2 inline-block">
                  <Image 
                    src={credentialIdImagePreview} 
                    alt="ID Preview" 
                    width={200} 
                    height={120} 
                    className="rounded-md object-contain max-h-40" 
                  />
                </div>
              </div>
            )}
             {(!user.credentialIdNumber || !user.credentialIdImageUrl) && (
                <p className="text-sm text-destructive mt-2">Your credential ID is missing. Please provide it to enable rentals.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={authLoading}>
              <UploadCloud className="mr-2 h-4 w-4" /> Save Credentials
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Change Password</CardTitle>
          <CardDescription>Update your account password. Ensure it's strong and unique.</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdatePassword}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="mt-1" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">
              <Lock className="mr-2 h-4 w-4" /> Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

    