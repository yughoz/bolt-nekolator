import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'id';

type TranslationDictionary = Record<string, string | TranslationDictionary>;

type TranslationOptions = Record<string, string | number>;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: TranslationOptions) => string;
}

const LANGUAGE_STORAGE_KEY = 'nekolators_language';

const translationData: Record<Language, TranslationDictionary> = {
  en: {
    language: {
      english: 'English',
      indonesian: 'Bahasa Indonesia',
    },
    common: {
      appName: 'Nekolators',
      home: 'Home',
      share: 'Share',
      copy: 'Copy',
      download: 'Download',
      details: 'Details',
      close: 'Close',
      goToHome: 'Go to Home',
      saving: 'Saving...',
      update: 'Update',
      save: 'Save',
      backToCalculator: 'Back to Calculator',
      backToExpert: 'Back to Expert Calculator',
      backToBasic: 'Back to Calculator',
      createNewCalculation: 'Create New Calculation',
      sharedCalculation: 'Shared Calculation',
      calculationSummary: 'Calculation Summary',
      discount: 'Discount',
      taxShipping: 'Tax & Shipping',
      totalBeforeAdjustments: 'Total Before Adjustments',
      items: 'Items',
      people: 'People',
      assignments: 'Assignments',
      unassigned: 'Unassigned',
      add: 'Add',
      addItem: 'Add Item',
      addPerson: 'Add Person',
      subtotal: 'Subtotal',
      totalFinal: 'Total Final',
      shareLinkLabel: 'Share link:',
      tipsTitle: 'Tips for best results:',
      language: 'Language',
      englishShort: 'EN',
      indonesianShort: 'ID',
      copyShareLink: 'Share link copied to clipboard!',
      unableToCopy: 'Unable to copy automatically. Copy it manually from the link.',
      clipboardUnavailable: 'Clipboard unavailable. Copy it manually from the link.',
      shareSheetOpened: 'Share sheet opened!',
      whatsappShareOpened: 'WhatsApp share opened. Image downloaded as backup.',
      resultsDownloaded: 'Results image downloaded. Share link copied to clipboard.',
      resultsNotReady: 'Results not ready to export',
      failedGenerateImage: 'Failed to generate results image',
      failedShare: 'Failed to share calculation',
      pleaseSaveFirst: 'Please save the calculation first',
      pleaseSaveFirstShareLink: 'Please save the calculation first to get a share link',
      calculationUpdated: 'Calculation updated successfully!',
      calculationUpdateFailed: 'Failed to update calculation',
      calculationSaved: 'Calculation saved!',
      calculationSaveFailed: 'Failed to save calculation',
      loadingCalculation: 'Loading calculation...',
      resolvingShortLink: 'Resolving short link...',
      calculationNotFound: 'Calculation Not Found',
      shortLinkNotFound: 'Link Not Found',
      errorNotFoundDescription: 'The calculation you\'re looking for doesn\'t exist.',
      noCalculationId: 'No calculation ID provided',
      failedLoadCalculation: 'Failed to load calculation',
      shortLinkCopied: 'Short link copied to clipboard!',
      shareThisLink: 'Share this link: {{link}}',
      loading: 'Loading...',
      view: 'View',
    },
    home: {
      heroTitle: 'Nekolators',
      heroSubtitle: 'Smart Bill Splitting Calculator',
      heroDescription: 'Split bills fairly with discounts, taxes, and shipping',
      basicCalculator: 'Basic Calculator',
      basicCalculatorDescription: 'Simple bill splitting with manual entry',
      expertMode: 'Expert Mode',
      expertModeDescription: 'Upload receipt or drag & drop items with smart calculations',
      multiplePeopleTitle: 'Multiple People',
      multiplePeopleDescription: 'Add unlimited people and split bills proportionally',
      saveEditTitle: 'Save & Edit',
      saveEditDescription: 'Save calculations and edit them anytime',
      easySharingTitle: 'Easy Sharing',
      easySharingDescription: 'Share calculations with friends via link',
      howItWorksTitle: 'How it works',
      stepOne: 'Enter discounts and taxes using simple addition (e.g., 5000+7000)',
      stepTwo: 'Add people and their individual item costs',
      stepThree: 'Get fair splits with proportional discounts and taxes',
    },
    calculator: {
      discountLabelWithValue: 'Disc: {{value}}',
      discountPlaceholder: '0',
      discountHint: 'Enter total discount or promo, e.g., 5000+7000',
      taxLabelWithValue: 'Total Shipping & Tax: {{value}}',
      taxPlaceholder: 'shipping',
      taxHint: 'Enter tax, shipping, and other fees, e.g., 5000+7000',
      personPriceHeading: 'Enter price per person',
      totalLabel: 'Total: {{value}}',
      addPersonButton: 'Add +',
      personPlaceholder: 'Person_{{index}}',
      pricePlaceholder: '5000+7000',
      cloneEntry: 'Clone entry',
      deleteEntry: 'Delete entry',
      personFallback: 'Person {{index}}',
      priceLabel: 'Price:',
      discountShortLabel: 'Disc:',
      taxShortLabel: 'Tax:',
      totalShortLabel: 'Total:',
      finalTotalLabel: 'Total final:',
      toggleDetails: 'Details',
      download: 'Download',
      readOnlyShare: 'Share',
      shareMessageWithLink: 'Nekolators results: {{link}}',
      shareMessage: 'Nekolators results',
    },
    expert: {
      title: 'Expert Calculator',
      editingSaved: 'Editing saved calculation',
      dragAndAssign: 'Drag & drop items and assign to people',
      receiptLabel: 'Receipt: {{id}}',
      receiptMeta: '{{date}} • {{customer}}',
      itemsTitle: 'Items',
      peopleTitle: 'People',
      assignmentsTitle: 'Assignments',
      discountLabel: 'Total Discount: {{value}}',
      discountHint: 'Enter discount amounts like 10000+5000',
      taxLabel: 'Tax & Shipping: {{value}}',
      taxHint: 'Enter tax and shipping like 7000+3000',
      itemNamePlaceholder: 'Item name',
      itemPricePlaceholder: 'Price',
      unnamedItem: 'Unnamed Item',
      addItemsPrompt: 'Add items to start assigning them to people',
      itemsValue: 'Items: {{value}}',
      personFallback: 'Person {{index}}',
      personPlaceholder: 'Person {{index}}',
      taxShippingLabel: 'Tax & Shipping: {{value}}',
      itemsCount: 'Items',
      peopleCount: 'People',
      assignmentsCount: 'Assignments',
      unassigned: 'Unassigned',
      receiptSummary: 'Receipt: {{id}} • {{date}}',
      resultsTitle: 'Results',
      personItemsLabel: 'Items: {{value}}',
      subtotalLabel: 'Subtotal:',
      discountShortLabel: 'Discount:',
      taxShortLabel: 'Tax & Shipping:',
      finalTotalLabel: 'Total Final:',
      shareMessageWithLink: 'Nekolators expert results: {{link}}',
      shareMessage: 'Nekolators expert results',
      unnamedPerson: 'Unnamed Person',
    },
    receiptUpload: {
      title: 'Upload Receipt',
      subtitle: 'Upload your receipt image to automatically extract items',
      processing: 'Processing Receipt...',
      processingDetails: 'Converting and extracting items and prices',
      successTitle: 'Receipt Processed!',
      successDescription: 'Redirecting to calculator...',
      errorTitle: 'Upload Failed',
      dropHere: 'Drop your receipt image here',
      browse: 'or click to browse files',
      supportedFormats: 'Supports JPG, PNG, HEIC, PDF • Max 10MB • HEIC files will be converted to JPG',
      skip: 'Skip & Enter Manually',
      chooseFile: 'Choose File',
      tipOne: '• Make sure the receipt is clearly visible and well-lit',
      tipTwo: '• Avoid shadows or glare on the receipt',
      tipThree: '• Include the entire receipt in the image',
      tipFour: '• Supported formats: JPG, PNG, HEIC, PDF (HEIC will be auto-converted)',
      fileTypeError: 'Please select a JPG, PNG, HEIC, or PDF file',
      fileSizeError: 'File size must be less than 10MB',
      heicConversionFailed: 'Failed to convert HEIC image. Please try a different format.',
    },
    view: {
      sharedTitle: 'Shared Calculation',
      sharedExpertTitle: 'Nekolators Expert',
      backToCalculator: 'Back to Calculator',
      backToExpert: 'Back to Expert Calculator',
      totalBeforeAdjustments: 'Total Before Adjustments:',
      discount: 'Discount:',
      taxShipping: 'Tax & Shipping:',
      receipt: 'Receipt: {{id}} • {{date}}',
      itemsHeading: 'Items',
      unassigned: 'Unassigned',
      unnamedPerson: 'Unnamed Person',
    },
    history: {
      title: 'History',
      signInRequired: 'Sign In Required',
      signInMessage: 'Please sign in to view your calculation history',
      allCalculations: 'All',
      basic: 'Basic',
      expert: 'Expert',
      noCalculations: 'No calculations yet',
      noCalculationsInCategory: 'No calculations in this category',
      startCalculating: 'Start calculating to see your history here',
      basicCalculation: 'Basic Calculation',
      expertCalculation: 'Expert Calculation',
      unnamed: 'Unnamed',
      personsCount: '{{count}} people',
      total: 'Total',
      view: 'View',
      edit: 'Edit',
    },
    shortLink: {
      noShortCode: 'No short code provided',
      notFound: 'Short link not found',
      failedResolve: 'Failed to resolve short link',
    },
  },
  id: {
    language: {
      english: 'Inggris',
      indonesian: 'Bahasa Indonesia',
    },
    common: {
      appName: 'Nekolators',
      home: 'Beranda',
      share: 'Bagikan',
      copy: 'Salin',
      download: 'Unduh',
      details: 'Rincian',
      close: 'Tutup',
      goToHome: 'Ke Beranda',
      saving: 'Menyimpan...',
      update: 'Perbarui',
      save: 'Simpan',
      backToCalculator: 'Kembali ke Kalkulator',
      backToExpert: 'Kembali ke Kalkulator Ahli',
      backToBasic: 'Kembali ke Kalkulator',
      createNewCalculation: 'Buat Perhitungan Baru',
      sharedCalculation: 'Perhitungan Dibagikan',
      calculationSummary: 'Ringkasan Perhitungan',
      discount: 'Diskon',
      taxShipping: 'Pajak & Ongkir',
      totalBeforeAdjustments: 'Total Sebelum Penyesuaian',
      items: 'Item',
      people: 'Orang',
      assignments: 'Penugasan',
      unassigned: 'Belum ditugaskan',
      add: 'Tambah',
      addItem: 'Tambah Item',
      addPerson: 'Tambah Orang',
      subtotal: 'Subtotal',
      totalFinal: 'Total Akhir',
      shareLinkLabel: 'Tautan bagikan:',
      tipsTitle: 'Tips agar hasil maksimal:',
      language: 'Bahasa',
      englishShort: 'EN',
      indonesianShort: 'ID',
      copyShareLink: 'Tautan berhasil disalin!',
      unableToCopy: 'Tidak dapat menyalin otomatis. Silakan salin dari tautan.',
      clipboardUnavailable: 'Clipboard tidak tersedia. Salin manual dari tautan.',
      shareSheetOpened: 'Lembar berbagi dibuka!',
      whatsappShareOpened: 'WhatsApp dibuka. Gambar diunduh sebagai cadangan.',
      resultsDownloaded: 'Gambar hasil diunduh. Tautan disalin ke clipboard.',
      resultsNotReady: 'Hasil belum siap untuk diekspor',
      failedGenerateImage: 'Gagal membuat gambar hasil',
      failedShare: 'Gagal membagikan perhitungan',
      pleaseSaveFirst: 'Harap simpan perhitungan terlebih dahulu',
      pleaseSaveFirstShareLink: 'Simpan perhitungan terlebih dahulu untuk mendapatkan tautan bagikan',
      calculationUpdated: 'Perhitungan berhasil diperbarui!',
      calculationUpdateFailed: 'Gagal memperbarui perhitungan',
      calculationSaved: 'Perhitungan tersimpan!',
      calculationSaveFailed: 'Gagal menyimpan perhitungan',
      loadingCalculation: 'Memuat perhitungan...',
      resolvingShortLink: 'Memproses tautan pendek...',
      calculationNotFound: 'Perhitungan Tidak Ditemukan',
      shortLinkNotFound: 'Tautan Tidak Ditemukan',
      errorNotFoundDescription: 'Perhitungan yang Anda cari tidak ditemukan.',
      noCalculationId: 'ID perhitungan tidak tersedia',
      failedLoadCalculation: 'Gagal memuat perhitungan',
      shortLinkCopied: 'Tautan pendek disalin!',
      shareThisLink: 'Bagikan tautan ini: {{link}}',
      loading: 'Memuat...',
      view: 'Lihat',
    },
    home: {
      heroTitle: 'Nekolators',
      heroSubtitle: 'Kalkulator Pembagian Tagihan Pintar',
      heroDescription: 'Bagi tagihan secara adil dengan diskon, pajak, dan ongkir',
      basicCalculator: 'Kalkulator Dasar',
      basicCalculatorDescription: 'Pembagian tagihan sederhana dengan input manual',
      expertMode: 'Mode Ahli',
      expertModeDescription: 'Unggah struk atau drag & drop item dengan perhitungan pintar',
      multiplePeopleTitle: 'Banyak Orang',
      multiplePeopleDescription: 'Tambah orang tanpa batas dan bagi tagihan proporsional',
      saveEditTitle: 'Simpan & Edit',
      saveEditDescription: 'Simpan perhitungan dan edit kapan saja',
      easySharingTitle: 'Berbagi Mudah',
      easySharingDescription: 'Bagikan perhitungan ke teman lewat tautan',
      howItWorksTitle: 'Cara kerja',
      stepOne: 'Masukkan diskon dan pajak dengan penjumlahan sederhana (misal, 5000+7000)',
      stepTwo: 'Tambah orang beserta biaya item masing-masing',
      stepThree: 'Dapatkan pembagian adil dengan diskon dan pajak proporsional',
    },
    calculator: {
      discountLabelWithValue: 'Disc: {{value}}',
      discountPlaceholder: '0',
      discountHint: 'Masukkan total disc/promo, contoh 5000+7000',
      taxLabelWithValue: 'Total Ongkir & Pajak: {{value}}',
      taxPlaceholder: 'ongkir',
      taxHint: 'Masukkan pajak, ongkir, dan biaya lain, contoh 5000+7000',
      personPriceHeading: 'Masukan harga /orang',
      totalLabel: 'Total: {{value}}',
      addPersonButton: 'Tambah +',
      personPlaceholder: 'Orang_{{index}}',
      pricePlaceholder: '5000+7000',
      cloneEntry: 'Gandakan entri',
      deleteEntry: 'Hapus entri',
      personFallback: 'Orang {{index}}',
      priceLabel: 'Harga:',
      discountShortLabel: 'Disc:',
      taxShortLabel: 'Pajak:',
      totalShortLabel: 'Total:',
      finalTotalLabel: 'Total akhir:',
      toggleDetails: 'Rincian',
      download: 'Unduh',
      readOnlyShare: 'Bagikan',
      shareMessageWithLink: 'Hasil Nekolators: {{link}}',
      shareMessage: 'Hasil Nekolators',
    },
    expert: {
      title: 'Kalkulator Ahli',
      editingSaved: 'Mengedit perhitungan tersimpan',
      dragAndAssign: 'Seret & lepas item lalu tetapkan ke orang',
      receiptLabel: 'Struk: {{id}}',
      receiptMeta: '{{date}} • {{customer}}',
      itemsTitle: 'Item',
      peopleTitle: 'Orang',
      assignmentsTitle: 'Penugasan',
      discountLabel: 'Total Diskon: {{value}}',
      discountHint: 'Masukkan diskon seperti 10000+5000',
      taxLabel: 'Pajak & Ongkir: {{value}}',
      taxHint: 'Masukkan pajak dan ongkir seperti 7000+3000',
      itemNamePlaceholder: 'Nama item',
      itemPricePlaceholder: 'Harga',
      unnamedItem: 'Item tanpa nama',
      addItemsPrompt: 'Tambah item untuk mulai menugaskan ke orang',
      itemsValue: 'Item: {{value}}',
      personFallback: 'Orang {{index}}',
      personPlaceholder: 'Orang {{index}}',
      taxShippingLabel: 'Pajak & Ongkir: {{value}}',
      itemsCount: 'Item',
      peopleCount: 'Orang',
      assignmentsCount: 'Penugasan',
      unassigned: 'Belum ditugaskan',
      receiptSummary: 'Struk: {{id}} • {{date}}',
      resultsTitle: 'Hasil',
      personItemsLabel: 'Item: {{value}}',
      subtotalLabel: 'Subtotal:',
      discountShortLabel: 'Diskon:',
      taxShortLabel: 'Pajak & Ongkir:',
      finalTotalLabel: 'Total Akhir:',
      shareMessageWithLink: 'Hasil Nekolators Expert: {{link}}',
      shareMessage: 'Hasil Nekolators Expert',
      unnamedPerson: 'Orang tanpa nama',
    },
    receiptUpload: {
      title: 'Unggah Struk',
      subtitle: 'Unggah foto struk untuk ekstraksi item otomatis',
      processing: 'Memproses struk...',
      processingDetails: 'Mengonversi dan mengekstrak item beserta harga',
      successTitle: 'Struk Berhasil Diproses!',
      successDescription: 'Mengalihkan ke kalkulator...',
      errorTitle: 'Unggah Gagal',
      dropHere: 'Letakkan foto struk di sini',
      browse: 'atau klik untuk pilih file',
      supportedFormats: 'Mendukung JPG, PNG, HEIC, PDF • Maks 10MB • HEIC akan dikonversi ke JPG',
      skip: 'Lewati & Input Manual',
      chooseFile: 'Pilih File',
      tipOne: '• Pastikan struk jelas dan pencahayaan baik',
      tipTwo: '• Hindari bayangan atau pantulan pada struk',
      tipThree: '• Sertakan seluruh bagian struk dalam foto',
      tipFour: '• Format didukung: JPG, PNG, HEIC, PDF (HEIC otomatis dikonversi)',
      fileTypeError: 'Pilih file JPG, PNG, HEIC, atau PDF',
      fileSizeError: 'Ukuran file harus kurang dari 10MB',
      heicConversionFailed: 'Gagal mengonversi gambar HEIC. Coba format lain.',
    },
    view: {
      sharedTitle: 'Perhitungan Dibagikan',
      sharedExpertTitle: 'Nekolators Expert',
      backToCalculator: 'Kembali ke Kalkulator',
      backToExpert: 'Kembali ke Kalkulator Ahli',
      totalBeforeAdjustments: 'Total Sebelum Penyesuaian:',
      discount: 'Diskon:',
      taxShipping: 'Pajak & Ongkir:',
      receipt: 'Struk: {{id}} • {{date}}',
      itemsHeading: 'Item',
      unassigned: 'Belum ditugaskan',
      unnamedPerson: 'Orang tanpa nama',
    },
    history: {
      title: 'Riwayat',
      signInRequired: 'Perlu Masuk',
      signInMessage: 'Silakan masuk untuk melihat riwayat perhitungan Anda',
      allCalculations: 'Semua',
      basic: 'Dasar',
      expert: 'Ahli',
      noCalculations: 'Belum ada perhitungan',
      noCalculationsInCategory: 'Tidak ada perhitungan dalam kategori ini',
      startCalculating: 'Mulai menghitung untuk melihat riwayat Anda di sini',
      basicCalculation: 'Perhitungan Dasar',
      expertCalculation: 'Perhitungan Ahli',
      unnamed: 'Tanpa nama',
      personsCount: '{{count}} orang',
      total: 'Total',
      view: 'Lihat',
      edit: 'Edit',
    },
    shortLink: {
      noShortCode: 'Kode pendek tidak tersedia',
      notFound: 'Tautan pendek tidak ditemukan',
      failedResolve: 'Gagal memproses tautan pendek',
    },
  },
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const getNestedTranslation = (
  language: Language,
  key: string
): string | TranslationDictionary | undefined => {
  return key.split('.').reduce<TranslationDictionary | string | undefined>((acc, part) => {
    if (typeof acc === 'string') {
      return acc;
    }
    if (!acc) {
      return undefined;
    }
    return acc[part];
  }, translationData[language]);
};

const formatTranslation = (value: string, options?: TranslationOptions): string => {
  if (!options) {
    return value;
  }

  return value.replace(/\{\{(\w+)\}\}/g, (_, token) => {
    const replacement = options[token];
    if (replacement === undefined || replacement === null) {
      return `{{${token}}}`;
    }
    return String(replacement);
  });
};

const translate = (language: Language, key: string, options?: TranslationOptions): string => {
  const rawValue = getNestedTranslation(language, key);
  if (typeof rawValue === 'string') {
    return formatTranslation(rawValue, options);
  }

  const fallbackValue = getNestedTranslation('en', key);
  if (typeof fallbackValue === 'string') {
    return formatTranslation(fallbackValue, options);
  }

  return key;
};

export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'id';
    }
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === 'en' || stored === 'id' ? stored : 'id';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  const translateFn = useCallback(
    (key: string, options?: TranslationOptions) => translate(language, key, options),
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: translateFn,
    }),
    [language, translateFn]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
