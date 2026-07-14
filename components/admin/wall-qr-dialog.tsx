"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getWallQr } from "@/lib/attendance";
import { ApiError } from "@/lib/api";

type WallQrDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WallQrDialog({ open, onOpenChange }: WallQrDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setUrl(null);
      setError(null);
      setLoading(false);
      setDrawing(false);
      return;
    }

    let cancelled = false;

    async function loadQr(): Promise<void> {
      setLoading(true);
      setError(null);
      setUrl(null);

      try {
        const wallQr = await getWallQr();
        if (!cancelled) {
          setUrl(wallQr.url);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Failed to load wall QR code",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadQr();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !url || !canvasRef.current) {
      return;
    }

    let cancelled = false;

    async function draw(): Promise<void> {
      setDrawing(true);
      try {
        await QRCode.toCanvas(canvasRef.current!, url!, {
          width: 280,
          margin: 2,
          errorCorrectionLevel: "M",
        });
      } catch {
        if (!cancelled) {
          setError("Failed to render QR code");
        }
      } finally {
        if (!cancelled) {
          setDrawing(false);
        }
      }
    }

    void draw();

    return () => {
      cancelled = true;
    };
  }, [open, url]);

  function downloadPng(): void {
    const canvas = canvasRef.current;
    if (!canvas || !url) {
      return;
    }

    const link = document.createElement("a");
    link.download = "school-attendance-wall-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const showCanvas = !!url && !error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>School wall QR</DialogTitle>
          <DialogDescription>
            Print and post this at school. Teachers scan it in the SMS Teacher
            app to punch in or out.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {(loading || drawing) && (
            <p className="text-sm text-muted-foreground">Loading QR code…</p>
          )}
          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {url && /localhost|127\.0\.0\.1/.test(url) && (
            <Alert variant="destructive" className="w-full">
              <AlertDescription>
                This QR points at a local API URL. Set{" "}
                <code>PUBLIC_API_BASE_URL</code> on the backend to your hosted
                API (e.g. https://smsapi.tataitsolutions.com), restart the
                server, and download again before posting it at school.
              </AlertDescription>
            </Alert>
          )}
          {showCanvas && (
            <canvas
              ref={canvasRef}
              className="rounded-md border"
              aria-label="Attendance wall QR code"
            />
          )}
          {url && !/localhost|127\.0\.0\.1/.test(url) && (
            <p className="break-all text-center text-xs text-muted-foreground">
              {url.replace(/([?&]token=)[^&]+/, "$1••••••••")}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={downloadPng}
            disabled={!url || loading || drawing || !!error}
          >
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
