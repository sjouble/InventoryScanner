// PaddleOCR API 서비스
export interface OCRResult {
  text: string;
  confidence: number;
  bbox: number[];
}

export interface PaddleOCRResponse {
  results: OCRResult[];
}

class OCRService {
  private apiUrl: string = 'https://api.paddleocr.com/v1/ocr'; // 예시 URL
  
  async recognizeText(imageBase64: string): Promise<string[]> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
          lang: 'korean',
          use_gpu: false,
        }),
      });

      if (!response.ok) {
        throw new Error('OCR API 요청 실패');
      }

      const data: PaddleOCRResponse = await response.json();
      return data.results.map(result => result.text);
    } catch (error) {
      console.error('OCR 인식 오류:', error);
      throw error;
    }
  }

  // Tesseract.js를 폴백으로 사용
  async recognizeTextWithTesseract(imageUri: string): Promise<string> {
    const Tesseract = require('tesseract.js');
    
    try {
      const result = await Tesseract.recognize(imageUri, 'kor+eng', {
        logger: (m: any) => console.log(m),
      });
      
      return result.data.text.replace(/\s+/g, '');
    } catch (error) {
      console.error('Tesseract OCR 오류:', error);
      throw error;
    }
  }

  // 이미지 전처리 (선명도 향상)
  async preprocessImage(imageUri: string): Promise<string> {
    // 이미지 전처리 로직 (필요시 구현)
    return imageUri;
  }

  // 선택된 영역에서 텍스트 추출
  async extractTextFromRegion(
    imageUri: string, 
    region: { x: number; y: number; width: number; height: number }
  ): Promise<string> {
    try {
      // 먼저 PaddleOCR API 시도
      const imageBase64 = await this.imageToBase64(imageUri);
      const texts = await this.recognizeText(imageBase64);
      
      // 선택된 영역과 겹치는 텍스트 필터링
      const filteredTexts = this.filterTextsByRegion(texts, region);
      
      if (filteredTexts.length > 0) {
        return filteredTexts.join(' ');
      }
      
      // PaddleOCR 실패시 Tesseract 사용
      return await this.recognizeTextWithTesseract(imageUri);
    } catch (error) {
      console.error('영역 텍스트 추출 오류:', error);
      // 최종 폴백으로 Tesseract 사용
      return await this.recognizeTextWithTesseract(imageUri);
    }
  }

  private async imageToBase64(imageUri: string): Promise<string> {
    const FileSystem = require('expo-file-system');
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  }

  private filterTextsByRegion(texts: string[], region: any): string[] {
    // 간단한 필터링 로직 (실제로는 더 정교한 구현 필요)
    return texts.filter(text => {
      // 숫자가 포함된 텍스트 우선 선택
      return /\d/.test(text);
    });
  }
}

export default new OCRService(); 