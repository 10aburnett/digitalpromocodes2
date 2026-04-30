"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface PromoCode {
  id: string;
  title: string;
  description: string;
  code: string | null;
  type: string;
  value: string;
  displayOrder: number;
  createdAt: string;
}

interface Course {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  PromoCode: PromoCode[];
}

const PROMO_TYPES = [
  { value: "DISCOUNT", label: "Discount" },
  { value: "FREE_TRIAL", label: "Free Trial" },
  { value: "EXCLUSIVE_ACCESS", label: "Exclusive Access" },
  { value: "BUNDLE_DEAL", label: "Bundle Deal" },
  { value: "LIMITED_TIME", label: "Limited Time" },
];

export default function PromoManagementPage() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Selected course state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(false);

  // Add promo form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formType, setFormType] = useState("DISCOUNT");
  const [formValue, setFormValue] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Reorder state
  const [reordering, setReordering] = useState(false);

  // Feedback
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/whops?search=${encodeURIComponent(query.trim())}&limit=10`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Search failed");
        const json = await res.json();
        const courses: Course[] = (json.data || []).map((item: any) => ({
          id: item.whopId || item.id,
          name: item.whopName || item.name,
          slug: item.slug,
          logo: item.logo,
          PromoCode: item.promoCodes || [],
        }));
        setSearchResults(courses);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  // Select a course and load its full promo codes
  const selectCourse = async (course: Course) => {
    setShowDropdown(false);
    setSearchQuery(course.name);
    setLoadingCourse(true);
    setSelectedCourse(null);
    setShowAddForm(false);
    resetForm();

    try {
      const res = await fetch(`/api/whops/${encodeURIComponent(course.slug)}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load course");
      const data = await res.json();
      setSelectedCourse({
        id: data.id,
        name: data.name,
        slug: data.slug,
        logo: data.logo,
        PromoCode: data.PromoCode || [],
      });
    } catch {
      showToast("Failed to load course details", "err");
    } finally {
      setLoadingCourse(false);
    }
  };

  // Add a new promo code
  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    if (!formTitle.trim() || !formValue.trim()) {
      showToast("Title and Value are required", "err");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          whopId: selectedCourse.id,
          title: formTitle.trim(),
          code: formCode.trim() || null,
          type: formType,
          value: formValue.trim(),
          description: formDescription.trim() || formTitle.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create promo code");
      }

      const { promoCode } = await res.json();

      setSelectedCourse((prev) =>
        prev
          ? { ...prev, PromoCode: [promoCode, ...prev.PromoCode] }
          : prev
      );

      resetForm();
      setShowAddForm(false);
      showToast(`Promo code "${promoCode.title}" added successfully`, "ok");
    } catch (err: any) {
      showToast(err.message || "Failed to add promo code", "err");
    } finally {
      setSaving(false);
    }
  };

  // Delete a promo code
  const handleDelete = async (promoId: string, promoTitle: string) => {
    if (!confirm(`Delete promo code "${promoTitle}"? This cannot be undone.`)) return;

    setDeleting(promoId);
    try {
      const res = await fetch(`/api/admin/promos/${promoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }

      setSelectedCourse((prev) =>
        prev
          ? { ...prev, PromoCode: prev.PromoCode.filter((p) => p.id !== promoId) }
          : prev
      );

      showToast(`Deleted "${promoTitle}"`, "ok");
    } catch (err: any) {
      showToast(err.message || "Failed to delete promo code", "err");
    } finally {
      setDeleting(null);
    }
  };

  // Move a promo code up or down
  const movePromo = async (index: number, direction: "up" | "down") => {
    if (!selectedCourse) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedCourse.PromoCode.length) return;

    const reordered = Array.from(selectedCourse.PromoCode);
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    // Optimistic update
    setSelectedCourse({ ...selectedCourse, PromoCode: reordered });

    // Persist to server
    setReordering(true);
    try {
      const res = await fetch("/api/admin/promos/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderedIds: reordered.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error("Failed to save order");
    } catch {
      // Revert on failure
      setSelectedCourse(selectedCourse);
      showToast("Failed to save order", "err");
    } finally {
      setReordering(false);
    }
  };

  function resetForm() {
    setFormTitle("");
    setFormCode("");
    setFormType("DISCOUNT");
    setFormValue("");
    setFormDescription("");
  }

  function showToast(msg: string, kind: "ok" | "err") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  }

  const typeLabel = (type: string) =>
    PROMO_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg text-sm font-medium ${
            toast.kind === "ok"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Manage Promo Codes</h1>
          <p className="text-gray-400">
            Search for a course, view its promo codes, and add or remove codes.
            Use the arrows to reorder.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search for a course
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder="Type a course name..."
              className="w-full px-4 py-3 bg-[#2c2f3a] border border-[#404055] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-gray-500 border-t-blue-400 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-40 w-full mt-1 bg-[#2c2f3a] border border-[#404055] rounded-lg shadow-xl max-h-72 overflow-y-auto">
              {searchResults.map((course) => (
                <button
                  key={course.id}
                  onClick={() => selectCourse(course)}
                  className="w-full text-left px-4 py-3 hover:bg-[#3a3d4a] transition-colors flex items-center gap-3 border-b border-[#404055] last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{course.name}</p>
                    <p className="text-gray-500 text-xs truncate">{course.slug}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {course.PromoCode.length} promo{course.PromoCode.length !== 1 ? "s" : ""}
                  </span>
                </button>
              ))}
            </div>
          )}

          {showDropdown && searchQuery.trim().length >= 2 && searchResults.length === 0 && !searching && (
            <div className="absolute z-40 w-full mt-1 bg-[#2c2f3a] border border-[#404055] rounded-lg shadow-xl p-4">
              <p className="text-gray-400 text-sm text-center">No courses found</p>
            </div>
          )}
        </div>

        {/* Loading */}
        {loadingCourse && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-500 border-t-blue-400 rounded-full animate-spin" />
          </div>
        )}

        {/* Selected Course */}
        {selectedCourse && !loadingCourse && (
          <div className="space-y-6">
            {/* Course Header */}
            <div className="bg-[#2c2f3a] border border-[#404055] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCourse.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Slug: {selectedCourse.slug} &middot; ID: {selectedCourse.id.slice(0, 8)}...
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm((v) => !v)}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Promo Code
                </button>
              </div>
            </div>

            {/* Add Promo Form */}
            {showAddForm && (
              <form
                onSubmit={handleAddPromo}
                className="bg-[#2c2f3a] border-2 border-green-600/40 rounded-lg p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold text-white mb-2">New Promo Code</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. 50% Off First Month"
                      className="w-full px-3 py-2 bg-[#1e1f2a] border border-[#404055] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Promo Code
                    </label>
                    <input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="e.g. SAVE50 (leave empty if no code)"
                      className="w-full px-3 py-2 bg-[#1e1f2a] border border-[#404055] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1e1f2a] border border-[#404055] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {PROMO_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Value <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value)}
                      placeholder="e.g. 50% off, $10 off, 7-day free trial"
                      className="w-full px-3 py-2 bg-[#1e1f2a] border border-[#404055] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Optional details about this promo..."
                    rows={2}
                    className="w-full px-3 py-2 bg-[#1e1f2a] border border-[#404055] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Add Promo Code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Promo Codes List */}
            <div className="bg-[#2c2f3a] border border-[#404055] rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-[#404055] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Promo Codes ({selectedCourse.PromoCode.length})
                </h3>
                {reordering && (
                  <span className="text-xs text-blue-400 animate-pulse">Saving order...</span>
                )}
              </div>

              {selectedCourse.PromoCode.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No promo codes for this course yet.</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-3 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                  >
                    Add the first one
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#404055]">
                  {selectedCourse.PromoCode.map((promo, index) => (
                    <div
                      key={promo.id}
                      className="px-6 py-4 flex items-center gap-4 hover:bg-[#33354a] transition-colors"
                    >
                      {/* Up/Down buttons */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => movePromo(index, "up")}
                          disabled={index === 0 || reordering}
                          className="p-1 rounded text-gray-500 hover:text-white hover:bg-[#404055] transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => movePromo(index, "down")}
                          disabled={index === selectedCourse.PromoCode.length - 1 || reordering}
                          className="p-1 rounded text-gray-500 hover:text-white hover:bg-[#404055] transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Position number */}
                      <span className="flex-shrink-0 w-6 text-center text-xs text-gray-500 font-mono">
                        {index + 1}
                      </span>

                      {/* Code badge */}
                      <div className="flex-shrink-0 w-28">
                        {promo.code ? (
                          <span className="inline-block px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded font-mono text-blue-300 text-sm truncate max-w-full">
                            {promo.code}
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-gray-600/20 border border-gray-500/30 rounded text-gray-400 text-xs">
                            No code
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{promo.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-purple-600/20 text-purple-300 border border-purple-500/30">
                            {typeLabel(promo.type)}
                          </span>
                          <span className="text-gray-400 text-sm">{promo.value}</span>
                          {promo.id.startsWith("community_") && (
                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-600/20 text-yellow-300 border border-yellow-500/30">
                              Community
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(promo.id, promo.title)}
                        disabled={deleting === promo.id}
                        className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-600/10 transition-colors disabled:opacity-50"
                        title="Delete promo code"
                      >
                        {deleting === promo.id ? (
                          <div className="w-5 h-5 border-2 border-gray-500 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedCourse && !loadingCourse && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500 text-lg">Search for a course above to manage its promo codes</p>
          </div>
        )}
      </div>
    </div>
  );
}
