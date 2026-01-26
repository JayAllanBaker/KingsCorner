export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export function triggerHaptic(_style: HapticStyle = 'light'): void {
  // Note: Web Vibration API is not supported on iOS Safari
  // This is a placeholder for future native app integration via Capacitor/React Native
  // For PWA on iOS, haptic feedback requires native app wrapper
}

export function hapticFeedback(): void {
  triggerHaptic('light');
}

export function hapticSuccess(): void {
  triggerHaptic('success');
}

export function hapticError(): void {
  triggerHaptic('error');
}

export function hapticSelection(): void {
  triggerHaptic('selection');
}
