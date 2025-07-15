# 🚀 앱 배포 가이드

이 문서는 GitHub 레포지토리를 통해 품번 인식 재고 관리 앱을 배포하는 방법을 설명합니다.

## 📋 배포 옵션

### 1. **Expo Go 앱 (즉시 테스트)**
가장 빠른 방법으로, 개발 중인 앱을 즉시 테스트할 수 있습니다.

```bash
# 프로젝트 실행
npm start

# QR 코드를 스캔하여 Expo Go 앱에서 테스트
```

### 2. **EAS Build (네이티브 앱)**
Expo의 클라우드 빌드 서비스를 사용하여 실제 앱 파일(.apk, .ipa)을 생성합니다.

### 3. **GitHub Actions (자동 배포)**
GitHub에 코드를 푸시하면 자동으로 빌드되고 배포됩니다.

## 🔧 배포 설정

### 1. Expo 계정 설정

1. [Expo](https://expo.dev)에서 계정 생성
2. EAS CLI 설치:
```bash
npm install -g @expo/eas-cli
```

3. Expo에 로그인:
```bash
eas login
```

### 2. GitHub Secrets 설정

GitHub 레포지토리에서 다음 시크릿을 설정하세요:

1. **EXPO_TOKEN**: Expo 계정의 액세스 토큰
   - [Expo 토큰 생성](https://expo.dev/accounts/[username]/settings/access-tokens)
   - GitHub 레포지토리 → Settings → Secrets → New repository secret

### 3. 프로젝트 설정

```bash
# EAS 프로젝트 초기화
eas build:configure

# Android 빌드
eas build --platform android

# iOS 빌드 (macOS 필요)
eas build --platform ios
```

## 📱 배포 방법별 상세 가이드

### A. Expo Go 앱 배포

**장점:**
- 즉시 테스트 가능
- 별도 빌드 불필요
- 개발 중 빠른 반복

**단점:**
- Expo Go 앱 필요
- 네이티브 기능 제한

**사용법:**
```bash
npm start
# QR 코드 스캔
```

### B. EAS Build 배포

**장점:**
- 실제 앱 파일 생성
- 네이티브 기능 완전 지원
- 앱스토어 배포 가능

**단점:**
- 빌드 시간 소요
- Expo 계정 필요

**사용법:**
```bash
# 개발용 빌드
eas build --profile development --platform android

# 미리보기 빌드
eas build --profile preview --platform android

# 프로덕션 빌드
eas build --profile production --platform android
```

### C. GitHub Actions 자동 배포

**장점:**
- 자동화된 배포
- 코드 푸시시 자동 빌드
- 팀 협업에 유리

**단점:**
- 초기 설정 복잡
- GitHub Actions 시간 제한

**사용법:**
1. 코드를 main 브랜치에 푸시
2. GitHub Actions 자동 실행
3. 빌드된 앱 파일 다운로드

## 🔄 배포 워크플로우

### 1. 개발 단계
```bash
# 로컬 개발
npm start
# Expo Go로 테스트
```

### 2. 테스트 단계
```bash
# 미리보기 빌드
eas build --profile preview --platform android
# 테스트용 APK 다운로드
```

### 3. 배포 단계
```bash
# 프로덕션 빌드
eas build --profile production --platform android
# 앱스토어 제출
eas submit --platform android
```

## 📊 배포 상태 확인

### GitHub Actions
- GitHub 레포지토리 → Actions 탭
- 워크플로우 실행 상태 확인
- 빌드된 아티팩트 다운로드

### EAS Dashboard
- [Expo Dashboard](https://expo.dev)에서 빌드 상태 확인
- 빌드 로그 및 에러 확인

## 🛠️ 문제 해결

### 일반적인 문제들

1. **빌드 실패**
   - 의존성 충돌 확인
   - Node.js 버전 확인
   - EAS CLI 업데이트

2. **권한 오류**
   - Expo 토큰 재생성
   - GitHub Secrets 재설정

3. **메모리 부족**
   - GitHub Actions 리소스 제한
   - 로컬 빌드 시도

### 지원 채널
- [Expo 문서](https://docs.expo.dev)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [EAS Build 문서](https://docs.expo.dev/build/introduction/)

## 📈 모니터링

### 앱 사용량 추적
- Expo Analytics 설정
- 사용자 행동 분석
- 성능 모니터링

### 업데이트 관리
- 자동 업데이트 설정
- 버전 관리
- 롤백 전략

---

이 가이드를 따라하면 GitHub을 통해 앱을 성공적으로 배포할 수 있습니다! 