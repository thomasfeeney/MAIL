"use client";

import React, { useState } from "react";
import { useBudget, FiscalYear } from "@/hooks/useBudget";
import { useEnrollment, EnrollmentEntry } from "@/hooks/useEnrollment";
import { useScholarships, Scholarship } from "@/hooks/useScholarships";
import { useExpenses, Expense } from "@/hooks/useExpenses";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function EditableNumber({
  value,
  onCommit,
  format = "number",
  className = "",
}: {
  value: number;
  onCommit: (val: number) => void;
  format?: "number" | "currency";
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const display = format === "currency" ? formatCurrency(value) : value.toLocaleString();

  if (editing) {
    return (
      <input
        type="number"
        className={`border border-blue-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400 ${className}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onCommit(parseFloat(draft) || 0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEditing(false);
            onCommit(parseFloat(draft) || 0);
          }
          if (e.key === "Escape") {
            setEditing(false);
            setDraft(String(value));
          }
        }}
        autoFocus
      />
    );
  }

  return (
    <span
      className={`cursor-pointer hover:bg-gray-100 rounded px-2 py-1 inline-block ${className}`}
      onClick={() => { setDraft(String(value)); setEditing(true); }}
      title="Click to edit"
    >
      {display}
    </span>
  );
}

function EditableText({
  value,
  onCommit,
  placeholder = "",
  className = "",
}: {
  value: string;
  onCommit: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <input
        type="text"
        className={`border border-blue-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400 ${className}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { setEditing(false); onCommit(draft); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { setEditing(false); onCommit(draft); }
          if (e.key === "Escape") { setEditing(false); setDraft(value); }
        }}
        autoFocus
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      className={`cursor-pointer hover:bg-gray-100 rounded px-2 py-1 inline-block min-w-[2rem] ${className}`}
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Click to edit"
    >
      {value || <span className="text-gray-300">{placeholder || "—"}</span>}
    </span>
  );
}

function ScholarshipSection({
  fy,
  scholarships,
  addScholarship,
  updateScholarship,
  deleteScholarship,
  continueScholarship,
}: {
  fy: FiscalYear;
  scholarships: Scholarship[];
  addScholarship: () => void;
  updateScholarship: (id: string, updates: Partial<Scholarship>) => void;
  deleteScholarship: (id: string) => void;
  continueScholarship: (studentName: string, perCreditDiscount: number, fromFY: string) => void;
}) {
  const allocated = scholarships.reduce((sum, s) => sum + s.credits * s.perCreditDiscount, 0);
  const remaining = fy.scholarshipAllotted - allocated;
  const students = [...new Set(scholarships.map((s) => s.studentName))].sort();

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Allotted</div>
          <div className="text-lg font-semibold text-gray-900">{formatCurrency(fy.scholarshipAllotted)}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Allocated</div>
          <div className="text-lg font-semibold text-gray-900">{formatCurrency(allocated)}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Remaining</div>
          <div className={`text-lg font-semibold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(remaining)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {fy.scholarshipAllotted > 0 && (
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${remaining >= 0 ? "bg-blue-500" : "bg-red-500"}`}
            style={{ width: `${Math.min((allocated / fy.scholarshipAllotted) * 100, 100)}%` }}
          />
        </div>
      )}

      {/* Detail table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 pr-2 font-medium">Student</th>
              <th className="py-2 pr-2 font-medium">Term</th>
              <th className="py-2 pr-2 font-medium text-right">Credits</th>
              <th className="py-2 pr-2 font-medium text-right">$/Credit</th>
              <th className="py-2 pr-2 font-medium text-right">Amount</th>
              <th className="py-2 pr-2 font-medium">Notes</th>
              <th className="py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const rows = scholarships.filter((s) => s.studentName === student);
              return rows.map((s, idx) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-1.5 pr-2">
                    {idx === 0 ? (
                      <EditableText
                        value={s.studentName}
                        onCommit={(val) => rows.forEach((r) => updateScholarship(r.id, { studentName: val }))}
                        placeholder="Name"
                      />
                    ) : (
                      <span className="text-gray-300 px-2">↳</span>
                    )}
                  </td>
                  <td className="py-1.5 pr-2">
                    <EditableText
                      value={s.term}
                      onCommit={(val) => updateScholarship(s.id, { term: val })}
                      placeholder="Term"
                    />
                  </td>
                  <td className="py-1.5 pr-2 text-right">
                    <EditableNumber
                      value={s.credits}
                      onCommit={(val) => updateScholarship(s.id, { credits: val })}
                      className="text-right"
                    />
                  </td>
                  <td className="py-1.5 pr-2 text-right">
                    <EditableNumber
                      value={s.perCreditDiscount}
                      onCommit={(val) => updateScholarship(s.id, { perCreditDiscount: val })}
                      format="currency"
                      className="text-right"
                    />
                  </td>
                  <td className="py-1.5 pr-2 text-right font-medium text-gray-900">
                    {formatCurrency(s.credits * s.perCreditDiscount)}
                  </td>
                  <td className="py-1.5 pr-2">
                    <EditableText
                      value={s.notes}
                      onCommit={(val) => updateScholarship(s.id, { notes: val })}
                      placeholder="Notes"
                    />
                  </td>
                  <td className="py-1.5 whitespace-nowrap">
                    {idx === 0 && s.perCreditDiscount > 0 && (
                      <button
                        onClick={() => continueScholarship(s.studentName, s.perCreditDiscount, fy.fiscalYear)}
                        className="text-gray-400 hover:text-blue-600 text-xs mr-2"
                        title={`Continue into next FY at ${formatCurrency(s.perCreditDiscount)}/credit`}
                      >
                        &rarr;
                      </button>
                    )}
                    <button
                      onClick={() => deleteScholarship(s.id)}
                      className="text-gray-300 hover:text-red-500 text-xs"
                      title="Delete"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ));
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200">
              <td colSpan={4} className="py-2 font-medium text-gray-900">Total Allocated</td>
              <td className="py-2 text-right font-semibold text-gray-900">{formatCurrency(allocated)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button
        onClick={addScholarship}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        + Add scholarship
      </button>
    </div>
  );
}

export default function BudgetTab() {
  const {
    fiscalYears,
    updateFiscalYear,
    addFiscalYear,
    deleteFiscalYear,
    isLoading: budgetLoading,
    error: budgetError,
    isSaving: budgetSaving,
  } = useBudget();

  const {
    enrollment,
    updateEntry,
    ensureFiscalYear: ensureEnrollmentFY,
    isLoading: enrollmentLoading,
    error: enrollmentError,
    isSaving: enrollmentSaving,
  } = useEnrollment();

  const {
    scholarships: allScholarships,
    addScholarship,
    updateScholarship,
    deleteScholarship,
    continueScholarship,
    isLoading: scholarshipsLoading,
    error: scholarshipsError,
    isSaving: scholarshipsSaving,
  } = useScholarships();

  const {
    expenses: allExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    isLoading: expensesLoading,
    error: expensesError,
    isSaving: expensesSaving,
  } = useExpenses();

  const [selectedFYId, setSelectedFYId] = useState<string>("");
  const [addingYear, setAddingYear] = useState(false);
  const [newYearDraft, setNewYearDraft] = useState("");

  // Set default FY once loaded
  React.useEffect(() => {
    if (fiscalYears.length > 0 && !selectedFYId) {
      setSelectedFYId(fiscalYears[0].id);
    }
  }, [fiscalYears, selectedFYId]);

  // Ensure enrollment rows exist for the selected FY
  const selectedFY = fiscalYears.find((f) => f.id === selectedFYId);
  React.useEffect(() => {
    if (selectedFY && !enrollmentLoading) {
      ensureEnrollmentFY(selectedFY.fiscalYear);
    }
  }, [selectedFY?.fiscalYear, enrollmentLoading, ensureEnrollmentFY]);

  if (budgetLoading || enrollmentLoading || scholarshipsLoading || expensesLoading) {
    return <div className="p-6 text-gray-500">Loading budget data...</div>;
  }

  if (budgetError || enrollmentError || scholarshipsError || expensesError) {
    return <div className="p-6 text-red-500">{budgetError || enrollmentError || scholarshipsError || expensesError}</div>;
  }

  const isSaving = budgetSaving || enrollmentSaving || scholarshipsSaving || expensesSaving;
  const fy = fiscalYears.find((f) => f.id === selectedFYId);

  if (!fy) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No fiscal years configured.</p>
        <button
          onClick={() => { addFiscalYear("FY26"); }}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          + Create FY26
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Program Budget</h2>
          <p className="text-gray-500 text-sm">Tracking enrollment, scholarships, and discretionary spending by fiscal year.</p>
        </div>
        <div className="text-xs text-gray-400">
          {isSaving ? "Saving..." : "Saved"}
        </div>
      </div>

      {/* Fiscal Year Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Fiscal Year:</label>
        <select
          className="border border-gray-200 rounded px-3 py-1.5 text-sm bg-white"
          value={selectedFYId}
          onChange={(e) => setSelectedFYId(e.target.value)}
        >
          {fiscalYears.map((f) => (
            <option key={f.id} value={f.id}>{f.fiscalYear}</option>
          ))}
        </select>
        {addingYear ? (
          <div className="flex items-center gap-2">
            <input
              className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
              placeholder="FY28"
              value={newYearDraft}
              onChange={(e) => setNewYearDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newYearDraft.trim()) {
                  addFiscalYear(newYearDraft.trim());
                  setNewYearDraft("");
                  setAddingYear(false);
                }
                if (e.key === "Escape") { setAddingYear(false); setNewYearDraft(""); }
              }}
              autoFocus
            />
            <button
              onClick={() => {
                if (newYearDraft.trim()) {
                  addFiscalYear(newYearDraft.trim());
                  setNewYearDraft("");
                  setAddingYear(false);
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Add
            </button>
            <button
              onClick={() => { setAddingYear(false); setNewYearDraft(""); }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingYear(true)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Year
          </button>
        )}
        {fiscalYears.length > 1 && (
          <button
            onClick={() => {
              const next = fiscalYears.find((f) => f.id !== fy.id);
              if (next) setSelectedFYId(next.id);
              deleteFiscalYear(fy.id);
            }}
            className="text-sm text-gray-400 hover:text-red-500 ml-auto"
          >
            Delete {fy.fiscalYear}
          </button>
        )}
      </div>

      {/* Tuition Rate */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-gray-600">Tuition per credit:</span>
        <EditableNumber
          value={fy.tuitionPerCredit}
          onCommit={(val) => updateFiscalYear(fy.id, { tuitionPerCredit: val })}
          format="currency"
        />
      </div>

      {/* Enrollment */}
      <section>
        <h3 className="font-medium text-gray-700 mb-4">Enrollment</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl font-semibold text-gray-900">
              <EditableNumber
                value={fy.totalEnrollment}
                onCommit={(val) => updateFiscalYear(fy.id, { totalEnrollment: val })}
                className="text-2xl font-semibold"
              />
            </div>
            <div className="text-sm text-gray-500 mt-1">Total Program Enrollment</div>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl font-semibold text-gray-900">
              <EditableNumber
                value={fy.ustFacultyStaff}
                onCommit={(val) => updateFiscalYear(fy.id, { ustFacultyStaff: val })}
                className="text-2xl font-semibold"
              />
            </div>
            <div className="text-sm text-gray-500 mt-1">UST Faculty/Staff Receiving Benefits</div>
          </div>
        </div>

        {/* Per-term enrollment breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 px-4 font-medium">Term</th>
                <th className="py-2 px-4 font-medium text-right">MAIL (Tuition)</th>
                <th className="py-2 px-4 font-medium text-right">MAIL (Benefits)</th>
                <th className="py-2 px-4 font-medium text-right">Non-Degree</th>
                <th className="py-2 px-4 font-medium text-right">Elective Seekers</th>
                <th className="py-2 px-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {enrollment
                .filter((e) => e.fiscalYear === fy.fiscalYear)
                .map((entry) => {
                  const total = entry.tuitionPaying + entry.onBenefits + entry.nonDegree + entry.electiveSeekers;
                  return (
                    <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-1.5 px-4 text-gray-700">{entry.term}</td>
                      <td className="py-1.5 px-4 text-right">
                        <EditableNumber
                          value={entry.tuitionPaying}
                          onCommit={(val) => updateEntry(entry.id, { tuitionPaying: val })}
                          className="text-right"
                        />
                      </td>
                      <td className="py-1.5 px-4 text-right">
                        <EditableNumber
                          value={entry.onBenefits}
                          onCommit={(val) => updateEntry(entry.id, { onBenefits: val })}
                          className="text-right"
                        />
                      </td>
                      <td className="py-1.5 px-4 text-right">
                        <EditableNumber
                          value={entry.nonDegree}
                          onCommit={(val) => updateEntry(entry.id, { nonDegree: val })}
                          className="text-right"
                        />
                      </td>
                      <td className="py-1.5 px-4 text-right">
                        <EditableNumber
                          value={entry.electiveSeekers}
                          onCommit={(val) => updateEntry(entry.id, { electiveSeekers: val })}
                          className="text-right"
                        />
                      </td>
                      <td className="py-1.5 px-4 text-right font-medium text-gray-900">
                        {total}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              {(() => {
                const fyEntries = enrollment.filter((e) => e.fiscalYear === fy.fiscalYear);
                const totals = {
                  tuition: fyEntries.reduce((s, e) => s + e.tuitionPaying, 0),
                  benefits: fyEntries.reduce((s, e) => s + e.onBenefits, 0),
                  nonDegree: fyEntries.reduce((s, e) => s + e.nonDegree, 0),
                  elective: fyEntries.reduce((s, e) => s + e.electiveSeekers, 0),
                };
                const grandTotal = totals.tuition + totals.benefits + totals.nonDegree + totals.elective;
                return (
                  <tr className="border-t-2 border-gray-200 font-medium text-gray-900">
                    <td className="py-2 px-4">Total</td>
                    <td className="py-2 px-4 text-right">{totals.tuition}</td>
                    <td className="py-2 px-4 text-right">{totals.benefits}</td>
                    <td className="py-2 px-4 text-right">{totals.nonDegree}</td>
                    <td className="py-2 px-4 text-right">{totals.elective}</td>
                    <td className="py-2 px-4 text-right">{grandTotal}</td>
                  </tr>
                );
              })()}
            </tfoot>
          </table>
        </div>
      </section>

      {/* Scholarships */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-700">Scholarships</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Allotted:</span>
            <EditableNumber
              value={fy.scholarshipAllotted}
              onCommit={(val) => updateFiscalYear(fy.id, { scholarshipAllotted: val })}
              format="currency"
              className="font-medium"
            />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <ScholarshipSection
            fy={fy}
            scholarships={allScholarships.filter((s) => s.fiscalYear === fy.fiscalYear)}
            addScholarship={() => addScholarship(fy.fiscalYear)}
            updateScholarship={updateScholarship}
            deleteScholarship={deleteScholarship}
            continueScholarship={continueScholarship}
          />
        </div>
      </section>

      {/* Discretionary */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-700">Discretionary</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Budget:</span>
            <EditableNumber
              value={fy.discretionary}
              onCommit={(val) => updateFiscalYear(fy.id, { discretionary: val })}
              format="currency"
              className="font-medium"
            />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          {/* Summary */}
          {(() => {
            const fyExpenses = allExpenses.filter((e) => e.fiscalYear === fy.fiscalYear);
            const spent = fyExpenses.reduce((sum, e) => sum + e.amount, 0);
            const remaining = fy.discretionary - spent;
            return (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500">Budget</div>
                    <div className="text-lg font-semibold text-gray-900">{formatCurrency(fy.discretionary)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500">Spent</div>
                    <div className="text-lg font-semibold text-gray-900">{formatCurrency(spent)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500">Remaining</div>
                    <div className={`text-lg font-semibold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(remaining)}
                    </div>
                  </div>
                </div>

                {fy.discretionary > 0 && (
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${remaining >= 0 ? "bg-blue-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min((spent / fy.discretionary) * 100, 100)}%` }}
                    />
                  </div>
                )}

                {/* Expense table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="py-2 pr-2 font-medium">Description</th>
                        <th className="py-2 pr-2 font-medium text-right">Amount</th>
                        <th className="py-2 pr-2 font-medium">Notes</th>
                        <th className="py-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fyExpenses.map((exp) => (
                        <tr key={exp.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-1.5 pr-2">
                            <EditableText
                              value={exp.description}
                              onCommit={(val) => updateExpense(exp.id, { description: val })}
                              placeholder="Description"
                            />
                          </td>
                          <td className="py-1.5 pr-2 text-right">
                            <EditableNumber
                              value={exp.amount}
                              onCommit={(val) => updateExpense(exp.id, { amount: val })}
                              format="currency"
                              className="text-right"
                            />
                          </td>
                          <td className="py-1.5 pr-2">
                            <EditableText
                              value={exp.notes}
                              onCommit={(val) => updateExpense(exp.id, { notes: val })}
                              placeholder="Notes"
                            />
                          </td>
                          <td className="py-1.5">
                            <button
                              onClick={() => deleteExpense(exp.id)}
                              className="text-gray-300 hover:text-red-500 text-xs"
                              title="Delete"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {fyExpenses.length > 0 && (
                      <tfoot>
                        <tr className="border-t-2 border-gray-200">
                          <td className="py-2 font-medium text-gray-900">Total Spent</td>
                          <td className="py-2 text-right font-semibold text-gray-900">{formatCurrency(spent)}</td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                <button
                  onClick={() => addExpense(fy.fiscalYear)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add expense
                </button>
              </>
            );
          })()}
        </div>
      </section>

      {/* Notes */}
      <section>
        <h3 className="font-medium text-gray-700 mb-2">Notes</h3>
        <EditableText
          value={fy.notes}
          onCommit={(val) => updateFiscalYear(fy.id, { notes: val })}
          placeholder="Add notes for this fiscal year..."
          className="text-sm text-gray-600 w-full"
        />
      </section>
    </div>
  );
}
