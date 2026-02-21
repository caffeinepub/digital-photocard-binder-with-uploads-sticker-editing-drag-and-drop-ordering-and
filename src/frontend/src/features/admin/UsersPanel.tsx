import { useState, useEffect } from 'react';
import { useGetAllUsers, useGetFilteredUsers } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, AlertCircle, Users, Lock, Search, Eye } from 'lucide-react';
import { SubscriptionStatus } from '../../backend';
import type { UserAnalytics } from '../../backend';
import AdminUserBinderReadOnlyDialog from './AdminUserBinderReadOnlyDialog';

interface UsersPanelProps {
  unlocked: boolean;
}

export default function UsersPanel({ unlocked }: UsersPanelProps) {
  const { data: allUsers, isLoading: allUsersLoading, error, refetch } = useGetAllUsers();
  const filterMutation = useGetFilteredUsers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedUsers, setDisplayedUsers] = useState<UserAnalytics[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserAnalytics | null>(null);
  const [showBinderDialog, setShowBinderDialog] = useState(false);

  // Update displayed users when allUsers changes or search is cleared
  useEffect(() => {
    if (allUsers && searchQuery === '') {
      setDisplayedUsers(allUsers);
    }
  }, [allUsers, searchQuery]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setDisplayedUsers(allUsers || []);
      return;
    }

    try {
      const filtered = await filterMutation.mutateAsync(searchQuery.toLowerCase());
      setDisplayedUsers(filtered);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // Trigger search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getSubscriptionBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.pro:
        return <Badge className="bg-green-600 text-white hover:bg-green-700">Pro</Badge>;
      case SubscriptionStatus.free:
        return <Badge variant="outline" className="text-gray-600 border-gray-400">Free</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === BigInt(0)) {
      return 'N/A';
    }
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleViewBinder = (user: UserAnalytics) => {
    if (!unlocked) return;
    setSelectedUser(user);
    setShowBinderDialog(true);
  };

  if (allUsersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-binder-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load user analytics. <Button variant="link" onClick={() => refetch()} className="p-0 h-auto">Retry</Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {!unlocked && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            User management is locked. Enter the Master Admin Key to access editing features.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Oversight Table
              </CardTitle>
              <CardDescription>View all users and their collection statistics</CardDescription>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-binder-text-muted" />
              <Input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={filterMutation.isPending}
            >
              {filterMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
            {searchQuery && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setDisplayedUsers(allUsers || []);
                }}
              >
                Clear
              </Button>
            )}
          </div>

          {/* User Table */}
          {!displayedUsers || displayedUsers.length === 0 ? (
            <div className="text-center py-8 text-binder-text-muted">
              {searchQuery ? 'No users found matching your search' : 'No users found'}
            </div>
          ) : (
            <div className="rounded-md border border-binder-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-binder-accent/10">
                    <TableHead className="font-bold">User Email</TableHead>
                    <TableHead className="font-bold">Join Date</TableHead>
                    <TableHead className="font-bold">Subscription Status</TableHead>
                    <TableHead className="font-bold text-right">Total Cards Collected</TableHead>
                    <TableHead className="font-bold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedUsers.map((user, index) => (
                    <TableRow 
                      key={user.principal.toString()}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <TableCell>
                        {user.email || <span className="text-binder-text-muted italic">No email</span>}
                      </TableCell>
                      <TableCell>{formatDate(user.joinDate)}</TableCell>
                      <TableCell>
                        {getSubscriptionBadge(user.subscriptionStatus)}
                      </TableCell>
                      <TableCell className="text-right">{Number(user.cardCount)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBinder(user)}
                          disabled={!unlocked}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Binder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="text-sm text-binder-text-muted">
            Total users: {displayedUsers?.length || 0}
          </div>
        </CardContent>
      </Card>

      {/* Read-only Binder Dialog */}
      {selectedUser && (
        <AdminUserBinderReadOnlyDialog
          open={showBinderDialog}
          onOpenChange={setShowBinderDialog}
          user={selectedUser}
        />
      )}
    </div>
  );
}
