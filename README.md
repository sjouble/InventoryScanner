# 품번 인식 재고 관리 앱

휴대폰 카메라를 사용하여 제품 품번을 인식하고 재고를 관리하는 React Native 앱입니다.

## 주요 기능

- 📸 **카메라 촬영**: 제품 품번이 있는 부분을 촬영
- 🎯 **영역 선택**: 촬영된 이미지에서 품번 부분을 터치하여 선택
- 🔍 **OCR 인식**: Tesseract.js를 사용한 텍스트 인식
- 📦 **단위 선택**: 카톤/중포 단위 선택
- 📅 **유통기한**: 8자리 유통기한 입력
- 📋 **목록 관리**: 입력된 재고 목록 저장 및 관리
- 📤 **공유 기능**: 목록을 클립보드에 복사하여 공유

## 설치 및 실행

### 필수 요구사항
- Node.js 16 이상
- Expo CLI
- Android Studio (Android 개발용)
- Xcode (iOS 개발용, macOS 필요)

### 설치 방법

1. 프로젝트 클론
```bash
git clone <repository-url>
cd InventoryScanner
```

2. 의존성 설치
```bash
npm install
```

3. 앱 실행
```bash
# Android
npm run android

# iOS (macOS 필요)
npm run ios

# 웹
npm run web
```

## 사용법

1. **관출정리 시작** 버튼을 눌러 카메라 모드 진입
2. 제품 품번이 있는 부분을 촬영
3. 촬영된 이미지에서 **품번 영역 선택** 버튼을 눌러 품번 부분 터치
4. **OCR 처리** 버튼을 눌러 품번 인식
5. 수량과 단위(카톤/중포) 선택
6. 필요시 유통기한 입력 (YYYYMMDD 형식)
7. **추가** 버튼을 눌러 목록에 추가
8. **공유** 버튼을 눌러 목록을 클립보드에 복사

## 기술 스택

- **React Native**: 크로스 플랫폼 모바일 앱 개발
- **Expo**: 개발 환경 및 빌드 도구
- **TypeScript**: 타입 안전성
- **Tesseract.js**: OCR 텍스트 인식
- **Expo Camera**: 카메라 기능
- **AsyncStorage**: 로컬 데이터 저장

## 프로젝트 구조

```
InventoryScanner/
├── App.tsx              # 메인 앱 컴포넌트
├── app.json             # Expo 설정
├── package.json         # 의존성 관리
├── tsconfig.json        # TypeScript 설정
└── assets/              # 이미지 및 아이콘
```

## 주요 컴포넌트

- **Camera Component**: 카메라 촬영 기능
- **Image Processing**: OCR 텍스트 인식
- **Inventory Management**: 재고 목록 관리
- **Data Persistence**: AsyncStorage를 통한 데이터 저장

## 권한 요구사항

- **카메라**: 품번 촬영을 위해 필요
- **저장소**: 이미지 저장 및 로드
- **클립보드**: 목록 공유 기능

## 개발 참고사항

- OCR 인식 정확도를 높이기 위해 이미지 품질과 조명에 주의
- 한국어와 영어 텍스트 모두 인식 가능
- 선택한 영역의 텍스트만 추출하여 처리

## 라이선스

MIT License 