// Define the prediction data type
export interface Prediction {
  id: string;
  createdAt: string;
  result: {
    prediction: number;
    confidence: number;
  };
  status: 'completed' | 'processing' | 'failed';
}

// Define the API response type
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Define the error response type
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
