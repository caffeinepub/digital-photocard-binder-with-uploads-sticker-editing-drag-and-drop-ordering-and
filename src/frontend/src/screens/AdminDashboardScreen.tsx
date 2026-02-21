import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContentManagerPanel from '../features/admin/ContentManagerPanel';
import UsersPanel from '../features/admin/UsersPanel';
import LayoutPresetsPanel from '../features/admin/LayoutPresetsPanel';
import PaymentSettingsPanel from '../features/admin/PaymentSettingsPanel';
import MasterAdminKeyGate from '../features/admin/MasterAdminKeyGate';

export default function AdminDashboardScreen() {
  const [activeTab, setActiveTab] = useState('content');

  console.log('[AdminDashboardScreen] Rendering with active tab:', activeTab);

  return (
    <MasterAdminKeyGate>
      {(unlocked) => {
        console.log('[AdminDashboardScreen] MasterAdminKeyGate unlocked state:', unlocked);
        
        return (
          <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-binder-text font-display mb-2">
                Admin Dashboard
              </h1>
              <p className="text-binder-text-muted">
                Manage content, users, layouts, and payment settings
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="content" disabled={!unlocked}>
                  Content Manager
                </TabsTrigger>
                <TabsTrigger value="users" disabled={!unlocked}>
                  Users
                </TabsTrigger>
                <TabsTrigger value="layouts" disabled={!unlocked}>
                  Global Layout Options
                </TabsTrigger>
                <TabsTrigger value="payment" disabled={!unlocked}>
                  Payment Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content">
                <ContentManagerPanel unlocked={unlocked} />
              </TabsContent>

              <TabsContent value="users">
                <UsersPanel unlocked={unlocked} />
              </TabsContent>

              <TabsContent value="layouts">
                <LayoutPresetsPanel unlocked={unlocked} />
              </TabsContent>

              <TabsContent value="payment">
                <PaymentSettingsPanel unlocked={unlocked} />
              </TabsContent>
            </Tabs>
          </div>
        );
      }}
    </MasterAdminKeyGate>
  );
}
