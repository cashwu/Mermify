import { describe, it, expect } from 'vitest';
import {
  parseViewBox,
  calculateExportDimensions,
  validateExportSetup,
  type ViewBoxDimensions,
} from './export-apng';

describe('parseViewBox', () => {
  it('應該正確解析標準 viewBox 字串', () => {
    const result = parseViewBox('-8 -8 1498.15625 182');
    expect(result).toEqual({
      x: -8,
      y: -8,
      width: 1498.15625,
      height: 182,
    });
  });

  it('應該正確解析正數 viewBox', () => {
    const result = parseViewBox('0 0 800 600');
    expect(result).toEqual({
      x: 0,
      y: 0,
      width: 800,
      height: 600,
    });
  });

  it('應該回傳 null 當 viewBox 為 null', () => {
    const result = parseViewBox(null);
    expect(result).toBeNull();
  });

  it('應該回傳 null 當 viewBox 為空字串', () => {
    const result = parseViewBox('');
    expect(result).toBeNull();
  });

  it('應該回傳 null 當 viewBox 格式不正確（少於 4 個值）', () => {
    const result = parseViewBox('0 0 800');
    expect(result).toBeNull();
  });

  it('應該回傳 null 當 viewBox 包含非數字', () => {
    const result = parseViewBox('0 0 abc 600');
    expect(result).toBeNull();
  });
});

describe('calculateExportDimensions', () => {
  /**
   * 【重要測試】確保輸出尺寸等於 viewBox 尺寸
   * 這是防止圖片變形的關鍵
   */
  it('輸出尺寸必須等於 viewBox 尺寸（不可縮放）', () => {
    const viewBox: ViewBoxDimensions = {
      x: -8,
      y: -8,
      width: 1498.15625,
      height: 182,
    };

    const result = calculateExportDimensions(viewBox);

    // 【重要】width 和 height 必須是 viewBox 尺寸的四捨五入值
    // 不可以乘以任何 scale 係數
    expect(result.width).toBe(1498); // Math.round(1498.15625)
    expect(result.height).toBe(182); // Math.round(182)
  });

  it('不應該對尺寸進行任何縮放', () => {
    const viewBox: ViewBoxDimensions = {
      x: 0,
      y: 0,
      width: 1000,
      height: 500,
    };

    const result = calculateExportDimensions(viewBox);

    // 如果有人不小心加入 scale 係數（例如 * 2），這個測試會失敗
    expect(result.width).toBe(1000);
    expect(result.height).toBe(500);
    // 確保比例保持不變
    expect(result.width / result.height).toBe(viewBox.width / viewBox.height);
  });

  it('應該正確四捨五入小數', () => {
    const viewBox: ViewBoxDimensions = {
      x: 0,
      y: 0,
      width: 100.4,
      height: 100.6,
    };

    const result = calculateExportDimensions(viewBox);

    expect(result.width).toBe(100); // 100.4 四捨五入為 100
    expect(result.height).toBe(101); // 100.6 四捨五入為 101
  });
});

describe('validateExportSetup', () => {
  it('當 SVG 尺寸與 viewBox 一致時應該通過驗證', () => {
    const viewBox: ViewBoxDimensions = {
      x: 0,
      y: 0,
      width: 1498.15625,
      height: 182,
    };

    const result = validateExportSetup(1498, 182, viewBox);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('當 SVG 尺寸與 viewBox 不一致時應該失敗', () => {
    const viewBox: ViewBoxDimensions = {
      x: 0,
      y: 0,
      width: 1498,
      height: 182,
    };

    // 模擬錯誤的縮放（例如 scale = 2）
    const result = validateExportSetup(2996, 364, viewBox);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('不一致');
    expect(result.error).toContain('變形');
  });

  it('應該偵測到只有寬度不正確的情況', () => {
    const viewBox: ViewBoxDimensions = {
      x: 0,
      y: 0,
      width: 1000,
      height: 500,
    };

    const result = validateExportSetup(2000, 500, viewBox);

    expect(result.valid).toBe(false);
  });

  it('應該偵測到只有高度不正確的情況', () => {
    const viewBox: ViewBoxDimensions = {
      x: 0,
      y: 0,
      width: 1000,
      height: 500,
    };

    const result = validateExportSetup(1000, 1000, viewBox);

    expect(result.valid).toBe(false);
  });
});

/**
 * 迴歸測試：確保修復後的邏輯不會被意外改變
 * 這些測試模擬實際使用情境
 */
describe('APNG 匯出尺寸迴歸測試', () => {
  it('Mermaid flowchart 的典型 viewBox 應該正確處理', () => {
    // 這是實際 Mermaid 產生的 viewBox 範例
    const viewBox = parseViewBox('-8 -8 1498.15625 182');
    expect(viewBox).not.toBeNull();

    const dimensions = calculateExportDimensions(viewBox!);

    // 確保輸出尺寸正確
    expect(dimensions.width).toBe(1498);
    expect(dimensions.height).toBe(182);

    // 確保驗證通過
    const validation = validateExportSetup(
      dimensions.width,
      dimensions.height,
      viewBox!
    );
    expect(validation.valid).toBe(true);
  });

  it('應該拒絕縮放後的尺寸設定', () => {
    const viewBox = parseViewBox('-8 -8 1498 182');
    expect(viewBox).not.toBeNull();

    // 模擬有人試圖使用 scale = 2
    const scaledWidth = 1498 * 2;
    const scaledHeight = 182 * 2;

    const validation = validateExportSetup(scaledWidth, scaledHeight, viewBox!);

    // 這應該失敗，因為縮放會導致圖片變形
    expect(validation.valid).toBe(false);
  });
});
