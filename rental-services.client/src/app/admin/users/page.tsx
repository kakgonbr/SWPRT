
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users as UsersIcon, Trash2, MessageSquare, Pencil, Loader2 } from 'lucide-react'; 
import { MOCK_USERS } from '@/lib/mock-data';
import type { User, UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from 'date-fns';
import UserEditDialog, { type UserFormData } from '@/components/admin/user-edit-dialog'; // Import the new dialog
import { Badge } from '@/components/ui/badge'; // Import Badge

export default function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    setUsers(MOCK_USERS);
  }, []);

  const handleDeleteUserConfirm = (userId: string) => {
    const userName = users.find(u => u.id === userId)?.name || 'User';
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    // Also update MOCK_USERS for session consistency (optional, depends on desired mock behavior)
    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    if (userIndex > -1) MOCK_USERS.splice(userIndex, 1);
    
    toast({ title: "User Deleted", description: `${userName} has been removed.` });
    setUserToDelete(null);
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsUserFormOpen(true);
  };

  const handleUserFormSubmit = async (data: UserFormData, userId: string) => {
    setFormSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));

    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
        ? { 
            ...user, 
            name: data.name, 
            email: data.email, 
            role: data.role,
            dateOfBirth: data.dateOfBirth || undefined, // Store as string or undefined
            address: data.address || undefined,
            credentialIdNumber: data.credentialIdNumber || undefined,
          } 
        : user
      )
    );

    // Also update MOCK_USERS for session consistency
    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      MOCK_USERS[userIndex] = { 
        ...MOCK_USERS[userIndex], 
        name: data.name, 
        email: data.email, 
        role: data.role,
        dateOfBirth: data.dateOfBirth || undefined,
        address: data.address || undefined,
        credentialIdNumber: data.credentialIdNumber || undefined,
      };
    }
    
    setFormSubmitting(false);
    setIsUserFormOpen(false);
    setEditingUser(null);
    toast({ title: "User Updated", description: `${data.name}'s information has been updated.` });
  };


  return (
    <AlertDialog open={!!userToDelete} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setUserToDelete(null);
      }
    }}>
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center">
              <UsersIcon className="h-7 w-7 mr-2 text-primary" /> User Account Management
            </CardTitle>
            <CardDescription>View, edit, and remove user accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[100px]">Role</TableHead>
                  <TableHead className="w-[150px]">Last Login</TableHead>
                  <TableHead className="w-[120px]">Feedback</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                       <TableCell>
                        <Badge 
                          variant={user.role === 'admin' ? 'destructive' : user.role === 'staff' ? 'secondary' : 'outline'}
                          className="capitalize"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.lastLogin ? `${formatDistanceToNow(user.lastLogin, { addSuffix: true })}` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.feedbackCount !== undefined ? (
                            <div className="flex items-center">
                                <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/70"/>
                                {`${user.feedbackCount} item(s)`}
                            </div>
                        ) : (
                            'N/A'
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditUser(user)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit User</span>
                        </Button>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setUserToDelete(user)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete User</span>
                          </Button>
                        </AlertDialogTrigger>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <UserEditDialog
        open={isUserFormOpen}
        onOpenChange={setIsUserFormOpen}
        onSubmit={handleUserFormSubmit}
        userToEdit={editingUser}
        isLoading={formSubmitting}
      />

      <AlertDialogContent>
        {userToDelete && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the account for
                "{userToDelete.name}" ({userToDelete.email}).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteUserConfirm(userToDelete.id)}>
                {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, delete user
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
