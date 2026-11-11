# iNote Web Apps

Cloudflare Pages용 정적 웹앱 포털입니다.

## 구조
- `index.html`: 통합 포털
- `App/`: 개별 웹앱
- `apps.json`: 빌드 시 자동 생성되는 앱 카탈로그
- `scripts/build_catalog.js`: App 폴더를 검색해 카탈로그 생성
- `package.json`: 빌드 명령

## 로컬 빌드
Node.js가 설치된 환경에서 프로젝트 루트에서 실행합니다.

```bash
npm run build
```

빌드가 완료되면 `apps.json`이 생성됩니다. 로컬에서 확인할 때는 정적 파일 서버로 프로젝트 루트를 열어야 합니다. (file://로 index.html을 직접 열면 fetch가 제한될 수 있습니다.)

## 새 웹앱 추가
1. HTML 파일을 `App/` 또는 그 하위 폴더에 추가합니다.
2. HTML의 `<head>` 안에 아래 메타데이터를 작성합니다.

```html
<meta name="inote:title" content="앱 이름">
<meta name="inote:description" content="앱 설명">
<meta name="inote:category" content="Utility">
<meta name="inote:icon" content="🧰">
<meta name="inote:keywords" content="검색어1, 검색어2">
<meta name="inote:publish" content="true">
```

3. `npm run build`를 실행하면 포털 목록에 자동 반영됩니다.
4. 목록에서 숨기려면 `inote:publish` 값을 `false`로 변경합니다.

카테고리는 자유롭게 추가할 수 있습니다. 예: `Torque`, `Engineering`, `Utility`.

## Cloudflare Pages 배포 설정
GitHub 저장소에 프로젝트를 올린 뒤 Cloudflare Pages에서 Git 연동을 선택합니다.

- Framework preset: None
- Build command: `npm run build`
- Build output directory: `.`
- Root directory: 비워둠 (저장소 루트가 이 프로젝트인 경우)

이후 GitHub에 push할 때마다 빌드 및 배포가 자동 실행됩니다.

## 주의
- 앱 HTML의 계산 로직은 유지하고, 포털 메타데이터만 추가했습니다.
- 현재 카탈로그 생성은 HTML 파일만 검색합니다.
- 외부 CDN을 사용하는 앱은 방문자의 네트워크에서 해당 CDN에 접근할 수 있어야 합니다.


## 포털 기능 (v1.1.0)

### 테마 변경
- 우측 상단 달/해 버튼으로 라이트 모드와 다크 모드를 전환합니다.
- 선택한 테마는 브라우저 `localStorage`에 저장되어 다음 방문에도 유지됩니다.

### NEW / UPDATE 표시
앱 HTML의 `<head>`에 아래 메타데이터를 설정합니다.

```html
<meta name="inote:version" content="1.1">
<meta name="inote:updated" content="2026-11-11">
<meta name="inote:badge" content="new">
<meta name="inote:badge-until" content="2026-11-25">
```

- `inote:badge`: `new`, `update`, 또는 빈 값
- `inote:badge-until`: 배지가 표시될 마지막 날짜 (`YYYY-MM-DD`)
- 표시 기간이 지나면 포털에서 배지가 자동으로 숨겨집니다.
- 기존 앱은 실제 신규/업데이트가 아니므로 배지를 비워 두었습니다.
- 신규 앱은 `new`, 기존 앱의 기능 개선은 `update`로 설정하면 됩니다.


## v1.2.0 추가 기능

### 카드형 / 리스트형 보기
- 포털 우측 상단 보기 전환 버튼으로 카드형과 리스트형을 전환합니다.
- 선택한 보기 방식은 브라우저 localStorage에 저장됩니다.

### PWA 설치 및 오프라인 지원
- `manifest.webmanifest`: 앱 이름, 아이콘, 설치 화면 설정
- `service-worker.js`: 포털과 현재 등록된 웹앱 HTML을 캐시
- `assets/icon-192.png`, `assets/icon-512.png`: 설치 아이콘
- HTTPS 환경에서 서비스 워커가 등록됩니다.
- 온라인 상태에서 한 번 접속해 캐시가 만들어지면 포털과 현재 포함된 웹앱을 오프라인에서도 열 수 있습니다.
- 외부 CDN/API에 의존하는 일부 기능은 오프라인에서 동작하지 않을 수 있습니다.

### 앱 설치
- 지원 브라우저에서는 상단 `설치` 버튼이 나타납니다.
- 버튼이 나타나지 않는 경우 브라우저 메뉴의 `앱 설치` 또는 `홈 화면에 추가`를 이용하세요.
- iOS Safari는 공유 메뉴 → 홈 화면에 추가를 이용합니다.

### 새 버전 배포
서비스 워커 캐시를 갱신하려면 `service-worker.js`의 `CACHE_NAME` 값을 새 버전으로 올립니다. 새 배포 후 브라우저가 새 서비스 워커를 설치하면 이전 iNote 캐시는 자동 삭제됩니다.
