# iNote Web Apps

Cloudflare Workers Static Assets로 배포하는 개인 웹앱 포털입니다.

## 프로젝트 구성
- `index.html`: 통합 포털 (검색, 카테고리, 카드/리스트, 테마, 앱 업데이트 표시)
- `App/`: 개별 웹앱 HTML
- `apps.json`: 빌드 시 자동 생성되는 앱 카탈로그
- `scripts/build_catalog.js`: 앱 메타데이터를 읽어 카탈로그 생성
- `service-worker.js`: PWA 설치 및 오프라인 캐시
- `manifest.webmanifest`: PWA 설정

## 앱 버전 관리 규칙
- `1.0`: 기준 최초 버전
- `1.1`, `1.2` 등: 마이너 업데이트
- `2.0`, `3.0` 등: 메이저 업데이트
- 버전은 앱별 HTML 메타데이터에서 관리합니다.
- 파일명에는 버전 번호를 넣지 않습니다. 파일명은 앱의 기능을 나타내는 고정 이름으로 유지합니다.

각 앱의 `<head>`에 다음 메타데이터를 둡니다.

```html
<meta name="inote:version" content="1.0">
<meta name="inote:updated" content="2026-11-14">
<meta name="inote:changes" content="변경 사항 요약">
<meta name="inote:badge" content="">
<meta name="inote:badge-until" content="">
```

- `inote:badge`: `new`, `update`, 또는 빈 값
- `inote:badge-until`: 배지 표시 종료일 (`YYYY-MM-DD`)
- `inote:changes`: 포털 카드에서 보여줄 짧은 업데이트 내용
- 배지는 종료일이 지나면 자동으로 숨겨집니다.

## 앱 파일명 규칙
버전이 아닌 기능 중심의 고정 파일명을 사용합니다.
- `torque_converter.html`
- `torque_extension_calculator.html`
- `bolt_length_calculator.html`
- `resin_calculator.html`
- `triangle_solver.html`
- `pack_cover_calculator.html`
- `unit_converter.html`

## 새 웹앱 추가
1. HTML 파일을 `App/` 폴더에 추가합니다.
2. 위 메타데이터를 작성합니다.
3. `npm run build`를 실행하면 포털 목록에 자동 등록됩니다.
4. 목록에서 제외하려면 `inote:publish`를 `false`로 설정합니다.

## 개별 앱 업데이트
1. 해당 HTML 파일만 수정합니다.
2. 앱 버전을 규칙에 따라 올립니다.
3. `inote:updated`, `inote:changes`를 갱신합니다.
4. 변경 내용이 눈에 띄도록 일정 기간 `inote:badge`를 `update`로 설정합니다.
5. GitHub에 커밋하면 Cloudflare가 자동 빌드/배포합니다.

## 로컬 빌드
```bash
npm run build
```

## PWA 캐시
새 앱을 추가하거나 파일명을 변경하면 `service-worker.js`의 `PRECACHE_URLS`도 함께 갱신합니다.
캐시 버전 `CACHE_NAME`을 올리면 기존 iNote 캐시는 새 서비스 워커 활성화 시 정리됩니다.

현재 포털 배포 버전: `1.3.1`
개별 앱 버전은 각 앱 카드에 별도로 표시됩니다.


## v1.3.1 수정 사항
- 삭제된 text_converter.html의 사전 캐시 경로 제거
- 서비스 워커 캐시 버전 갱신으로 새 캐시 설치 및 기존 캐시 교체


## 앱별 업데이트 이력 및 버전 표시
- `app-history.json`에서 앱별 과거 버전과 변경 사항을 버전별로 누적 관리합니다.
- 포털 카드의 `업데이트 내역`을 누르면 버전, 날짜, 변경 내용을 확인할 수 있습니다.
- 각 개별 앱 하단에도 포털과 동일한 통합 버전 번호를 표시합니다.
- 버전 변경 시 HTML의 `inote:version`과 `app-history.json`의 최신 이력을 함께 갱신합니다.
