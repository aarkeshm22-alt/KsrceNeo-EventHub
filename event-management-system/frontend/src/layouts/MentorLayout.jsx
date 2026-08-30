import { useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/navbar/Topbar";
import {mentorMenu} from "../components/sidebar/mentorMenu";
import { Outlet } from "react-router-dom";

const MentorLayout = () => {
  // Desktop defaults to open (true), mobile drawer toggle handles it smoothly
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    /* FIXED CONTAINER CLASSES:
      Changed 'min-h-screen' to 'h-screen' and added 'overflow-hidden'. 
      This locks the browser window viewport so it cannot scroll globally.
    */
    <div className="h-screen w-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden">
      
      {/* 1. SIDEBAR NAVIGATION CONSOLE
        It sits comfortably inside our h-screen layout wrapper 
      */}
      <Sidebar
        menu={mentorMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* 2. MASTER INTERFACE BODY
        Added 'h-full' and 'overflow-hidden' to set a solid bounding box for content areas
      */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOPBAR HUB CONTROLS */}
        <Topbar setSidebarOpen={setSidebarOpen} />

        {/* 3. MAIN DYNAMIC WORKSPACE (OUTLET HOUSING)
          FIXED SCROLL LAYER:
          Added 'overflow-y-auto' here. Now, the main body handles its own scrolling 
          independently while the sidebar stays locked on the left side of the screen.
        */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto overflow-y-auto scrollbar-smooth transition-all duration-300 ease-in-out">
          
          {/* Nested Dashboard Component Routes Render Here */}
          <Outlet />
          
        </main>

      </div>
    </div>
  );
};

export default MentorLayout;