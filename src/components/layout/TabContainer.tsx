"use client";

import React from "react";
import CoursesTab from "@/components/tabs/CoursesTab";
import FilesTab from "@/components/tabs/FilesTab";
import MarketingTab from "@/components/tabs/MarketingTab";
import AssessmentTab from "@/components/tabs/AssessmentTab";
import BudgetTab from "@/components/tabs/BudgetTab";
import StudentsTab from "@/components/tabs/StudentsTab";

export type TabId = "courses" | "files" | "marketing" | "assessment" | "budget" | "students";

interface Tab {
  id: TabId;
  label: string;
}

interface TabContainerProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: Tab[] = [
  { id: "courses", label: "Courses" },
  { id: "students", label: "Students" },
  { id: "files", label: "Files" },
  { id: "marketing", label: "Marketing" },
  { id: "assessment", label: "Assessment" },
  { id: "budget", label: "Budget" },
];

const tabContent: Record<TabId, React.FC> = {
  courses: CoursesTab,
  students: StudentsTab,
  files: FilesTab,
  marketing: MarketingTab,
  assessment: AssessmentTab,
  budget: BudgetTab,
};

export default function TabContainer({ activeTab, onTabChange }: TabContainerProps) {
  const ActiveContent = tabContent[activeTab];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="flex px-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <ActiveContent />
      </div>
    </div>
  );
}
