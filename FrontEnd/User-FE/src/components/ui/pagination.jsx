import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import PropTypes from "prop-types";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Kiểm tra nếu chỉ có 1 trang, không hiển thị phân trang
  if (totalPages <= 1) return null;

  // Tính các trang cần hiển thị (tối đa 5 nút trang, với trang hiện tại ở giữa)
  const getPageNumbers = () => {
    // Nếu có ít hơn hoặc bằng 5 trang, hiển thị tất cả
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    // Hiển thị 5 trang với trang hiện tại ở giữa
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + 4);

    // Điều chỉnh nếu ở gần cuối
    if (endPage - startPage < 4) {
      startPage = Math.max(0, endPage - 4);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-1">
      {/* Nút Trước */}
      <button
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        className={`w-9 h-9 flex items-center justify-center rounded-md ${
          currentPage === 0
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        aria-label="Trang trước"
      >
        <FaChevronLeft size={14} />
      </button>

      {/* Nút trang đầu (nếu có khoảng cách) */}
      {pageNumbers[0] > 0 && (
        <>
          <button
            onClick={() => onPageChange(0)}
            className="w-9 h-9 flex items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
          >
            1
          </button>
          {pageNumbers[0] > 1 && (
            <span className="w-9 h-9 flex items-center justify-center text-gray-500">
              ...
            </span>
          )}
        </>
      )}

      {/* Các nút trang */}
      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`w-9 h-9 flex items-center justify-center rounded-md ${
            currentPage === pageNumber
              ? "bg-green-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {pageNumber + 1}
        </button>
      ))}

      {/* Nút trang cuối (nếu có khoảng cách) */}
      {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
            <span className="w-9 h-9 flex items-center justify-center text-gray-500">
              ...
            </span>
          )}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            className="w-9 h-9 flex items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Nút Sau */}
      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage === totalPages - 1}
        className={`w-9 h-9 flex items-center justify-center rounded-md ${
          currentPage === totalPages - 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        aria-label="Trang sau"
      >
        <FaChevronRight size={14} />
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

function PaginationContent({ className, ...props }) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLink({ className, isActive, size = "icon", ...props }) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({ className, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({ className, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
