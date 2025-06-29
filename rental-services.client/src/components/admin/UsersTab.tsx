import { useState, useCallback, useEffect } from 'react'
import { Edit } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
//import { MOCK_USERS } from '../../lib/mock-data'
import { format } from 'date-fns'
import { type User } from '../../lib/types'

const API = import.meta.env.VITE_API_BASE_URL;

interface UsersTabProps {
    onEditUser: (user: User) => void,
    refreshToken: number
}

export default function UsersTab({ onEditUser, refreshToken }: UsersTabProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const rawToken = localStorage.getItem('token');
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(() => {
        if (!rawToken) {
            setError("No auth token found");
            setLoading(false);
            return;
        }

        fetch(`${API}/api/users`, {
            headers: {
                Authorization: `Bearer ${rawToken}`
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch users: ' + response.statusText);
                return response.json();
            })
            .then((data: User[]) => {
                setUsers(data);
            })
            .catch((err) => {
                setError(err.message);
                setUsers([]);
            })
            .finally(() => setLoading(false));
    }, [rawToken])

    useEffect(() => { fetchUsers() }, [fetchUsers, refreshToken]);

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error}</div>;        ;

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map((user) => (
                        <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                                    <AvatarFallback>
                                        {user.fullName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{user.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Joined {format(user.creationDate, 'MMM yyyy')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge variant={
                                    user.role === 'admin' ? 'default' :
                                        user.role === 'staff' ? 'secondary' :
                                            'outline'
                                }>
                                    {user.role}
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEditUser(user)}
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}