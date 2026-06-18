// src/pages/Settings.tsx
import { useState } from "react";
import { Layout } from "../app/components/Layout";
import { SettingsNav, TabType } from "../app/components/Settings/SettingsNav";
import { ProfileTab } from "../app/components/Settings/ProfileTab";
import { AppearanceTab } from "../app/components/Settings/AppearanceTab";
import { NotificationsTab } from "../app/components/Settings/NotificationsTab";
import { CustomizationTab } from "../app/components/Settings/CustomizationTab";
import { AccountTab } from "../app/components/Settings/AccountTab";
import { AiTab } from "../app/components/Settings/AiTab";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  return (
    <Layout title="Settings">
      <div className="flex flex-col md:flex-row gap-6 p-6 min-h-screen w-full items-start">
        <SettingsNav activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 w-full md:max-w-4xl">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "appearance" && <AppearanceTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "customization" && <CustomizationTab />}
          {activeTab === "account" && <AccountTab />}
          {activeTab === "ai" && <AiTab />}
        </div>
      </div>
    </Layout>
  );
}
