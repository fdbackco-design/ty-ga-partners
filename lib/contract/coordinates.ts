// pdf-lib 좌표계: 좌측 하단이 원점 (0,0), 단위 pt. A4 595.32 x 841.92
// TODO: 실제 좌표는 debug=coords 모드로 눈으로 맞출 것
export const PAGE_HEIGHT = 841.92;

export type TextField = { x: number; y: number; size: number; maxWidth?: number };
export type ImageField = { x: number; y: number; w: number; h: number };

export const FIELD_COORDS = {
  page10: {
    empConfirmSign: { x: 482, y: 377, w: 70, h: 35 } satisfies ImageField,
    partyName: { x: 147.8, y: 142.5, size: 10, maxWidth: 250 } satisfies TextField,
    partySsn: { x: 147.8, y: 125.0, size: 10, maxWidth: 250 } satisfies TextField,
    partySign: { x: 481, y: 123, w: 70, h: 35 } satisfies ImageField,
    contractDate: { x: 412, y: 93.5, size: 10, maxWidth: 140 } satisfies TextField,
  },
  page20: {
    name: { x: 160, y: 435.2, size: 10, maxWidth: 360 } satisfies TextField,
    ssn: { x: 160, y: 405.3, size: 10, maxWidth: 360 } satisfies TextField,
    address: { x: 160, y: 375.4, size: 9, maxWidth: 360 } satisfies TextField,
    phone: { x: 160, y: 345.5, size: 10, maxWidth: 360 } satisfies TextField,
    bankName: { x: 160, y: 315.8, size: 10, maxWidth: 360 } satisfies TextField,
    accountNo: { x: 160, y: 285.9, size: 10, maxWidth: 360 } satisfies TextField,
    accountHolder: { x: 160, y: 256.0, size: 10, maxWidth: 360 } satisfies TextField,
    bizRegNo: { x: 160, y: 226.1, size: 10, maxWidth: 360 } satisfies TextField,
    agreeYes: { x: 44.4, y: 492.6, size: 12 } satisfies TextField,
    sign: { x: 360, y: 172, w: 90, h: 40 } satisfies ImageField,
  },
} as const;
