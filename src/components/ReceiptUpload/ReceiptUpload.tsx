import React, { useState, useCallback } from 'react';
import { Upload, Camera, FileImage, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { processReceiptData } from '../../api/processReceipt';

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
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessingJson, setIsProcessingJson] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  const processReceiptData = (data: ReceiptData) => {
    // Convert receipt data to expert calculator format
    const items = data.items.flatMap((item, index) => {
      if (item.quantity > 1) {
        // Create multiple items for quantities > 1
        return Array.from({ length: item.quantity }, (_, qIndex) => ({
          id: `item-${index}-${qIndex}`,
          name: `${item.name} (${qIndex + 1}/${item.quantity})`,
          price: Math.round(item.unit_price / item.quantity),
          category: 'food' as const
        }));
      } else {
        // Single item
        return [{
          id: `item-${index}`,
          name: item.name,
          price: Math.round(item.total),
          category: 'food' as const
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

    try {
      const formData = new FormData();
      formData.append('image', file);

      const apiUrl = import.meta.env.VITE_RECEIPT_UPLOAD_API_URL;
      
      if (!apiUrl) {
        throw new Error('Receipt upload API URL is not configured. Please check your environment variables.');
      }

      // Check for mixed content issues
      const currentProtocol = window.location.protocol;
      const apiProtocol = apiUrl.startsWith('https://') ? 'https:' : 'http:';
      
      if (currentProtocol === 'https:' && apiProtocol === 'http:') {
        throw new Error('Mixed content error: Cannot make HTTP requests from HTTPS page. Please use HTTPS API endpoint or run dev server on HTTP.');
      }
      let response;
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
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!supportedTypes.includes(file.type)) {
      setUploadStatus('error');
      setErrorMessage('Please select a JPG, PNG, or PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadStatus('error');
      setErrorMessage('File size must be less than 10MB');
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

  const handleJsonSubmit = async () => {
    if (!jsonInput.trim()) {
      setUploadStatus('error');
      setErrorMessage('Please enter JSON data');
      return;
    }

    setIsProcessingJson(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const data = JSON.parse(jsonInput);
      const result = await processReceiptData(data);
      
      if (result.success) {
        setUploadStatus('success');
        setTimeout(() => {
          navigate(`/expert/${result.calculation_id}/edit`);
        }, 1000);
      } else {
        setUploadStatus('error');
        setErrorMessage(result.error || 'Failed to process receipt data');
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Invalid JSON format');
    } finally {
      setIsProcessingJson(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-400 mb-2">
            Upload Receipt
          </h1>
          <p className="text-white/80">
            Upload your receipt image to automatically extract items
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
                  <p className="text-lg font-medium text-gray-700">Processing Receipt...</p>
                  <p className="text-sm text-gray-500">Extracting items and prices</p>
                </div>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-green-700">Receipt Processed!</p>
                  <p className="text-sm text-green-600">Redirecting to calculator...</p>
                </div>
              </div>
            ) : uploadStatus === 'error' ? (
              <div className="space-y-4">
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-red-700">Upload Failed</p>
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
                    Drop your receipt image here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports JPG, PNG, PDF • Max 10MB
                  </p>
                </div>
              </div>
            )}

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
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
              Skip & Enter Manually
            </button>
            
            <label className="flex-1">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileInput}
                className="hidden"
                disabled={isUploading}
              />
              <div className="w-full px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer text-center disabled:opacity-50">
                Choose File
              </div>
            </label>
          </div>

          {/* JSON Input Section */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Or paste JSON data directly:</h3>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"transaction_id": "F-2964671742", "items": [...], ...}'
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
              disabled={isUploading || isProcessingJson}
            />
            <button
              onClick={handleJsonSubmit}
              disabled={isUploading || isProcessingJson || !jsonInput.trim()}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
            >
              {isProcessingJson ? 'Processing...' : 'Process JSON'}
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Tips for best results:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Make sure the receipt is clearly visible and well-lit</li>
              <li>• Avoid shadows or glare on the receipt</li>
              <li>• Include the entire receipt in the image</li>
              <li>• Supported formats: JPG, PNG, PDF</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};