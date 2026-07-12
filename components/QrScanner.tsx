"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onScan: (text: string) => void;
  onClose: () => void;
}

type Html5QrcodeInstance = {
  start: (...args: unknown[]) => Promise<null>;
  stop: () => Promise<void>;
  clear: () => void;
  getState?: () => number;
};

export function QrScanner({ onScan, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef    = useRef<Html5QrcodeInstance | null>(null);
  const isRunningRef   = useRef(false); // start()が成功し、まだstopしていないか
  const isStoppingRef  = useRef(false); // stop()の多重実行防止

  // true: カメラ許可待ち（まだ映像が始まっていない）
  const [waitingPermission, setWaitingPermission] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // 実行中の場合のみ安全にstopする
    async function safeStop() {
      if (isStoppingRef.current || !isRunningRef.current) return;
      isStoppingRef.current = true;
      const scanner = scannerRef.current;
      isRunningRef.current = false;
      try {
        if (scanner) {
          await scanner.stop();
          scanner.clear();
        }
      } catch {
        // 既に停止済み・非対応状態などは無視
      } finally {
        isStoppingRef.current = false;
      }
    }

    async function start() {
      // 動的インポートでSSRエラーを回避
      const { Html5Qrcode } = await import("html5-qrcode");

      if (cancelled || !containerRef.current) return;

      const scanner = new Html5Qrcode("qr-reader") as unknown as Html5QrcodeInstance;
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },   // 背面カメラを優先
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            // スキャン成功 → 停止してコールバック
            safeStop().finally(() => onScan(decodedText));
          },
          () => {} // エラーは無視（2次元コードが見つからない間は常に呼ばれるため）
        );
        if (cancelled) {
          // start完了までにアンマウントされていた場合は即停止
          safeStop();
          return;
        }
        isRunningRef.current = true;
        setWaitingPermission(false); // カメラ映像が始まったので注意書きを消す
      } catch {
        // カメラ許可拒否などはクローズで対応
        isRunningRef.current = false;
        onClose();
      }
    }

    start();

    return () => {
      cancelled = true;
      safeStop();
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
            2次元コードをかざしてください
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
        {waitingPermission && (
          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif", fontSize: 12, color: "#888",
            textAlign: "center", marginTop: 12,
          }}>
            カメラの使用を許可してください
          </p>
        )}
      </div>
    </div>
  );
}
