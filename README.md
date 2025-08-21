# KT 위치 문자 서비스 - 프론트엔드

## 프로젝트 구조
```
frontend/
├── app/
│   ├── components/         # 재사용 가능한 컴포넌트
│   ├── contexts/           # React Context (인증)
│   ├── api/               # API 라우트 (Next.js)
│   ├── dashboard/         # 대시보드 페이지 (통계, 차트)
│   ├── campaigns/         # 캠페인 관리 페이지
│   ├── admin/             # 관리자 전용 페이지
│   ├── customer-messages/ # 고객 메시지 확인 페이지
│   ├── alerts/            # 알림 페이지
│   ├── wallet/            # 포인트 관리 페이지
│   ├── login/             # 로그인 페이지
│   └── signup/            # 회원가입 페이지
├── globals.css            # 전역 스타일
└── package.json           # 의존성 관리
```

## 기술 스택
- **Next.js 14** (React 프레임워크)
- **React 18**
- **Tailwind CSS** (스타일링)
- **Recharts** (차트 라이브러리)
- **Leaflet** (지도 라이브러리)

## 주요 기능
- **사용자 인증**: JWT 기반 로그인/회원가입
- **대시보드**: 실시간 캠페인 통계 및 차트 (날짜 필터링)
- **캠페인 관리**: 생성, 미리보기, 발송, 상세 통계
- **고객 관리**: 관리자 전용 고객 목록 (ID 순 정렬)
- **포인트 시스템**: 충전 및 거래 내역 조회
- **메시지 추적**: 고객의 메시지 읽음/클릭 상태 확인
- **알림 시스템**: 완료된 캠페인 알림

## 실행 방법
```bash
npm install
npm run dev
```

개발 서버는 http://localhost:3000 에서 실행됩니다.

## 주요 코드 파일 설명

### Pages (페이지 컴포넌트)
- **page.js**: 메인 페이지 (로그인 상태에 따라 리다이렉트)
- **login/page.js**: 로그인 페이지 (KT 위치 문자 서비스 브랜딩)
- **signup/page.js**: 회원가입 페이지 (KT 위치 문자 서비스 브랜딩)
- **dashboard/page.js**: 대시보드 (실시간 통계, 날짜 필터링, 나이대별 분포 차트)
- **campaigns/new/page.js**: 새 캠페인 생성 (위치 기반 필터링)
- **campaigns/[id]/stats/page.js**: 캠페인 상세 통계 (시간별 성과)
- **wallet/page.js**: 포인트 관리 (충전, 거래 내역)
- **admin/customers/page.js**: 관리자 고객 관리 (ID 순 정렬, 수정/삭제)
- **customer-messages/page.js**: 고객 메시지 확인 (읽음/클릭 상태 실시간 업데이트)
- **alerts/page.js**: 알림 페이지 (실제 캠페인 데이터 기반)

### Components (재사용 컴포넌트)
- **Navbar.js**: 상단 네비게이션 바 (역할별 메뉴 제어, 서비스명 통일)
- **MapComponent.js**: 지도 기반 고객 선택 (Leaflet 사용)
- **ProtectedRoute.js**: 인증 및 권한 기반 라우트 보호 (관리자 제한)

### Context (상태 관리)
- **AuthContext.js**: 전역 사용자 인증 상태 관리 (JWT 토큰, 사용자 정보)

### API Routes (Next.js API)
- **api/auth/**: 로그인/로그아웃/회원가입 API 프록시
- **api/campaigns/**: 캠페인 관련 API 프록시 (생성, 조회, 통계)
- **api/wallet/**: 지갑 관련 API 프록시 (충전, 잔액, 거래내역)
- **api/customer/**: 고객 메시지 API 프록시
- **api/admin/**: 관리자 API 프록시

## 브랜딩 및 UI/UX
- **서비스명**: "KT 위치 문자 서비스"로 통일
- **반응형 디자인**: 모바일 및 데스크탑 지원
- **실시간 업데이트**: 메시지 상태 변경 시 즉시 반영
- **사용자 역할별 UI**: 일반 사용자와 관리자 구분
- **차트 시각화**: 캠페인 성과를 직관적으로 표시

## 특별 기능
- **클라이언트 사이드 필터링**: 대시보드 날짜 필터링 성능 최적화
- **JPA 캐시 관리**: 메시지 상태 업데이트 실시간 반영
- **권한 기반 네비게이션**: 관리자는 고객 관리만 접근 가능
- **동적 차트**: 나이대별 성별 분포 그래프 (10개 막대)