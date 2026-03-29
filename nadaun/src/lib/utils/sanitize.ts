const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** 파일명에 안전한 문자만 허용 (한글, 영문, 숫자, 공백, 하이픈) */
export function sanitizeFilename(name: string): string {
  return name.replace(/[^\w가-힣\s-]/g, '').slice(0, 100)
}

/** UUID v4 형식 검증 */
export function isValidUUID(value: string): boolean {
  return UUID_RE.test(value)
}
