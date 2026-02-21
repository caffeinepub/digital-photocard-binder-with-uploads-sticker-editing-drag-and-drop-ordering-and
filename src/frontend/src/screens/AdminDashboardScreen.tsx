import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContentManagerPanel from '../features/admin/ContentManagerPanel';
import UsersPanel from '../features/admin/UsersPanel';
import LayoutPresetsPanel from '../features/admin/LayoutPresetsPanel';
import MasterAdminKeyGate from '../features/admin/MasterAdminKeyGate';

interface AdminDashboardScreenProps {
  onBack: () => void;
}

export default function AdminDashboardScreen({ onBack }: AdminDashboardScreenProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-4 text-binder-text-muted hover:text-binder-text"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Button>
        <h1 className="text-3xl font-bold text-binder-text font-display">Admin Dashboard</h1>
        <p className="text-binder-text-muted mt-2">Manage app content and view user analytics</p>
      </div>

      <MasterAdminKeyGate>
        {(unlocked) => (
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="content" disabled={!unlocked}>Content Manager</TabsTrigger>
              <TabsTrigger value="users" disabled={!unlocked}>Users</TabsTrigger>
              <TabsTrigger value="layout" disabled={!unlocked}>Global Layout Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              <ContentManagerPanel unlocked={unlocked} />
            </TabsContent>
            
            <TabsContent value="users">
              <UsersPanel unlocked={unlocked} />
            </TabsContent>

            <TabsContent value="layout">
              <LayoutPresetsPanel unlocked={unlocked} />
            </TabsContent>
          </Tabs>
        )}
      </MasterAdminKeyGate>
    </div>
  );
}
