# KT 위치 문자 서비스 - 프론트엔드

## 프로젝트 구조
```
frontend/
├── app/
│   ├── components/         # 재사용 가능한 컴포넌트
│   ├── contexts/           # React Context (인증)
│   ├── api/               # API 라우트 (Next.js)
│   ├── dashboard/         # 대시보드 페이지
│   ├── login/             # 로그인 페이지
│   └── campaigns/         # 캠페인 관리 페이지
├── globals.css            # 전역 스타일
└── package.json           # 의존성 관리
```

## 기술 스택
- **Next.js 14** (React 프레임워크)
- **React 18**
- **Tailwind CSS** (스타일링)
- **Recharts** (차트 라이브러리)
- **Axios** (HTTP 클라이언트)
- **Leaflet** (지도 라이브러리)

## 실행 방법
```bash
npm install
npm run dev
```

개발 서버는 http://localhost:3000 에서 실행됩니다.

## 주요 파일 역할

### Pages
- `page.js` - 메인 페이지 (로그인 상태에 따라 리다이렉트)
- `login/page.js` - 로그인 페이지
- `signup/page.js` - 회원가입 페이지
- `dashboard/page.js` - 대시보드 (통계 차트, 캠페인 목록)
- `campaigns/new/page.js` - 새 캠페인 생성
- `wallet/page.js` - 포인트 관리
- `admin/customers/page.js` - 관리자 고객 관리

### Components
- `Navbar.js` - 상단 네비게이션 바
- `MapComponent.js` - 지도 기반 고객 선택
- `ProtectedRoute.js` - 인증이 필요한 라우트 보호

### Context
- `AuthContext.js` - 전역 사용자 인증 상태 관리

### API Routes
- `api/auth/` - 로그인/로그아웃 API 프록시
- `api/campaigns/` - 캠페인 관련 API 프록시
- `api/wallet/` - 지갑 관련 API 프록시
