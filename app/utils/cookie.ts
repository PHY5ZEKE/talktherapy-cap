function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = name + "=; Max-Age=0; path=/";
}

export { getCookie, deleteCookie };
