// ── UI mixins dùng chung cho các trang/component ─────────────────────
// Gom logic lặp lại giữa Words.vue, Categories.vue, WordForm.vue

// Phân trang client-side (dùng chung Words.vue & Categories.vue).
// Component sử dụng cần khai báo:
//   - computed `paginationItems`: mảng dữ liệu nguồn cần phân trang
//   - computed `paginationLabel`: nhãn hiển thị trong summary (vd: 'words')
export const paginationMixin = {
  data() {
    return {
      currentPage: 1, // trang hiện tại
      pageSize: 8     // số dòng mỗi trang
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.paginationItems.length / this.pageSize) || 1;
    },
    visibleItems() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.paginationItems.slice(start, start + this.pageSize);
    },
    paginationSummary() {
      const total = this.paginationItems.length;
      if (total === 0) return `0 ${this.paginationLabel}`;
      const start = (this.currentPage - 1) * this.pageSize + 1;
      const end = Math.min(start + this.pageSize - 1, total);
      return `Showing ${start}–${end} of ${total} ${this.paginationLabel}`;
    }
  },
  watch: {
    // Dữ liệu nguồn thay đổi làm giảm số trang → lùi về trang cuối hợp lệ
    totalPages(newTotal) {
      if (this.currentPage > newTotal) {
        this.currentPage = newTotal;
      }
    }
  },
  methods: {
    resetPage() {
      this.currentPage = 1;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    goToPage(page) {
      this.currentPage = page;
    }
  }
};

// Focus vào input/select theo ref (dùng chung WordForm.vue, Words.vue, Categories.vue)
export const focusFieldMixin = {
  methods: {
    focusField(refName) {
      this.$nextTick(() => {
        if (this.$refs[refName]) {
          this.$refs[refName].focus();
        }
      });
    }
  }
};
