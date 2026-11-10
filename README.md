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
