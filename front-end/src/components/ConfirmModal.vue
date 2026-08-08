<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="custom-modal-backdrop" @click.self="onCancel">
      <div class="custom-modal-card" role="dialog" aria-modal="true">
        <div class="custom-modal-header">
          <div class="custom-modal-icon">
            <i :class="icon"></i>
          </div>
          <h3 class="custom-modal-title">{{ title }}</h3>
        </div>

        <div class="custom-modal-body">
          <p>{{ message }}</p>
        </div>

        <div class="custom-modal-footer">
          <button type="button" class="ui basic button cancel-btn" @click="onCancel">
            {{ cancelText }}
          </button>
          <button type="button" class="ui negative button confirm-btn" @click="onConfirm">
            <i class="trash icon"></i> {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirm Delete'
    },
    message: {
      type: String,
      default: 'Are you sure you want to delete this item? This action cannot be undone.'
    },
    confirmText: {
      type: String,
      default: 'Delete'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    icon: {
      type: String,
      default: 'trash icon'
    }
  },
  methods: {
    onConfirm() {
      this.$emit('confirm');
    },
    onCancel() {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
}

.custom-modal-card {
  width: 100%;
  max-width: 410px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
  padding: 1.5rem;
  transform: scale(1);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  animation: cardPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes cardPop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.custom-modal-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 0.85rem;
}

.custom-modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #fef2f2;
  color: #ef4444;
  font-size: 1.1rem;
  flex: 0 0 auto;
}

.custom-modal-icon .icon {
  margin: 0 !important;
}

.custom-modal-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.custom-modal-body {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.custom-modal-body p {
  margin: 0;
}

.custom-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
}

.custom-modal-footer .ui.button {
  margin: 0 !important;
  font-size: 0.88rem !important;
  padding: 0.65rem 1.1rem !important;
  border-radius: 7px !important;
  font-weight: 600 !important;
}

.cancel-btn {
  color: #475569 !important;
  border-color: #cbd5e1 !important;
}

.cancel-btn:hover {
  background: #f8fafc !important;
  color: #1e293b !important;
}

.confirm-btn {
  background: #ef4444 !important;
}

.confirm-btn:hover {
  background: #dc2626 !important;
}

/* Modal Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
