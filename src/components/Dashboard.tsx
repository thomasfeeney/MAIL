"use client";

import { useState, useCallback } from "react";
import Header from "./layout/Header";
import TaskPanel from "./layout/TaskPanel";
import TabContainer from "./layout/TabContainer";
import { SearchResult } from "@/hooks/useSearch";

type TabId = "courses" | "files" | "marketing" | "assessment" | "budget";

export default function Dashboard() {
  const [taskPanelCollapsed, setTaskPanelCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("courses");

  // Handle navigation from search results
  const handleSearchNavigate = useCallback((type: SearchResult["type"], id: string) => {
    // Map result types to tabs
    const tabMap: Record<SearchResult["type"], TabId> = {
      task: "courses", // Tasks are in sidebar, but navigate to courses as default
      course: "courses",
      contact: "marketing",
      file: "files",
    };

    setActiveTab(tabMap[type]);

    // For tasks, we could potentially scroll to them or highlight them
    // For now, we just navigate to the relevant tab
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header onNavigate={handleSearchNavigate} />

      <div className="flex-1 flex overflow-hidden">
        <TaskPanel
          isCollapsed={taskPanelCollapsed}
          onToggle={() => setTaskPanelCollapsed(!taskPanelCollapsed)}
        />
        <TabContainer activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
