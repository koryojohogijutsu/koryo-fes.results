"use client";

import { useEffect, useRef } from "react";

interface Props {
  onScan: (text: string) => void;
  onClose: () => void;
}

export function QrScanner({ onScan, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef   = useRef<unknown>(null);

  useEffect(() => {
    let stopped = false;

    async function start() {
      // 動的インポートでSSRエラーを回避
      const { Html5Qrcode } = await import("html5-qrcode");

      if (stopped || !containerRef.current) return;

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },   // 背面カメラを優先
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            // スキャン成功 → 停止してコールバック
            scanner.stop().catch(() => {});
            onScan(decodedText);
          },
          () => {} // エラーは無視（QRが見つからない間は常に呼ばれるため）
        );
      } catch {
        // カメラ許可拒否などはクローズで対応
        onClose();
      }
    }

    start();

    return () => {
      stopped = true;
      const s = scannerRef.current as { stop?: () => Promise<void> } | null;
      s?.stop?.().catch(() => {});
    };
  }, [onScan, onClose]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        background: "#fff", borderRadius: 8, padding: 20, width: 320, maxWidth: "90vw",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 15, fontWeight: 700, margin: 0 }}>
            QRコードをかざしてください
          </p>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", fontSize: 20, cursor: "pointer",
              color: "#888", lineHeight: 1,
            }}
          >✕</button>
        </div>
        {/* html5-qrcode はこのIDのdivにカメラ映像を描画する */}
        <div id="qr-reader" ref={containerRef} style={{ width: "100%" }} />
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontSize: 12, color: "#888",
          textAlign: "center", marginTop: 12,
        }}>
          カメラの使用を許可してください
        </p>
      </div>
    </div>
  );
}
