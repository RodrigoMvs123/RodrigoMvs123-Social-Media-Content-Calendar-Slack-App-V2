import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SlackSettings from "@/components/slack/SlackSettings";
import SlackStatus from "@/components/slack/SlackStatus";

const Settings = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Settings - Social Media Content Calendar</title>
        <meta name="description" content="Configure your social media calendar settings" />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-600 mt-1">Configure your social media calendar app</p>
          </div>
          
          <SlackStatus className="mb-8" />
          
          <Tabs defaultValue="slack" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="slack">Slack Integration</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="slack">
              <SlackSettings />
            </TabsContent>
            
            <TabsContent value="notifications">
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-500">Notification settings will be available in a future update.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="account">
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-500">Account settings will be available in a future update.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;