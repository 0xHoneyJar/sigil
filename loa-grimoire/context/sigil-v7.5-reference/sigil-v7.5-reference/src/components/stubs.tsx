// Stub components for reference implementation
// In a real project, these would be full implementations

// ConfirmDialog
export interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  variant?: 'default' | 'danger';
}
export const ConfirmDialog: React.FC<ConfirmDialogProps> = () => null;

// LoadingSpinner
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = () => null;

// Tooltip
export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}
export const Tooltip: React.FC<TooltipProps> = () => null;

// Modal
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
export const Modal: React.FC<ModalProps> = () => null;

// Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export const Input: React.FC<InputProps> = () => null;

// Select
export interface SelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}
export const Select: React.FC<SelectProps> = () => null;

// Tabs
export interface TabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultTab?: string;
}
export const Tabs: React.FC<TabsProps> = () => null;

// ExperimentalNav
export interface ExperimentalNavProps {
  items: { href: string; label: string }[];
}
export const ExperimentalNav: React.FC<ExperimentalNavProps> = () => null;

// GlassCard
export interface GlassCardProps {
  children: React.ReactNode;
  blur?: number;
}
export const GlassCard: React.FC<GlassCardProps> = () => null;

// AnimatedCounter
export interface AnimatedCounterProps {
  value: number;
  duration?: number;
}
export const AnimatedCounter: React.FC<AnimatedCounterProps> = () => null;
