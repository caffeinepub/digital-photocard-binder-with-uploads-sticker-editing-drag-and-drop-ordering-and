import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGetAllUsers, useUpdateSubscriptionStatus } from '../../hooks/useQueries';
import AdminUserBinderReadOnlyDialog from './AdminUserBinderReadOnlyDialog';
import { toast } from 'sonner';
import { Loader2, Search, Eye } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { SubscriptionStatus } from '../../backend';
import { normalizeEmail } from '../../utils/normalizeEmail';

interface UsersPanelProps {
  isUnlocked: boolean;
}

export function UsersPanel({ isUnlocked }: UsersPanelProps) {
  const { data: users, isLoading } = useGetAllUsers();
  const updateSubscription = useUpdateSubscriptionStatus();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Principal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchTerm.trim()) return users;

    const normalizedSearch = normalizeEmail(searchTerm);
    return users.filter((user) => {
      if (!user.email) return false;
      return normalizeEmail(user.email).includes(normalizedSearch);
    });
  }, [users, searchTerm]);

  const handleViewBinder = (userPrincipal: Principal) => {
    setSelectedUser(userPrincipal);
    setDialogOpen(true);
  };

  const handleStatusChange = async (userPrincipal: Principal, newStatus: SubscriptionStatus) => {
    try {
      await updateSubscription.mutateAsync({ user: userPrincipal, status: newStatus });
      toast.success('Subscription status updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update subscription: ${error.message}`);
    }
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return 'N/A';
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!isUnlocked) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Please unlock the admin portal to access user oversight.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Oversight Table</CardTitle>
          <CardDescription>View and manage all users and their subscription status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search by Email</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by email..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">User Email</TableHead>
                  <TableHead className="font-bold">Join Date</TableHead>
                  <TableHead className="font-bold">Subscription Status</TableHead>
                  <TableHead className="font-bold">Total Cards Collected</TableHead>
                  <TableHead className="font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No users found matching your search' : 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => (
                    <TableRow key={user.principal.toString()} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <TableCell className="font-medium">{user.email || 'No email'}</TableCell>
                      <TableCell>{formatDate(user.joinDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={user.subscriptionStatus === 'pro' ? 'default' : 'secondary'}
                            className={
                              user.subscriptionStatus === 'pro'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }
                          >
                            {user.subscriptionStatus === 'pro' ? 'Pro' : 'Free'}
                          </Badge>
                          <Select
                            value={user.subscriptionStatus}
                            onValueChange={(value) =>
                              handleStatusChange(user.principal, value as SubscriptionStatus)
                            }
                            disabled={updateSubscription.isPending}
                          >
                            <SelectTrigger className="w-[100px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>{Number(user.cardCount)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBinder(user.principal)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Binder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <AdminUserBinderReadOnlyDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          userPrincipal={selectedUser}
        />
      )}
    </div>
  );
}
