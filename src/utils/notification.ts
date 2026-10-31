export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return Notification.permission;
  }
}

// Gentle pleasant chime using Web Audio API (calm meditation bell harmonic)
export function playGentleChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Soft fundamental tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(528, now); // 528Hz healing / comfort frequency
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Warm harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(792, now);
    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.7);
    osc2.stop(now + 1.7);
  } catch (e) {
    // Audio might be constrained until user interaction
  }
}

export function showBrowserNotification(
  title: string,
  options?: NotificationOptions
): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notif = new Notification(title, {
      icon: '/src/assets/images/counselor_companion_1793460982682.jpg',
      badge: '/src/assets/images/counselor_companion_1793460982682.jpg',
      ...options,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    playGentleChime();
    return true;
  } catch (e) {
    console.warn('Browser notification failed (e.g. iframe policy):', e);
    return false;
  }
}
