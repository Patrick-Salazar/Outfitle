import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, X, RotateCcw, SwitchCamera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PhotoCapture({ onPhotoCapture, capturedImage, onRemove }) {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [isMobile] = useState(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  useEffect(() => {
    // Check if device has multiple cameras
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const startCamera = async (mode = facingMode) => {
    try {
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
      setFacingMode(mode);
    } catch (err) {
      console.error("Error accessing camera:", err);
      
      // Try alternative approach for iOS
      if (isMobile && err.name === 'NotAllowedError') {
        alert("Camera access denied. Please enable camera permissions in your browser settings:\n\n1. Go to Settings\n2. Find your browser (Safari/Chrome)\n3. Enable Camera access\n4. Reload this page");
      } else if (err.name === 'NotFoundError') {
        alert("No camera found on this device.");
      } else {
        alert("Unable to access camera. Please ensure:\n1. Camera permissions are enabled\n2. No other app is using the camera\n3. Try uploading a photo instead");
      }
    }
  };

  const switchCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    await startCamera(newMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], `clothing-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onPhotoCapture(file);
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoCapture(file);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  if (capturedImage) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="relative aspect-[3/4] bg-neutral-100">
            <img 
              src={capturedImage} 
              alt="Captured clothing"
              className="w-full h-full object-cover"
            />
            <Button
              onClick={onRemove}
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (isCameraActive) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="relative aspect-[3/4] bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Camera Controls Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              {/* Top Controls */}
              <div className="flex justify-between items-start">
                <Button
                  onClick={stopCamera}
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0"
                >
                  <X className="w-5 h-5" />
                </Button>
                
                {hasMultipleCameras && isMobile && (
                  <Button
                    onClick={switchCamera}
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0"
                  >
                    <SwitchCamera className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {/* Bottom Controls */}
              <div className="flex justify-center pb-6">
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="h-16 w-16 rounded-full bg-white hover:bg-white/90 p-0 shadow-lg border-4 border-white/50"
                >
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <Camera className="w-8 h-8 text-neutral-900" />
                  </div>
                </Button>
              </div>
            </div>

            {/* Camera Guide */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full flex items-center justify-center">
                <div className="border-2 border-white/30 rounded-lg w-[80%] h-[70%]"></div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="border-2 border-dashed border-neutral-200 bg-white/50 backdrop-blur-sm overflow-hidden">
      <div className="aspect-[3/4] flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 mb-6 bg-neutral-100 rounded-full flex items-center justify-center">
          <Camera className="w-10 h-10 text-neutral-400" />
        </div>
        <h3 className="text-xl font-light text-neutral-900 mb-2 tracking-tight">
          Add Your Item
        </h3>
        <p className="text-sm text-neutral-500 mb-8 text-center tracking-wide">
          {isMobile ? "Use your camera or upload from gallery" : "Take a photo or upload from computer"}
        </p>
        
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button
            onClick={() => startCamera(facingMode)}
            className="w-full bg-neutral-900 hover:bg-neutral-800 rounded-full h-12"
          >
            <Camera className="w-5 h-5 mr-2" />
            {isMobile ? "OPEN CAMERA" : "USE WEBCAM"}
          </Button>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full rounded-full border-neutral-300 h-12"
          >
            <Upload className="w-5 h-5 mr-2" />
            UPLOAD PHOTO
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture={isMobile ? "environment" : undefined}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {isMobile && (
          <p className="text-xs text-neutral-400 mt-4 text-center">
            📱 Tip: Allow camera access when prompted
          </p>
        )}
      </div>
    </Card>
  );
}