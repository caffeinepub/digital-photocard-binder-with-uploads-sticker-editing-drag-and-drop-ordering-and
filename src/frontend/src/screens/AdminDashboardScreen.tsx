import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentManagerPanel } from '../features/admin/ContentManagerPanel';
import { UsersPanel } from '../features/admin/UsersPanel';
import { LayoutPresetsPanel } from '../features/admin/LayoutPresetsPanel';
import PaymentSettingsPanel from '../features/admin/PaymentSettingsPanel';
import { MasterAdminKeyGate } from '../features/admin/MasterAdminKeyGate';

export default function AdminDashboardScreen() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  console.log('[AdminDashboardScreen] Render. isUnlocked:', isUnlocked);

  const handleUnlock = () => {
    console.log('[AdminDashboardScreen] Admin portal unlocked');
    setIsUnlocked(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your application content and settings</p>
      </div>

      <MasterAdminKeyGate onUnlock={handleUnlock} isUnlocked={isUnlocked} />

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" disabled={!isUnlocked}>
            Content Manager
          </TabsTrigger>
          <TabsTrigger value="users" disabled={!isUnlocked}>
            User Oversight
          </TabsTrigger>
          <TabsTrigger value="layouts" disabled={!isUnlocked}>
            Layout Options
          </TabsTrigger>
          <TabsTrigger value="payment" disabled={!isUnlocked}>
            Payment Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <ContentManagerPanel isUnlocked={isUnlocked} />
        </TabsContent>

        <TabsContent value="users">
          <UsersPanel isUnlocked={isUnlocked} />
        </TabsContent>

        <TabsContent value="layouts">
          <LayoutPresetsPanel isUnlocked={isUnlocked} />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentSettingsPanel unlocked={isUnlocked} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
