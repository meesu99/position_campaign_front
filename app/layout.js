'use client';

import './globals.css';
import { AuthProvider } from './contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
        <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=78c6ec95f4fada914962a2062dca6cfe&libraries=services"></script>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
