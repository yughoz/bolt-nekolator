const MOBILE_USER_AGENT_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

const dataUrlToBlob = async (dataUrl: string): Promise<Blob | null> => {
  try {
    const response = await fetch(dataUrl);
    return await response.blob();
  } catch (error) {
    console.error('Failed to convert data URL to blob:', error);
    return null;
  }
};

export const generateNodeImage = async (
  node: HTMLElement,
  options: {
    backgroundColor?: string;
    pixelRatio?: number;
  } = {}
): Promise<string | null> => {
  try {
    const htmlToImage = await import('html-to-image');
    const dataUrl = await htmlToImage.toPng(node, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      cacheBust: true,
      ...options,
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate image from node:', error);
    return null;
  }
};

export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return MOBILE_USER_AGENT_REGEX.test(navigator.userAgent);
};

export const shareImageViaWebShare = async (
  dataUrl: string,
  filename: string,
  text?: string
): Promise<boolean> => {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  const nav = navigator as Navigator & {
    share?: (data: ShareData) => Promise<void>;
    canShare?: (data: ShareData) => boolean;
  };

  if (typeof nav.share !== 'function') {
    return false;
  }

  const blob = await dataUrlToBlob(dataUrl);
  if (!blob) {
    return false;
  }

  const file = new File([blob], filename, { type: blob.type || 'image/png' });
  if (typeof nav.canShare === 'function' && !nav.canShare({ files: [file] })) {
    return false;
  }

  try {
    await nav.share({
      files: [file],
      title: 'Nekolators Results',
      text,
    });
    return true;
  } catch (error) {
    console.warn('Web Share cancelled or failed:', error);
    return false;
  }
};

export const openWhatsAppShare = (text: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const encoded = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/?text=${encoded}`;
  window.open(whatsappUrl, '_blank');
};

export const downloadImageDataUrl = (dataUrl: string, filename: string): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
