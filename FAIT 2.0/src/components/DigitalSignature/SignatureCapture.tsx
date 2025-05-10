import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SignatureCaptureProps {
  onSave: (signatureData: string) => void;
  width?: number;
  height?: number;
  clearAfterSave?: boolean;
}

const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSave,
  width = 500,
  height = 200,
  clearAfterSave = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const { user } = useAuth();

  // Initialize canvas context
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.strokeStyle = '#000000';
        setCtx(context);
      }
    }
  }, []);

  // Start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Get mouse or touch position
    const { offsetX, offsetY } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  // Draw
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
    // Get mouse or touch position
    const { offsetX, offsetY } = getCoordinates(e);
    
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  // Stop drawing
  const stopDrawing = () => {
    if (!ctx) return;
    
    setIsDrawing(false);
    ctx.closePath();
  };

  // Get coordinates for both mouse and touch events
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      
      if (rect) {
        return {
          offsetX: touch.clientX - rect.left,
          offsetY: touch.clientY - rect.top
        };
      }
    } else {
      // Mouse event
      return {
        offsetX: e.nativeEvent.offsetX,
        offsetY: e.nativeEvent.offsetY
      };
    }
    
    return { offsetX: 0, offsetY: 0 };
  };

  // Clear the canvas
  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Save the signature
  const saveSignature = () => {
    if (canvasRef.current) {
      const signatureData = canvasRef.current.toDataURL('image/png');
      onSave(signatureData);
      
      if (clearAfterSave) {
        clearCanvas();
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="border border-gray-300 rounded-md mb-4">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="bg-white cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={clearCanvas}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={saveSignature}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
};

export default SignatureCapture;
