import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import keywordApi from '../../../features/keywords/api/keywordApi';
export default function SearchableKeywordInput({
  keywords = [],
  onAddKeyword,
  onRemoveKeyword,
  placeholder,
  disabled = false,
  debounceTime = 300
}) {
  const {
    t
  } = useTranslation();
  const resolvedPlaceholder = placeholder || t("common.chonTuKhoa");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef(null);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!isOpen) return;
    const fetchSuggestions = async () => {
      const val = searchTerm.trim();
      setIsSearching(true);
      try {
        const res = await keywordApi.getKeywords({
          search: val,
          limit: 20
        });
        const items = res?.data?.data?.items || res?.data?.data || [];
        setSuggestions(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error(t("common.loiLayDanhSachKeyword"), err);
      } finally {
        setIsSearching(false);
      }
    };
    const timeoutId = setTimeout(fetchSuggestions, debounceTime);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, isOpen, debounceTime]);
  const handleSelect = kwName => {
    if (kwName && onAddKeyword) {
      onAddKeyword(kwName);
    }
    setSearchTerm('');
    setIsOpen(false);
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = searchTerm.trim();
      if (val) {
        handleSelect(val);
      }
    }
  };

  // Filter out already selected keywords from suggestions
  const filteredSuggestions = suggestions.filter(s => !keywords.includes(s.display_name || s.name));
  const showCreateOption = searchTerm.trim().length > 0 && !suggestions.find(s => (s.display_name || s.name).toLowerCase() === searchTerm.trim().toLowerCase()) && !keywords.includes(searchTerm.trim());
  return <div className="position-relative" ref={wrapperRef}>
      {/* Main control - looks like SearchableSelect */}
      <div className={`form-control form-control-lg d-flex flex-wrap align-items-center gap-2 ${disabled ? 'bg-light text-muted' : ''}`} style={{
      cursor: disabled ? 'not-allowed' : 'pointer',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-main)',
      borderColor: 'var(--border)',
      minHeight: '50px'
    }} onClick={() => !disabled && setIsOpen(!isOpen)}>
        {/* Render keyword badges */}
        {keywords.map(kw => <span key={kw} className="badge rounded-pill d-flex align-items-center gap-1 px-2 py-1 fw-normal" style={{
        backgroundColor: 'var(--bg-section)',
        color: 'var(--text-main)',
        border: '1px solid var(--border)',
        fontSize: '0.85rem'
      }}>
            {kw}
            <Icon icon="lucide:x" width="14" className="cursor-pointer hover-danger" onClick={e => {
          e.stopPropagation();
          onRemoveKeyword?.(kw);
        }} />
          </span>)}

        {/* Placeholder text */}
        {keywords.length === 0 && <span style={{
        color: 'var(--text-muted)'
      }}>{resolvedPlaceholder}</span>}

        {/* Right side indicators */}
        <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
          {isSearching && <span className="spinner-border spinner-border-sm text-primary" role="status"></span>}
          <Icon icon="lucide:chevron-down" width="18" className="text-muted" />
        </div>
      </div>

      {/* Dropdown panel */}
      {isOpen && <div className="position-absolute w-100 bg-white border rounded-3 shadow mt-1 z-3" style={{
      maxHeight: '350px',
      display: 'flex',
      flexDirection: 'column'
    }}>
          {/* Search input inside dropdown */}
          <div className="p-2 border-bottom">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-transparent border-end-0">
                <Icon icon="lucide:search" width="14" className="text-muted" />
              </span>
              <input type="text" className="form-control border-start-0 ps-0 shadow-none" placeholder={t("common.timKiemTuKhoa")} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={handleKeyDown} onClick={e => e.stopPropagation()} autoFocus />
            </div>
          </div>

          {/* Results list */}
          <div className="overflow-auto py-1" style={{
        maxHeight: '280px'
      }}>
            {isSearching ? <div className="p-3 text-center text-muted small">{t("common.dangTimKiem")}</div> : filteredSuggestions.length === 0 && !showCreateOption ? <div className="p-3 text-center text-muted small">
                {searchTerm.trim() ? t("common.khongTimThayTuKhoaPhuHop") : t("common.nhapTuKhoaDeTimKiem")}
              </div> : <>
                {filteredSuggestions.map(kwObj => {
            const name = kwObj.display_name || kwObj.name;
            return <div key={kwObj.id || kwObj.keyword_id || name} className="dropdown-item px-3 py-2 d-flex align-items-center gap-2 cursor-pointer text-dark" onClick={() => handleSelect(name)}>
                      <Icon icon="lucide:hash" width="14" className="text-muted flex-shrink-0" />
                      <span className="text-truncate">{name}</span>
                    </div>;
          })}
                {showCreateOption && <div className="dropdown-item px-3 py-2 border-top text-primary fw-medium cursor-pointer bg-light d-flex align-items-center gap-2" onClick={() => handleSelect(searchTerm.trim())}>
                    <Icon icon="lucide:plus" width="14" />{t("common.taoTuKhoaMoi")}{searchTerm.trim()}"
                  </div>}
              </>}
          </div>
        </div>}
    </div>;
}