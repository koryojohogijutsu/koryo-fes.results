"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  onScan: (text: string) => void;
  onClose: () => void;
}

type Html5QrcodeInstance = {
  start: (...args: unknown[]) => Promise<null>;
  stop: () => Promise<void>;
  clear: () => void;
  scanFile: (imageFile: File, showImage?: boolean) => Promise<string>;
  getState?: () => number;
};

export function QrScanner({ onScan, onClose }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const scannerRef     = useRef<Html5QrcodeInstance | null>(null);
  const isRunningRef   = useRef(false); // カメラのstart()が成功し、まだstopしていないか
  const isStoppingRef  = useRef(false); // stop()の多重実行防止

  // true: カメラ許可待ち（まだ映像が始まっていない）
  const [waitingPermission, setWaitingPermission] = useState(true);
  // 写真からの読み取り中フラグ・エラーメッセージ
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [fileError, setFileError] = useState("");

  // 実行中の場合のみ安全にカメラをstopする
  const safeStop = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let cancelled = false;

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
        // カメラ許可拒否などは、写真からの読み取りだけでも使えるようにそのまま続行する
        isRunningRef.current = false;
        setWaitingPermission(false);
      }
    }

    start();

    return () => {
      cancelled = true;
      safeStop();
    };
  }, [onScan, safeStop]);

  // 「写真から選ぶ」ボタン
  function handlePickFile() {
    setFileError("");
    fileInputRef.current?.click();
  }

  // 写真が選択されたときの処理
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 同じ画像を選び直しても onChange が発火するようにリセット
    if (!file) return;

    setFileError("");
    setIsReadingFile(true);

    // 写真を読み取る間はカメラを止めておく
    await safeStop();

    try {
      // 動的インポート（カメラ許可が拒否されていた場合はまだ読み込まれていないため）
      const { Html5Qrcode } = await import("html5-qrcode");
      let scanner = scannerRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode("qr-reader") as unknown as Html5QrcodeInstance;
        scannerRef.current = scanner;
      }
      const decodedText = await scanner.scanFile(file, false);
      onScan(decodedText);
    } catch {
      setFileError("この写真から2次元コードを読み取れませんでした。別の写真でお試しください。");
    } finally {
      setIsReadingFile(false);
    }
  }

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

        {/* 写真（保存済みのQR画像）から読み取る */}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            onClick={handlePickFile}
            disabled={isReadingFile}
            style={{
              fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13, fontWeight: 700,
              color: "#8cd15c", background: "#fff", border: "1px solid #8cd15c",
              borderRadius: 20, padding: "8px 20px", cursor: isReadingFile ? "default" : "pointer",
              opacity: isReadingFile ? 0.6 : 1,
            }}
          >
            {isReadingFile ? "読み取り中…" : "📷 写真から読み込む"}
          </button>
          {fileError && (
            <p style={{
              fontFamily: "'Noto Sans JP', sans-serif", fontSize: 12, color: "#e2551e",
              marginTop: 8,
            }}>
              {fileError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
