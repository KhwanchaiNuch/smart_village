// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // ปรับ URL ให้ตรงกับ Spring Boot ของคุณ
  // ตัวอย่างจาก log ของคุณ: http://localhost:8082/smart_village
  apiBaseUrl: 'http://localhost:8082/smart_village/api',
};
