import React, { useState, useCallback } from 'react';
import { Upload, Camera, FileImage, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heic2any from 'heic2any';
import { useLanguage } from '../../lib/i18n';

interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ReceiptFee {
  type: string;
  amount: number;
}

interface ReceiptDiscount {
  type: string;
  amount: number;
}

interface ReceiptData {
  transaction_id: string;
  transaction_date: string;
  customer_name: string;
  total_paid: number;
  billing_amount: number;
  items: ReceiptItem[];
  fees: ReceiptFee[];
  total_fees: number;
  discounts: ReceiptDiscount[];
  total_discounts: number;
  subtotal: number;
  final_total: number;
}

export const ReceiptUpload: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Convert HEIC to JPG
  const convertHeicToJpg = async (file: File): Promise<File> => {
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      });
      
      // heic2any can return Blob or Blob[], handle both cases
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      
      // Create a new File object with JPG extension
      const convertedFile = new File(
        [blob], 
        file.name.replace(/\.heic$/i, '.jpg'), 
        { type: 'image/jpeg' }
      );
      
      return convertedFile;
    } catch (error) {
      console.error('HEIC conversion failed:', error);
      throw new Error(t('receiptUpload.heicConversionFailed'));
    }
  };

  const processReceiptData = (data: ReceiptData) => {
    // Convert receipt data to expert calculator format
    const items = data.items.flatMap((item, index) => {
      if (item.quantity > 1) {
        // Create multiple items for quantities > 1
        return Array.from({ length: item.quantity }, (_, qIndex) => ({
          id: `item-${index}-${qIndex}`,
          name: `${item.name} (${qIndex + 1}/${item.quantity})`,
          price: Math.round(item.unit_price / item.quantity)
        }));
      } else {
        // Single item
        return [{
          id: `item-${index}`,
          name: item.name,
          price: Math.round(item.total)
        }];
      }
    });

    const discount = Math.round(data.total_discounts);
    const tax = Math.round(data.total_fees);

    // Navigate to expert calculator with pre-filled data
    navigate('/expert', { 
      state: { 
        items, 
        discount, 
        tax,
        receiptData: data 
      } 
    });
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    let fileToUpload = file;

    // Convert HEIC to JPG if needed
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      try {
        setUploadStatus('idle');
        // Show conversion status
        console.log('Converting HEIC to JPG...');
        fileToUpload = await convertHeicToJpg(file);
        console.log('HEIC conversion completed');
      } catch (conversionError) {
        setUploadStatus('error');
        setErrorMessage(conversionError instanceof Error ? conversionError.message : 'HEIC conversion failed');
        setIsUploading(false);
        return;
      }
    }

    let response: Response;

    try {
      const formData = new FormData();
      formData.append('image', fileToUpload);

      const apiUrl = import.meta.env.VITE_RECEIPT_UPLOAD_API_URL;
      
      if (!apiUrl) {
        // Fallback to local server if no external API is configured
        const localApiUrl = `http://localhost:${import.meta.env.VITE_SERVER_PORT || 3001}/functions/v1/receipt-api`;
        console.log('Using local API server:', localApiUrl);
        response = await fetch(localApiUrl, {
          method: 'POST',
          body: formData,
          mode: 'cors',
        });
      } else {
        // Check for mixed content issues
        const currentProtocol = window.location.protocol;
        const apiProtocol = apiUrl.startsWith('https://') ? 'https:' : 'http:';
        
        if (currentProtocol === 'https:' && apiProtocol === 'http:') {
          throw new Error('Mixed content error: Cannot make HTTP requests from HTTPS page. Please use HTTPS API endpoint or run dev server on HTTP.');
        }
        
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            mode: 'cors',
          });
        } catch (fetchError) {
          if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
            throw new Error(`Network error: Cannot reach ${apiUrl}. This could be due to:\n• Server is offline or unreachable\n• CORS policy blocking the request\n• Mixed content (HTTPS→HTTP) blocking\n• Network connectivity issues`);
          }
          throw fetchError;
        }
      }

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('Server returned an empty response');
      }

      let data: ReceiptData;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}...`);
      }

      setUploadStatus('success');
      
      // Process the data after a short delay to show success state
      setTimeout(() => {
        processReceiptData(data);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'application/pdf'];
    const isHeic = file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic');
    
    if (!supportedTypes.includes(file.type)) {
      // Check if it's HEIC by file extension since some browsers don't recognize the MIME type
      if (!isHeic) {
        setUploadStatus('error');
        setErrorMessage(t('receiptUpload.fileTypeError'));
        return;
      }
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadStatus('error');
      setErrorMessage(t('receiptUpload.fileSizeError'));
      return;
    }

    uploadImage(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const skipUpload = () => {
    navigate('/expert');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-400 mb-2">
            {t('receiptUpload.title')}
          </h1>
          <p className="text-white/80">
            {t('receiptUpload.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              isDragging
                ? 'border-purple-400 bg-purple-50'
                : uploadStatus === 'success'
                ? 'border-green-400 bg-green-50'
                : uploadStatus === 'error'
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
            }`}
          >
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 text-purple-600 mx-auto animate-spin" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {t('receiptUpload.processing')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('receiptUpload.processingDetails')}
                  </p>
                </div>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-green-700">{t('receiptUpload.successTitle')}</p>
                  <p className="text-sm text-green-600">{t('receiptUpload.successDescription')}</p>
                </div>
              </div>
            ) : uploadStatus === 'error' ? (
              <div className="space-y-4">
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-red-700">{t('receiptUpload.errorTitle')}</p>
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <Upload className="w-12 h-12 text-gray-400" />
                  <Camera className="w-12 h-12 text-gray-400" />
                  <FileImage className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {t('receiptUpload.dropHere')}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {t('receiptUpload.browse')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t('receiptUpload.supportedFormats')}
                  </p>
                </div>
              </div>
            )}

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.heic,.pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={skipUpload}
              disabled={isUploading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {t('receiptUpload.skip')}
            </button>

            <label className="flex-1">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.heic,.pdf"
                onChange={handleFileInput}
                className="hidden"
                disabled={isUploading}
              />
              <div className="w-full px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer text-center disabled:opacity-50">
                {t('receiptUpload.chooseFile')}
              </div>
            </label>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">{t('common.tipsTitle')}</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>{t('receiptUpload.tipOne')}</li>
              <li>{t('receiptUpload.tipTwo')}</li>
              <li>{t('receiptUpload.tipThree')}</li>
              <li>{t('receiptUpload.tipFour')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
