import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

/**
 * Builds a windowed page list around the current page, inserting a single
 * ellipsis placeholder wherever pages were skipped.
 */
const buildPageItems = (
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> => {
  const items: Array<number | "ellipsis"> = [];

  for (let page = 1; page <= totalPages; page += 1) {
    const isEdge = page === 1 || page === totalPages;
    const isNearCurrent = Math.abs(page - currentPage) <= 1;

    if (isEdge || isNearCurrent) {
      items.push(page);
    } else if (items[items.length - 1] !== "ellipsis") {
      items.push("ellipsis");
    }
  }

  return items;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  handlePageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const pageItems = buildPageItems(currentPage, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <nav
      aria-label="صفحه‌بندی"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {/* Previous */}
      <button
        type="button"
        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
        disabled={isFirstPage}
        aria-label="صفحه قبلی"
        className="flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-IRANYekanMedium text-gray-300 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="hidden sm:inline">قبلی</span>
      </button>

      {/* Pages */}
      {pageItems.map((item, index) => {
        if (item === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className="flex h-10 w-8 items-center justify-center text-sm text-gray-600"
            >
              …
            </span>
          );
        }

        const isActive = item === currentPage;

        return (
          <button
            key={item}
            type="button"
            onClick={() => handlePageChange(item)}
            aria-current={isActive ? "page" : undefined}
            className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm transition-all duration-300 active:scale-95 ${
              isActive
                ? "bg-white font-IRANYekanExtraBold text-black shadow-[0_0_22px_rgba(255,255,255,0.3)]"
                : "border border-white/10 bg-white/[0.04] font-IRANYekanMedium text-gray-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {item.toLocaleString("fa-IR")}
          </button>
        );
      })}

      {/* Next */}
      <button
        type="button"
        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
        disabled={isLastPage}
        aria-label="صفحه بعدی"
        className="flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-IRANYekanMedium text-gray-300 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30"
      >
        <span className="hidden sm:inline">بعدی</span>
        <ChevronLeft className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default Pagination;
