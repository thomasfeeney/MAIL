"use client";

import React from "react";

interface BudgetLine {
  label: string;
  amount: number;
  type: "revenue" | "expense" | "net";
}

interface EnrollmentStat {
  label: string;
  value: number;
  note?: string;
}

const budgetData: BudgetLine[] = [
  { label: "Gross Revenue", amount: 126000, type: "revenue" },
  { label: "Net Revenue (after indirect)", amount: 112226, type: "net" },
  { label: "Dean's Scholarship Allocation", amount: 9000, type: "expense" },
  { label: "Total Compensation", amount: 68040, type: "expense" },
  { label: "Discretionary (Non-Comp)", amount: 9500, type: "expense" },
];

const enrollmentData: EnrollmentStat[] = [
  { label: "Total Students in Program", value: 14 },
  { label: "MAIL 503 Enrollment", value: 10 },
  { label: "MAIL 557 Enrollment", value: 14, note: "+ 2 Engineering non-degree" },
  { label: "UST Faculty/Staff in Program", value: 2 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function BudgetLineItem({ item }: { item: BudgetLine }) {
  const colorClass = {
    revenue: "text-green-600",
    expense: "text-gray-700",
    net: "text-blue-600 font-semibold",
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-700">{item.label}</span>
      <span className={colorClass[item.type]}>{formatCurrency(item.amount)}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: number | string;
  note?: string;
}) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
      {note && <div className="text-xs text-gray-400 mt-1">{note}</div>}
    </div>
  );
}

export default function BudgetTab() {
  // Calculate remaining discretionary
  const totalExpenses = budgetData
    .filter((b) => b.type === "expense")
    .reduce((sum, b) => sum + b.amount, 0);
  const netRevenue = budgetData.find((b) => b.label.includes("Net Revenue"))?.amount || 0;
  const remaining = netRevenue - totalExpenses;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Budget & Enrollment</h2>
        <p className="text-gray-600 text-sm">
          Financial overview and enrollment statistics for the MAIL program.
        </p>
      </div>

      {/* Quick Stats */}
      <section>
        <h3 className="font-medium text-gray-700 mb-4">Enrollment Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {enrollmentData.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              note={stat.note}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Enrollment as of November 16, 2025
        </p>
      </section>

      {/* Budget Overview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-700">FY Budget Summary</h3>
          <span className="text-xs text-gray-400">Index: 24737</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {budgetData.map((item, index) => (
            <BudgetLineItem key={index} item={item} />
          ))}

          <div className="mt-4 pt-4 border-t-2 border-gray-200 flex items-center justify-between">
            <span className="font-medium text-gray-900">Remaining Balance</span>
            <span
              className={`font-semibold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Based on Kim's Summer 2025 estimates
        </p>
      </section>

      {/* Budget Breakdown */}
      <section>
        <h3 className="font-medium text-gray-700 mb-4">Expense Breakdown</h3>
        <div className="space-y-3">
          {/* Compensation Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Total Compensation</span>
              <span className="text-gray-700">{formatCurrency(68040)}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(68040 / netRevenue) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {((68040 / netRevenue) * 100).toFixed(1)}% of net revenue
            </div>
          </div>

          {/* Scholarship Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Dean's Scholarship</span>
              <span className="text-gray-700">{formatCurrency(9000)}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${(9000 / netRevenue) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {((9000 / netRevenue) * 100).toFixed(1)}% of net revenue
            </div>
          </div>

          {/* Discretionary Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Discretionary</span>
              <span className="text-gray-700">{formatCurrency(9500)}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${(9500 / netRevenue) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {((9500 / netRevenue) * 100).toFixed(1)}% of net revenue
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2">Budget Notes</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Revenue projections based on current enrollment trajectory</li>
          <li>Compensation includes faculty stipends for course development and teaching</li>
          <li>Discretionary funds available for marketing, events, and program development</li>
          <li>Dean's scholarship supports student recruitment and retention</li>
        </ul>
      </section>
    </div>
  );
}
