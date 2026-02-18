[![CI](https://github.com/javamain87/pace/actions/workflows/ci.yml/badge.svg)](https://github.com/javamain87/pace/actions/workflows/ci.yml) [![Vercel](https://vercel.com/javamain87s-projects/pace/badge) ](https://vercel.com/javamain87s-projects/pace)

# pace

A frontend app built with React, TypeScript, and Vite.

## Quick start

Prerequisites:
- Node.js (>=16)
- npm

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Scripts
Check `package.json` for available scripts (dev, build, preview, lint).

## Notes
- `dist/` is ignored from version control (build output).
- For CI, consider adding a workflow to install dependencies and run `npm run build`.


---

## Deployment summary (자동 생성된 배포 정리)

이 항목은 최근 프로젝트 배포와 관련된 요약입니다. 배포 기록, 사용한 브랜치, 빌드/배포 명령, 그리고 접속 URL을 포함합니다.

### GitHub 브랜치 요약
- main
  - 역할: 안정/프로덕션 기준 브랜치
  - 상태: README, .gitignore, CI(workflow) 포함. 현재 원격에 푸시된 안정 빌드 가능 상태.
- upgrade-deps
  - 역할: 안전한 의존성 업그레이드(특히 @typescript-eslint 관련)를 적용한 브랜치
  - 상태: 원격에 존재하며 PR로 검토/테스트 중 (PR #1)
- upgrade-deps-force
  - 역할: `npm audit fix --force`를 적용해 취약점 강제 수정 실험용 브랜치
  - 상태: 원격에 존재하며 PR로 검토/테스트 중 (PR #2)

### Vercel 배포 정보
- 배포 시 사용한 명령 (대행으로 실행됨):
  - `vercel --prod --yes`
- 빌드 명령 (프로젝트에 정의된 대로):
  - `npm run build` → 내부적으로 `tsc -b && vite build`
- 빌드 및 배포 로그(핵심):
  - Vite가 115 modules 변환, 프로덕션 번들 생성
  - 생성된 자산 예시:
    - `dist/index.html` (0.45 kB)
    - `dist/assets/index-*.css` (~23 kB, gzip ~5 kB)
    - `dist/assets/index-*.js` (~336 kB, gzip ~105 kB)
  - 빌드 성공: TypeScript 빌드 + Vite 번들링 성공
- Vercel 프로젝트: `javamain87s-projects/pace`
- Production URL (자동 생성):
  - https://pace-gdo1s2rfn-javamain87s-projects.vercel.app
- Aliased URL (읽기 쉬운 별칭):
  - https://pace-ecru.vercel.app

### CI / Workflow
- GitHub Actions workflow 추가 파일: `.github/workflows/ci.yml`
  - 동작: push/pull_request → npm ci → lint → test → npm run build → npm audit
- PR 템플릿: `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md` (체크리스트 포함)

### 배포 관련 권장사항 / 노트
- `/dist`는 빌드 산출물이므로 버전관리에서 제외함(.gitignore에 추가됨).
- major 버전 업그레이드(예: typescript-eslint 8.x) 등은 별도 브랜치에서 충분히 테스트 후 main에 병합해야 함.
- Vercel과 GitHub 연동(Preview Deploy)을 위해 Vercel 앱이 GitHub 리포지토리에 적절한 권한을 가지고 있는지 확인하세요.
- 커스텀 도메인 연결 시 DNS 레코드(예: CNAME 또는 A/ALIAS)를 도메인 제공자에 추가해야 하며 Vercel 대시보드에서 도메인 추가 후 검증을 진행하세요.

### 로컬에서 프로덕션 빌드 및 배포 재현 방법
1. 의존성 설치 (CI 방식)

```bash
npm ci
```

2. 타입 검사 및 빌드

```bash
npx tsc -b
npm run build
```

3. Vercel로 직접 배포(로컬에서 실행하려면 vercel CLI 설치 및 로그인 필요)

```bash
# vercel 설치(한번만)
npm i -g vercel
# vercel 로그인/토큰 설정
vercel login
# 프로덕션 배포
vercel --prod
```

### 배포 담당/문의
- 배포를 대행한 계정: GitHub 사용자 `javamain87`(로컬 CLI로 vercel 배포 수행)
- 문의: 이 저장소의 관리자 또는 작성자에게 연락

