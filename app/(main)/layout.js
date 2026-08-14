import React from "react";
import { NssAiDrawer } from "@/components/nss-ai-drawer";

const MainLayout = ({ children }) => {
  return (
    <div className="container mx-auto my-28 px-2 sm:px-4 min-h-[calc(100vh-14rem)]">
      {children}
      <NssAiDrawer />
    </div>
  );
};

export default MainLayout;