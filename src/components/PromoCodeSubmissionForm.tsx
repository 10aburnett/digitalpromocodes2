'use client';

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useSearchParams } from 'next/navigation';

interface DealSearchResult {
  id: string;
  name: string;
  slug: string;
}

interface PromoCodeSubmissionFormProps {
  preselectedOfferId?: string;
  preselectedOfferName?: string;
  onClose?: () => void;
  onSuccess?: () => void;
  inline?: boolean; // When true, renders as inline form instead of modal
}

export default function PromoCodeSubmissionForm({
  preselectedOfferId,
  preselectedOfferName,
  onClose,
  onSuccess,
  inline = false,
}: PromoCodeSubmissionFormProps) {
  // Read product name and slug from URL query params (for linking from offer pages)
  const searchParams = useSearchParams();
  const productFromUrl = searchParams.get('product');
  const slugFromUrl = searchParams.get('slug');

  // Use URL param as fallback if no prop is passed
  const effectivePreselectedName = preselectedOfferName || productFromUrl || '';

  // Track if we've already fetched the preselected deal
  const hasFetchedPreselection = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState<DealSearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchController = useRef<AbortController | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Scroll to success message when it appears (for inline mode)
  useEffect(() => {
    if (showSuccessMessage && inline && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showSuccessMessage, inline]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    value: '',
    submitterName: '',
    submitterEmail: '',
    submitterMessage: '',
    isGeneral: !preselectedOfferId && !slugFromUrl,
    offerId: preselectedOfferId || '',
    customCourseName: '',
    isNewCourse: false,
  });

  useEffect(() => {
    if (effectivePreselectedName && !searchTerm) {
      setSearchTerm(effectivePreselectedName);
      setDebouncedSearchTerm(effectivePreselectedName);
    }
  }, [effectivePreselectedName]);

  // Auto-fetch and select deal when slug is provided via URL
  useEffect(() => {
    if (slugFromUrl && !hasFetchedPreselection.current) {
      hasFetchedPreselection.current = true;

      fetch(`/api/whops/${encodeURIComponent(slugFromUrl)}`)
        .then(res => res.ok ? res.json() : null)
        .then(deal => {
          if (deal && deal.id && deal.name) {
            // Auto-select this deal
            setFormData(prev => ({
              ...prev,
              offerId: deal.id,
              isGeneral: false,
              isNewCourse: false,
              customCourseName: '',
            }));
            setSearchTerm(deal.name);
            setSearchResults([{ id: deal.id, name: deal.name, slug: deal.slug }]);
          }
        })
        .catch(err => console.error('Failed to fetch preselected deal:', err));
    }
  }, [slugFromUrl]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 100);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchWhops = useCallback(async (query: string) => {
    if (searchController.current) {
      searchController.current.abort();
    }

    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    searchController.current = controller;
    setIsSearching(true);

    try {
      const response = await fetch(
        `/api/whops/search?q=${encodeURIComponent(query)}&limit=20`,
        { signal: controller.signal }
      );

      if (response.ok && !controller.signal.aborted) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error searching products:', error);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, []);

  useEffect(() => {
    if (showDropdown) {
      searchWhops(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, showDropdown, searchWhops]);

  const selectedProductName = useMemo(() => {
    if (formData.isNewCourse) return formData.customCourseName;
    const selectedOffer = searchResults.find((w) => w.id === formData.offerId);
    return selectedOffer?.name || '';
  }, [searchResults, formData.offerId, formData.isNewCourse, formData.customCourseName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.title || !formData.description || !formData.submitterName || !formData.submitterEmail) {
      alert('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.code.trim() || !formData.value.trim()) {
      alert('Please provide both a promo code and discount value.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.isGeneral && !formData.offerId && !formData.isNewCourse) {
      alert('Please select a product or mark it as new.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.isGeneral && formData.isNewCourse && !formData.customCourseName.trim()) {
      alert('Please enter the product name.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/promo-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          offerId: formData.isGeneral ? null : formData.isNewCourse ? null : formData.offerId,
          customCourseName: formData.isNewCourse ? formData.customCourseName : null,
        }),
      });

      if (response.ok) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setFormData({
            title: '',
            description: '',
            code: '',
            value: '',
            submitterName: '',
            submitterEmail: '',
            submitterMessage: '',
            isGeneral: !preselectedOfferId,
            offerId: preselectedOfferId || '',
            customCourseName: '',
            isNewCourse: false,
          });
          setSearchTerm('');
          setShowSuccessMessage(false);
          onSuccess?.();
        }, 10000);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductSelect = useCallback((whop: DealSearchResult) => {
    setFormData((prev) => ({
      ...prev,
      offerId: whop.id,
      isNewCourse: false,
      customCourseName: '',
    }));
    setSearchTerm(whop.name);
    setShowDropdown(false);
    setSearchResults((prev) => {
      const exists = prev.find((w) => w.id === whop.id);
      return exists ? prev : [whop, ...prev];
    });
  }, []);

  const handleNewProduct = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      isNewCourse: true,
      offerId: '',
      customCourseName: searchTerm,
    }));
    setShowDropdown(false);
  }, [searchTerm]);

  useEffect(() => {
    return () => {
      if (searchController.current) {
        searchController.current.abort();
      }
    };
  }, []);

  const handleCloseSuccess = () => {
    setShowSuccessMessage(false);
    onSuccess?.();
  };

  // Success Modal/Message
  if (showSuccessMessage) {
    const successContent = (
      <div
        ref={inline ? successRef : undefined}
        className={`relative w-full max-w-sm p-8 text-center shadow-lg rounded-2xl ${inline ? 'mx-auto' : ''}`}
        style={{ backgroundColor: 'var(--background-color)', border: inline ? '1px solid var(--border-color)' : 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        {!inline && (
          <button
            onClick={handleCloseSuccess}
            className="absolute top-3 right-3 p-1 hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="mb-6">
          <svg
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: 'var(--accent-color)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
            You're a legend
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            We'll review your submission and add it if it checks out. Thanks for helping the community save.
          </p>
        </div>

        <button
          onClick={handleCloseSuccess}
          className="px-6 py-2 text-sm font-medium rounded-md"
          style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
        >
          {inline ? 'Submit Another' : 'Done'}
        </button>
      </div>
    );

    if (inline) {
      return successContent;
    }

    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
        role="dialog"
        aria-modal="true"
      >
        {successContent}
      </div>
    );
  }

  // Main Form
  const formContent = (
    <div
      className={`relative w-full max-w-xl ${inline ? 'mx-auto' : 'max-h-[90vh] overflow-y-auto'} shadow-lg rounded-2xl`}
      style={{ backgroundColor: 'var(--background-color)', border: inline ? '1px solid var(--border-color)' : 'none' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with close button */}
      {!inline && (
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>
              Got a discount to share?
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Help the community save money
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:opacity-70 rounded-full"
              style={{ color: 'var(--text-muted)', backgroundColor: 'var(--background-secondary)' }}
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

        {/* Form Body */}
        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* SECTION 1: About You (moved to top) */}
            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                About you
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.submitterName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, submitterName: e.target.value }))}
                    placeholder="Your name"
                    className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-color)',
                      backgroundColor: 'var(--background-color)',
                      '--tw-ring-color': 'var(--accent-color)'
                    } as React.CSSProperties}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.submitterEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, submitterEmail: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-color)',
                      backgroundColor: 'var(--background-color)',
                      '--tw-ring-color': 'var(--accent-color)'
                    } as React.CSSProperties}
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Code Type Toggle */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                Code type
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, isGeneral: false }))}
                  className="flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors"
                  style={{
                    backgroundColor: !formData.isGeneral ? 'var(--accent-color)' : 'transparent',
                    color: !formData.isGeneral ? 'white' : 'var(--text-secondary)',
                    borderColor: !formData.isGeneral ? 'var(--accent-color)' : 'var(--border-color)'
                  }}
                >
                  Specific product
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, isGeneral: true, offerId: '', isNewCourse: false, customCourseName: '' }))}
                  className="flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors"
                  style={{
                    backgroundColor: formData.isGeneral ? 'var(--accent-color)' : 'transparent',
                    color: formData.isGeneral ? 'white' : 'var(--text-secondary)',
                    borderColor: formData.isGeneral ? 'var(--accent-color)' : 'var(--border-color)'
                  }}
                >
                  Works anywhere
                </button>
              </div>
            </div>

            {/* SECTION 3: Product Search (conditional) */}
            {!formData.isGeneral && (
              <div className="relative">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Which product?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                      setFormData((prev) => ({ ...prev, offerId: '', isNewCourse: false, customCourseName: '' }));
                    }}
                    onFocus={() => {
                      setShowDropdown(true);
                      if (searchTerm.length >= 2) searchWhops(searchTerm);
                    }}
                    placeholder="Search for a product..."
                    className="w-full px-3 py-2 pr-10 text-sm rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-color)',
                      backgroundColor: 'var(--background-color)',
                      '--tw-ring-color': 'var(--accent-color)'
                    } as React.CSSProperties}
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isSearching ? (
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-color)' }} />
                    ) : (
                      <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Dropdown */}
                {showDropdown && (
                  <>
                    <div
                      className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto shadow-lg rounded-lg"
                      style={{ backgroundColor: 'var(--background-color)', border: '1px solid var(--border-color)' }}
                    >
                      {searchTerm.length < 2 && (
                        <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          Type at least 2 characters...
                        </div>
                      )}

                      {!isSearching && searchTerm.length >= 2 && searchResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleProductSelect(item)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--background-secondary)] transition-colors"
                          style={{ color: 'var(--text-color)' }}
                        >
                          {item.name}
                        </button>
                      ))}

                      {searchTerm.length > 2 && (
                        <button
                          type="button"
                          onClick={handleNewProduct}
                          className="w-full px-3 py-2 text-left text-sm border-t transition-colors"
                          style={{ color: 'var(--accent-color)', borderColor: 'var(--border-color)' }}
                        >
                          + Add "{searchTerm}" as new
                        </button>
                      )}
                    </div>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                  </>
                )}

                {(selectedProductName || formData.isNewCourse) && (
                  <div className="mt-2 text-xs font-medium" style={{ color: 'var(--accent-color)' }}>
                    ✓ {formData.isNewCourse ? formData.customCourseName : selectedProductName}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 4: The Code Details */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Discount details
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Promo code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                    placeholder="SAVE20"
                    className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 font-mono"
                    style={{
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-color)',
                      backgroundColor: 'var(--background-color)',
                      '--tw-ring-color': 'var(--accent-color)'
                    } as React.CSSProperties}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Discount amount
                  </label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                    placeholder="20% off"
                    className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-color)',
                      backgroundColor: 'var(--background-color)',
                      '--tw-ring-color': 'var(--accent-color)'
                    } as React.CSSProperties}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Short description
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Holiday sale - 20% off first month"
                  className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-color)',
                    backgroundColor: 'var(--background-color)',
                    '--tw-ring-color': 'var(--accent-color)'
                  } as React.CSSProperties}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Any conditions or notes?
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="New customers only, expires end of month, etc."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 resize-none"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-color)',
                    backgroundColor: 'var(--background-color)',
                    '--tw-ring-color': 'var(--accent-color)'
                  } as React.CSSProperties}
                  required
                />
              </div>
            </div>

            {/* SECTION 5: Extra notes (optional) */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Want to tell us anything else? <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
              </label>
              <textarea
                value={formData.submitterMessage}
                onChange={(e) => setFormData((prev) => ({ ...prev, submitterMessage: e.target.value }))}
                placeholder="Where you found the code, how long it's valid, etc."
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 resize-none"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  backgroundColor: 'var(--background-color)',
                  '--tw-ring-color': 'var(--accent-color)'
                } as React.CSSProperties}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                We check all submissions before publishing
              </p>
              <div className="flex gap-3">
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-lg"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold rounded-md disabled:opacity-50 transition-all hover:brightness-105"
                  style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
                >
                  {isSubmitting ? 'Sending...' : 'Send it in'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
  );

  // Return inline version or modal wrapper
  if (inline) {
    return formContent;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
      role="dialog"
      aria-modal="true"
      onClick={() => onClose?.()}
    >
      {formContent}
    </div>
  );
}
