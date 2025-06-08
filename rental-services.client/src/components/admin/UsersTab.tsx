import { Edit } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { MOCK_USERS } from '../../lib/mock-data'
import { format } from 'date-fns'
import { type User } from '../../lib/types'

interface UsersTabProps {
    onEditUser: (user: User) => void
}

export default function UsersTab({ onEditUser }: UsersTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {MOCK_USERS.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                                    <AvatarFallback>
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Joined {format(user.createdAt, 'MMM yyyy')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Badge variant={user.status ? 'default' : 'destructive'}>
                                    {user.status ? 'Active' : 'Inactive'}
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